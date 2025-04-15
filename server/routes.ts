import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { processChatMessage } from "./api/chat";

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix all routes with /api
  
  // Config endpoint to safely expose necessary environment variables to the client
  app.get('/api/config', (req, res) => {
    console.log('MapBox token available:', Boolean(process.env.MAPBOX_TOKEN));
    res.json({
      mapboxToken: process.env.MAPBOX_TOKEN || '',
    });
  });
  
  // Chat API endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, userMessage } = req.body;
      
      if (!userMessage || typeof userMessage !== 'string') {
        return res.status(400).json({ message: 'Invalid message format. userMessage is required.' });
      }
      
      // Process the chat message with OpenAI
      const response = await processChatMessage(messages, userMessage);
      
      // Return the AI response
      res.json(response);
    } catch (error) {
      console.error('Error in chat endpoint:', error);
      res.status(500).json({ 
        message: 'An error occurred while processing your request',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
