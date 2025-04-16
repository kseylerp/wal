import { db } from './db';
import { users, trips, type User, type InsertUser, type Trip, type InsertTrip } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import { pool } from './db';
import { randomUUID } from 'crypto';

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Trip methods
  getTripsByUserId(userId: number): Promise<Trip[]>;
  getTrip(id: number): Promise<Trip | undefined>;
  getTripByShareableId(shareableId: string): Promise<Trip | undefined>;
  createTrip(trip: InsertTrip): Promise<Trip>;
  updateTrip(id: number, trip: Partial<InsertTrip>): Promise<Trip | undefined>;
  deleteTrip(id: number): Promise<boolean>;
  shareTrip(id: number): Promise<Trip | undefined>;
  unshareTrip(id: number): Promise<Trip | undefined>;
  
  // Session store
  sessionStore: any; // Using any for SessionStore type
}

export class DatabaseStorage implements IStorage {
  sessionStore: any; // Using any for SessionStore type
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true,
      tableName: 'session'
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }
  
  // Trip methods
  async getTripsByUserId(userId: number): Promise<Trip[]> {
    return await db.select().from(trips).where(eq(trips.userId, userId)).orderBy(desc(trips.createdAt));
  }
  
  async getTrip(id: number): Promise<Trip | undefined> {
    const result = await db.select().from(trips).where(eq(trips.id, id));
    return result[0];
  }
  
  async createTrip(trip: InsertTrip): Promise<Trip> {
    const tripWithTimestamp = {
      ...trip,
      createdAt: new Date().toISOString()
    };
    const result = await db.insert(trips).values(tripWithTimestamp).returning();
    return result[0];
  }
  
  async updateTrip(id: number, trip: Partial<InsertTrip>): Promise<Trip | undefined> {
    const result = await db
      .update(trips)
      .set(trip)
      .where(eq(trips.id, id))
      .returning();
      
    return result[0];
  }
  
  async deleteTrip(id: number): Promise<boolean> {
    const result = await db
      .delete(trips)
      .where(eq(trips.id, id))
      .returning({ id: trips.id });
    
    return result.length > 0;
  }
  
  async getTripByShareableId(shareableId: string): Promise<Trip | undefined> {
    try {
      const result = await db
        .select()
        .from(trips)
        .where(eq(trips.shareableId, shareableId))
        .execute();
        
      const trip = result.length > 0 ? result[0] : undefined;
      
      // Only return the trip if it's public
      return trip && trip.isPublic ? trip : undefined;
    } catch (error) {
      console.error('Error fetching trip by shareableId:', error);
      return undefined;
    }
  }
  
  async shareTrip(id: number): Promise<Trip | undefined> {
    // Generate a unique shareable ID
    const shareableId = randomUUID();
    
    const result = await db
      .update(trips)
      .set({ 
        shareableId,
        isPublic: true 
      })
      .where(eq(trips.id, id))
      .returning();
    
    return result[0];
  }
  
  async unshareTrip(id: number): Promise<Trip | undefined> {
    const result = await db
      .update(trips)
      .set({ 
        isPublic: false 
      })
      .where(eq(trips.id, id))
      .returning();
    
    return result[0];
  }
}

export const storage = new DatabaseStorage();
