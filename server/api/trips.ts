import { Router } from 'express';
import { storage } from '../storage';
import { insertTripSchema, Trip } from '@shared/schema';
import { z } from 'zod';

export const tripsRouter = Router();

// Get all trips for the current user
tripsRouter.get('/', async (req, res) => {
  try {
    if (!req.isAuthenticated() || !req.user?.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const trips = await storage.getTripsByUserId(req.user.id);
    res.json(trips);
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ message: 'Failed to fetch trips' });
  }
});

// Get a specific trip
tripsRouter.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid trip ID' });
    }

    const trip = await storage.getTrip(id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    // Check if the trip belongs to the current user
    if (trip.userId !== req.user?.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(trip);
  } catch (error) {
    console.error('Error fetching trip:', error);
    res.status(500).json({ message: 'Failed to fetch trip' });
  }
});

// Create a new trip
tripsRouter.post('/', async (req, res) => {
  try {
    if (!req.isAuthenticated() || !req.user?.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const parsedData = insertTripSchema.parse({
      ...req.body,
      userId: req.user.id
    });
    
    const newTrip = await storage.createTrip(parsedData);
    res.status(201).json(newTrip);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Invalid trip data', 
        errors: error.errors 
      });
    }
    
    console.error('Error creating trip:', error);
    res.status(500).json({ message: 'Failed to create trip' });
  }
});

// Update a trip
tripsRouter.patch('/:id', async (req, res) => {
  try {
    if (!req.isAuthenticated() || !req.user?.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid trip ID' });
    }
    
    // Check if the trip exists and belongs to the user
    const existingTrip = await storage.getTrip(id);
    if (!existingTrip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    if (existingTrip.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Update the trip
    const updatedTrip = await storage.updateTrip(id, req.body);
    res.json(updatedTrip);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Invalid trip data', 
        errors: error.errors 
      });
    }
    
    console.error('Error updating trip:', error);
    res.status(500).json({ message: 'Failed to update trip' });
  }
});

// Delete a trip
tripsRouter.delete('/:id', async (req, res) => {
  try {
    if (!req.isAuthenticated() || !req.user?.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid trip ID' });
    }
    
    // Check if the trip exists and belongs to the user
    const existingTrip = await storage.getTrip(id);
    if (!existingTrip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    if (existingTrip.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Delete the trip
    const deleted = await storage.deleteTrip(id);
    if (deleted) {
      res.status(204).end();
    } else {
      res.status(500).json({ message: 'Failed to delete trip' });
    }
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({ message: 'Failed to delete trip' });
  }
});