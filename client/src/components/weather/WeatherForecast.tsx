import { useState, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { fetchWeatherForecast, WeatherData, formatTemperature } from '@/lib/weatherService';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (!location) return;
    
    const fetchForecast = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await fetchWeatherForecast(location[1], location[0], days);
        
        if (data) {
          setWeatherData(data);
        } else {
          setError('Unable to fetch weather forecast');
        }
      } catch (err) {
        setError('Error loading weather forecast');
        console.error('Weather forecast fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchForecast();
  }, [location, days]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-4">
          <div className="flex justify-center items-center h-32">
            <div className="animate-pulse text-sm text-gray-500">Loading weather forecast...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto border-red-200">
        <CardContent className="p-4">
          <div className="text-red-500 text-sm">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!weatherData || !weatherData.forecast) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-md">
      <CardHeader className="pb-2 pt-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Weather Forecast {locationName ? `for ${locationName}` : ''}
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <span className="sr-only">Close</span>
              <span aria-hidden="true">×</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <div className="flex justify-between items-center p-2 cursor-pointer hover:bg-gray-50 rounded-md">
              <div className="flex items-center gap-2">
                <img 
                  src={`https:${weatherData.current.condition.icon}`} 
                  alt={weatherData.current.condition.text}
                  className="h-10 w-10"
                />
                <div>
                  <div className="text-sm font-medium">{weatherData.current.condition.text}</div>
                  <div className="text-xl font-semibold">{formatTemperature(weatherData.current.temp_f)}</div>
                </div>
              </div>
              <div>
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-3 mt-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Feels Like:</span>{' '}
                  {formatTemperature(weatherData.current.feelslike_f)}
                </div>
                <div>
                  <span className="text-gray-500">Wind:</span>{' '}
                  {weatherData.current.wind_mph} mph {weatherData.current.wind_dir}
                </div>
                <div>
                  <span className="text-gray-500">Humidity:</span>{' '}
                  {weatherData.current.humidity}%
                </div>
                <div>
                  <span className="text-gray-500">UV Index:</span>{' '}
                  {weatherData.current.uv}
                </div>
              </div>
              
              <div className="border-t pt-3 mt-3">
                <h4 className="text-sm font-medium mb-2">Forecast</h4>
                <div className="space-y-2">
                  {weatherData.forecast.forecastday.map((day) => (
                    <div key={day.date} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <img 
                          src={`https:${day.day.condition.icon}`} 
                          alt={day.day.condition.text}
                          className="h-8 w-8"
                        />
                        <div>
                          <div className="text-xs font-medium">
                            {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </div>
                          <div className="text-xs text-gray-600">{day.day.condition.text}</div>
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">{formatTemperature(day.day.maxtemp_f)}</span>
                        {' / '}
                        <span className="text-gray-600">{formatTemperature(day.day.mintemp_f)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="text-xs text-gray-500 mt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Sunrise:</span>{' '}
                    {weatherData.forecast.forecastday[0].astro.sunrise}
                  </div>
                  <div>
                    <span className="font-medium">Sunset:</span>{' '}
                    {weatherData.forecast.forecastday[0].astro.sunset}
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default WeatherForecast;