import { useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { Cloud, Sun, Droplet, Snowflake, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { fetchCurrentWeather, WeatherData, getWeatherColor, formatTemperature } from '@/lib/weatherService';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);

  // Fetch weather data when location changes
  useEffect(() => {
    if (!location || !map) return;
    
    const fetchWeather = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await fetchCurrentWeather(location[1], location[0]);
        
        if (data) {
          setWeatherData(data);
          if (onWeatherDataLoaded) {
            onWeatherDataLoaded(data);
          }
        } else {
          setError('Unable to fetch weather data');
        }
      } catch (err) {
        setError('Error loading weather data');
        console.error('Weather data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWeather();
  }, [location, map, onWeatherDataLoaded]);

  // Apply weather overlay to map
  useEffect(() => {
    if (!map || !weatherData || !showOverlay) return;
    
    // If the weather layer already exists, remove it first
    if (map.getSource('weather-source')) {
      map.removeLayer('weather-layer');
      map.removeSource('weather-source');
    }
    
    const conditionCode = weatherData.current.condition.code;
    const weatherColor = getWeatherColor(conditionCode);
    
    // Add a circular weather overlay around the location
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
    
    map.addLayer({
      id: 'weather-layer',
      type: 'circle',
      source: 'weather-source',
      paint: {
        'circle-radius': 40,
        'circle-color': weatherColor,
        'circle-opacity': 0.4,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#ffffff'
      }
    });
    
    return () => {
      // Cleanup when component unmounts or changes
      if (map.getSource('weather-source')) {
        map.removeLayer('weather-layer');
        map.removeSource('weather-source');
      }
    };
  }, [map, weatherData, location, showOverlay]);

  // Get appropriate weather icon
  const getWeatherIcon = () => {
    if (!weatherData) return <Cloud className="h-5 w-5" />;
    
    const code = weatherData.current.condition.code;
    
    // Clear, sunny
    if (code === 1000) return <Sun className="h-5 w-5 text-amber-500" />;
    
    // Rain or drizzle
    if ((code >= 1063 && code <= 1069) || (code >= 1150 && code <= 1201)) 
      return <Droplet className="h-5 w-5 text-blue-500" />;
    
    // Snow
    if ((code >= 1114 && code <= 1117) || (code >= 1210 && code <= 1225)) 
      return <Snowflake className="h-5 w-5 text-cyan-500" />;
    
    // Default - cloudy or other
    return <Cloud className="h-5 w-5 text-gray-500" />;
  };
  
  const toggleWeatherOverlay = () => {
    setShowOverlay(!showOverlay);
  };

  return (
    <div className="absolute top-3 right-3 z-10">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className={`bg-white shadow-md ${showOverlay ? 'border-blue-500' : ''}`}
              onClick={toggleWeatherOverlay}
              disabled={isLoading || !weatherData}
            >
              {isLoading ? (
                <span className="animate-pulse">Loading...</span>
              ) : (
                <div className="flex items-center gap-2">
                  {getWeatherIcon()}
                  {weatherData && (
                    <div className="text-xs flex flex-col items-start">
                      <span>{formatTemperature(weatherData.current.temp_f)}</span>
                      {showOverlay && <span className="text-[10px]">{weatherData.current.condition.text}</span>}
                    </div>
                  )}
                </div>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {showOverlay 
              ? 'Hide weather overlay' 
              : 'Show weather overlay'
            }
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {error && (
        <div className="mt-2 p-2 bg-red-100 text-red-800 text-xs rounded shadow-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default WeatherOverlay;