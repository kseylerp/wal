import { Router } from 'express';

export const weatherRouter = Router();

// We'll need a weather API key for this functionality
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

// Current weather endpoint
weatherRouter.get('/', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    
    if (!WEATHER_API_KEY) {
      return res.status(500).json({ error: 'Weather API key is not configured' });
    }
    
    // WeatherAPI.com endpoint for current weather
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${lat},${lng}&aqi=no`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }
    
    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Weather forecast endpoint
weatherRouter.get('/forecast', async (req, res) => {
  try {
    const { lat, lng, days = 3 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    
    if (!WEATHER_API_KEY) {
      return res.status(500).json({ error: 'Weather API key is not configured' });
    }
    
    // WeatherAPI.com endpoint for forecast
    const response = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${lat},${lng}&days=${days}&aqi=no&alerts=no`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }
    
    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    return res.status(500).json({ error: 'Failed to fetch weather forecast' });
  }
});

// Historical weather data for a specific date (useful for trip planning)
weatherRouter.get('/historical', async (req, res) => {
  try {
    const { lat, lng, date } = req.query;
    
    if (!lat || !lng || !date) {
      return res.status(400).json({ 
        error: 'Latitude, longitude, and date are required',
        message: 'Date should be in YYYY-MM-DD format' 
      });
    }
    
    if (!WEATHER_API_KEY) {
      return res.status(500).json({ error: 'Weather API key is not configured' });
    }
    
    // WeatherAPI.com endpoint for historical weather
    const response = await fetch(
      `https://api.weatherapi.com/v1/history.json?key=${WEATHER_API_KEY}&q=${lat},${lng}&dt=${date}`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }
    
    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error('Error fetching historical weather data:', error);
    return res.status(500).json({ error: 'Failed to fetch historical weather data' });
  }
});