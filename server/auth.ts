import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { User as SelectUser, users } from "@shared/schema";

// Extend Express.User with our user type
declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

// Utility functions for password hashing and verification
const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Session configuration
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "wallytravelsecret", // Use environment variable in production
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
    store: storage.sessionStore,
  };

  // Setup session middleware
  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Passport Local Strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username or password" });
        }
        
        const isValidPassword = await comparePasswords(password, user.password);
        if (!isValidPassword) {
          return done(null, false, { message: "Incorrect username or password" });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  // Serialize & deserialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Authentication routes
  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Check if email exists by querying users with the same email
      const usersWithEmail = await db.select().from(users).where(eq(users.email, req.body.email));
      if (usersWithEmail.length > 0) {
        return res.status(400).json({ message: "Email already in use" });
      }

      // Create user with hashed password
      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
      });

      // Log user in after registration
      req.login(user, (err) => {
        if (err) return next(err);
        // Return user without password
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: Express.User, info: { message?: string }) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      
      req.login(user, (err) => {
        if (err) return next(err);
        // Return user without password
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // Return user without password
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });

  // Trip routes related to the current user
  app.get("/api/trips", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const trips = await storage.getTripsByUserId(req.user.id);
      res.json(trips);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/trips", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const trip = await storage.createTrip({
        ...req.body,
        userId: req.user.id,
      });
      res.status(201).json(trip);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/trips/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const tripId = parseInt(req.params.id);
      
      // First check if the trip belongs to the user
      const trip = await storage.getTrip(tripId);
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }
      
      if (trip.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to delete this trip" });
      }
      
      const success = await storage.deleteTrip(tripId);
      if (success) {
        res.status(200).json({ message: "Trip deleted successfully" });
      } else {
        res.status(404).json({ message: "Trip not found" });
      }
    } catch (error) {
      next(error);
    }
  });
}