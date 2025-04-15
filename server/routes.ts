import type { Express } from "express";
import { createServer, type Server } from "http";
import crypto from "crypto";
import { storage } from "./storage";
import { processChatMessage } from "./api/chat";
import { getTripPlans } from "./api/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix all routes with /api
  
  // Config endpoint to safely expose necessary environment variables to the client
  app.get('/api/config', (req, res) => {
    console.log('MapBox token available:', Boolean(process.env.MAPBOX_PUBLIC_TOKEN));
    res.json({
      mapboxToken: process.env.MAPBOX_PUBLIC_TOKEN || '',
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
  
  // Trip planning endpoint using OpenAI assistant
  app.post("/api/trip-plans", async (req, res) => {
    try {
      const { query } = req.body;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: "Missing or invalid query parameter" });
      }
      
      const openaiKey = process.env.OPENAI_API_KEY;
      if (!openaiKey) {
        return res.status(500).json({ error: "OpenAI API key not available. Please set OPENAI_API_KEY environment variable." });
      }
      
      console.log("Generating trip plan for query:", query);
      const tripPlans = await getTripPlans(query);
      
      res.json(tripPlans);
    } catch (error: any) {
      console.error('Error generating trip plans:', error);
      res.status(500).json({ 
        error: "Failed to generate trip plans", 
        message: error.message || "Unknown error"
      });
    }
  });
  
  // Proxy endpoint for MapBox Directions API
  app.get('/api/directions', async (req, res) => {
    try {
      // Extract parameters from query
      const { profile, coordinates } = req.query;
      
      if (!profile || !coordinates) {
        return res.status(400).json({ 
          error: "Missing required parameters: profile and coordinates" 
        });
      }
      
      // Validate profile
      if (!['driving', 'walking', 'cycling'].includes(profile as string)) {
        return res.status(400).json({ 
          error: "Invalid profile. Must be one of: driving, walking, cycling" 
        });
      }
      
      // Get MapBox token
      const token = process.env.MAPBOX_TOKEN || process.env.MAPBOX_PUBLIC_TOKEN;
      if (!token) {
        return res.status(500).json({ error: "MapBox token not configured" });
      }
      
      // Build MapBox Directions API URL
      const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordinates}?geometries=geojson&steps=true&access_token=${token}`;
      
      // Fetch data from MapBox API
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        return res.status(response.status).json({ 
          error: "MapBox Directions API error", 
          details: errorData 
        });
      }
      
      const data = await response.json();
      
      // Return the data to the client
      res.json(data);
    } catch (error) {
      console.error("Error proxying request to MapBox Directions API:", error);
      res.status(500).json({ 
        error: "Failed to fetch directions data",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
