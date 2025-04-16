import React, { useEffect, useState } from 'react';
import { fetchCurrentWeather, getWeatherColor, WeatherData } from '@/lib/weatherService';

interface WeatherOverlayProps {
  map: mapboxgl.Map | null;
  location: [number, number]; // [longitude, latitude]
  onWeatherDataLoaded?: (data: WeatherData) => void;
}

export const WeatherOverlay: React.FC<WeatherOverlayProps> = ({ 
  map, 
  location,
  onWeatherDataLoaded 
}) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load weather data when component mounts or location changes
  useEffect(() => {
    if (!map || !location) return;

    const fetchWeather = async () => {
      try {
        // Fetch weather data for the current location
        const data = await fetchCurrentWeather(location[1], location[0]);
        
        if (data) {
          setWeatherData(data);
          if (onWeatherDataLoaded) onWeatherDataLoaded(data);
          addWeatherLayer(data);
        } else {
          setError('Unable to load weather data');
        }
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError('Error loading weather data');
      }
    };

    fetchWeather();

    return () => {
      // Clean up layers when component unmounts
      if (map) {
        if (map.getLayer('weather-overlay')) map.removeLayer('weather-overlay');
        if (map.getSource('weather-source')) map.removeSource('weather-source');
      }
    };
  }, [map, location, onWeatherDataLoaded]);

  // Add weather visualization layer to map
  const addWeatherLayer = (data: WeatherData) => {
    if (!map) return;
    
    // Remove existing weather layers and sources if they exist
    if (map.getLayer('weather-overlay')) map.removeLayer('weather-overlay');
    if (map.getSource('weather-source')) map.removeSource('weather-source');
    
    // Get appropriate color for the current weather condition
    const weatherColor = getWeatherColor(data.current.condition.code);
    
    // Create a circular gradient for weather visualization
    map.addSource('weather-source', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: location
        }
      }
    });
    
    // Add a circle layer with a gradient fill
    map.addLayer({
      id: 'weather-overlay',
      type: 'circle',
      source: 'weather-source',
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 
          6, 20000, // At zoom level 6, radius is 20000 meters
          10, 10000, // At zoom level 10, radius is 10000 meters
          14, 5000  // At zoom level 14, radius is 5000 meters
        ],
        'circle-color': weatherColor,
        'circle-opacity': 0.3,
        'circle-blur': 0.8,
        'circle-stroke-width': 1,
        'circle-stroke-color': weatherColor,
        'circle-stroke-opacity': 0.5
      }
    });
  };

  return null; // This component doesn't render any UI elements directly
};

export default WeatherOverlay;