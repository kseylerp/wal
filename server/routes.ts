import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createTripSuggestion } from "./controllers/tripController";

export async function registerRoutes(app: Express): Promise<Server> {
  // Trip planning chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, sessionId = 'default' } = req.body;
      
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }
      
      const response = await createTripSuggestion(message, sessionId);
      res.json(response);
    } catch (error) {
      console.error("Error in chat endpoint:", error);
      res.status(500).json({ 
        error: "Failed to process your request",
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
