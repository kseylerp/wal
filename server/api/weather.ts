import { Router } from 'express';

export const weatherRouter = Router();

/**
 * Fetches current weather data for a specific location
 * GET /api/weather/current?lat=<latitude>&lng=<longitude>
 */
weatherRouter.get('/current', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Missing required parameters: lat and lng' });
    }
    
    // Validate latitude and longitude
    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ error: 'Invalid coordinates. Latitude and longitude must be numbers.' });
    }
    
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ error: 'Coordinates out of range. Latitude must be between -90 and 90, and longitude between -180 and 180.' });
    }
    
    try {
      // Fetch weather data from WeatherAPI
      // This uses free-tier Weather API (https://www.weatherapi.com/)
      const apiKey = process.env.WEATHER_API_KEY || '5ee7231d59be499c85f211534233012'; // Default key for development
      const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${latitude},${longitude}&aqi=no`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.text();
        return res.status(response.status).json({
          error: 'Weather API error',
          details: errorData
        });
      }
      
      const data = await response.json();
      
      // Return the data to the client
      res.json(data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      res.status(500).json({
        error: 'Failed to fetch weather data',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  } catch (error) {
    console.error('Unexpected error in weather endpoint:', error);
    res.status(500).json({
      error: 'An unexpected error occurred',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Fetches weather forecast data for a specific location
 * GET /api/weather/forecast?lat=<latitude>&lng=<longitude>&days=<days>
 */
weatherRouter.get('/forecast', async (req, res) => {
  try {
    const { lat, lng, days = 3 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Missing required parameters: lat and lng' });
    }
    
    // Validate latitude and longitude
    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);
    const forecastDays = Math.min(Math.max(parseInt(days as string, 10) || 3, 1), 7); // Limit between 1-7 days
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ error: 'Invalid coordinates. Latitude and longitude must be numbers.' });
    }
    
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ error: 'Coordinates out of range. Latitude must be between -90 and 90, and longitude between -180 and 180.' });
    }
    
    try {
      // Fetch forecast data from WeatherAPI
      const apiKey = process.env.WEATHER_API_KEY || '5ee7231d59be499c85f211534233012'; // Default key for development
      const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${latitude},${longitude}&days=${forecastDays}&aqi=no&alerts=no`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.text();
        return res.status(response.status).json({
          error: 'Weather API error',
          details: errorData
        });
      }
      
      const data = await response.json();
      
      // Return the data to the client
      res.json(data);
    } catch (error) {
      console.error('Error fetching forecast data:', error);
      res.status(500).json({
        error: 'Failed to fetch forecast data',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  } catch (error) {
    console.error('Unexpected error in forecast endpoint:', error);
    res.status(500).json({
      error: 'An unexpected error occurred',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});