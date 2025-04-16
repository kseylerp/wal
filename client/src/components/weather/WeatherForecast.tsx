import React, { useEffect, useState } from 'react';
import { 
  fetchWeatherForecast, 
  formatTemperature,
  formatForecastDate,
  getPrecipitationDescription,
  WeatherData
} from '@/lib/weatherService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  Wind, 
  Droplets, 
  ThermometerSun, 
  ThermometerSnowflake, 
  X 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface WeatherForecastProps {
  location: [number, number]; // [longitude, latitude]
  locationName?: string;
  days?: number; // Number of forecast days
  onClose?: () => void;
}

export const WeatherForecast: React.FC<WeatherForecastProps> = ({
  location,
  locationName,
  days = 3,
  onClose
}) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        setLoading(true);
        const data = await fetchWeatherForecast(location[1], location[0], days);
        setWeatherData(data);
      } catch (err) {
        console.error('Error fetching weather forecast:', err);
        setError('Unable to load weather forecast');
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [location, days]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4 flex justify-center items-center min-h-[200px]">
          <div className="animate-pulse flex flex-col items-center">
            <Cloud className="h-10 w-10 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">Loading weather data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !weatherData) {
    return (
      <Card className="w-full">
        <CardContent className="p-4 flex justify-center items-center min-h-[200px]">
          <div className="flex flex-col items-center">
            <Cloud className="h-10 w-10 text-gray-300 mb-2" />
            <p className="text-sm text-red-500">{error || 'Unable to load weather data'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { current, forecast, location: weatherLocation } = weatherData;
  const displayName = locationName || weatherLocation.name;

  // Choose the appropriate weather icon based on condition code
  const getWeatherIcon = (code: number, size: number = 5) => {
    // Clear, sunny
    if (code === 1000) return <Sun className={`h-${size} w-${size} text-amber-500`} />;
    
    // Partly cloudy, cloudy
    if (code >= 1003 && code <= 1030) return <Cloud className={`h-${size} w-${size} text-gray-500`} />;
    
    // Rain, drizzle
    if ((code >= 1063 && code <= 1069) || (code >= 1150 && code <= 1201)) 
      return <CloudRain className={`h-${size} w-${size} text-blue-500`} />;
    
    // Snow, sleet
    if ((code >= 1114 && code <= 1117) || (code >= 1210 && code <= 1225)) 
      return <CloudSnow className={`h-${size} w-${size} text-gray-400`} />;
    
    // Thunderstorm
    if (code >= 1273 && code <= 1282) return <CloudRain className={`h-${size} w-${size} text-indigo-500`} />;
    
    // Default
    return <Cloud className={`h-${size} w-${size} text-gray-500`} />;
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="pb-2 pt-4 flex flex-row justify-between items-center">
        <div>
          <CardTitle className="text-lg">{displayName} Weather</CardTitle>
          <p className="text-sm text-gray-500">
            {new Date(weatherLocation.localtime).toLocaleString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })}
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="pt-2 pb-4">
        {/* Current Weather */}
        <div className="mb-4 flex items-center">
          <div className="flex items-center justify-center mr-4">
            {getWeatherIcon(current.condition.code, 10)}
          </div>
          <div>
            <div className="text-3xl font-bold">
              {formatTemperature(current.temp_f, 'F')}
            </div>
            <div className="text-sm text-gray-500">
              {current.condition.text}
            </div>
            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
              <div className="flex items-center">
                <ThermometerSun className="h-3.5 w-3.5 mr-1 text-amber-500" />
                Feels like: {formatTemperature(current.feelslike_f, 'F')}
              </div>
              <div className="flex items-center">
                <Wind className="h-3.5 w-3.5 mr-1 text-blue-400" />
                Wind: {current.wind_mph} mph {current.wind_dir}
              </div>
            </div>
          </div>
        </div>
        
        <Separator className="my-3" />

        {/* Forecast Tabs */}
        {forecast && forecast.forecastday.length > 0 && (
          <Tabs defaultValue="day-0">
            <TabsList className="w-full grid grid-cols-3 mb-2">
              {forecast.forecastday.map((day, index) => (
                <TabsTrigger 
                  key={day.date} 
                  value={`day-${index}`}
                  className="text-xs"
                >
                  {formatForecastDate(day.date)}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {forecast.forecastday.map((day, index) => (
              <TabsContent key={`content-${day.date}`} value={`day-${index}`} className="px-1">
                <div className="grid grid-cols-2 gap-4">
                  {/* Day Overview */}
                  <div className="flex flex-col">
                    <div className="flex items-center mb-2">
                      {getWeatherIcon(day.day.condition.code, 6)}
                      <div className="ml-2">
                        <div className="text-sm font-medium">{day.day.condition.text}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <ThermometerSun className="h-3 w-3 text-amber-500" />
                          <span>High: {formatTemperature(day.day.maxtemp_f, 'F')}</span>
                          <ThermometerSnowflake className="h-3 w-3 ml-1 text-blue-500" />
                          <span>Low: {formatTemperature(day.day.mintemp_f, 'F')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex items-center">
                        <Droplets className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
                        <span>
                          {getPrecipitationDescription(
                            day.day.daily_chance_of_rain,
                            day.day.daily_chance_of_snow
                          )}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Sun className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
                        <span>Sunrise: {day.astro.sunrise}</span>
                      </div>
                      <div className="flex items-center">
                        <Moon className="h-3.5 w-3.5 mr-1.5 text-indigo-400" />
                        <span>Sunset: {day.astro.sunset}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Hourly Forecast Preview */}
                  <div className={cn(
                    "grid gap-1", 
                    isMobile ? "grid-cols-2" : "grid-cols-3"
                  )}>
                    {day.hour
                      .filter((_, i) => i % 6 === 0) // show every 6 hours
                      .map((hour, i) => (
                        <div key={i} className="bg-gray-50 p-1.5 rounded text-center">
                          <div className="text-xs font-medium">
                            {new Date(hour.time).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              hour12: true
                            })}
                          </div>
                          <div className="flex justify-center my-1">
                            {getWeatherIcon(hour.condition.code, 4)}
                          </div>
                          <div className="text-xs">
                            {formatTemperature(hour.temp_f, 'F')}
                          </div>
                          <div className="text-xs text-blue-500">
                            {hour.chance_of_rain}%
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

// Missing Moon component - adding it here for completeness
const Moon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
};

export default WeatherForecast;