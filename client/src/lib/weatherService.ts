import { apiRequest } from './queryClient';

export interface WeatherData {
  location: string;
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_mph: number;
    wind_kph: number;
    wind_dir: string;
    precip_mm: number;
    precip_in: number;
    humidity: number;
    cloud: number;
    feelslike_c: number;
    feelslike_f: number;
    uv: number;
  };
  forecast?: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        maxtemp_f: number;
        mintemp_c: number;
        mintemp_f: number;
        avgtemp_c: number;
        avgtemp_f: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
        daily_chance_of_rain: number;
        daily_chance_of_snow: number;
      };
      astro: {
        sunrise: string;
        sunset: string;
      };
      hour: Array<{
        time: string;
        temp_c: number;
        temp_f: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
        chance_of_rain: number;
        chance_of_snow: number;
      }>;
    }>;
  };
}

/**
 * Fetches current weather for a given location
 * @param lat Latitude
 * @param lng Longitude
 * @returns Promise with weather data
 */
export const fetchCurrentWeather = async (lat: number, lng: number): Promise<WeatherData | null> => {
  try {
    const response = await apiRequest('GET', `/api/weather?lat=${lat}&lng=${lng}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
};

/**
 * Fetches forecast weather for a given location
 * @param lat Latitude
 * @param lng Longitude
 * @param days Number of days to forecast (max 7)
 * @returns Promise with weather data including forecast
 */
export const fetchWeatherForecast = async (lat: number, lng: number, days: number = 3): Promise<WeatherData | null> => {
  try {
    const response = await apiRequest('GET', `/api/weather/forecast?lat=${lat}&lng=${lng}&days=${days}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    return null;
  }
};

/**
 * Gets the appropriate weather icon based on condition code and whether it's day or night
 * @param code Weather condition code
 * @param isDay Boolean indicating if it's daytime
 * @returns URL string for the weather icon
 */
export const getWeatherIconUrl = (code: number, isDay: boolean = true): string => {
  const baseUrl = 'https://cdn.weatherapi.com/weather/64x64';
  const timeOfDay = isDay ? 'day' : 'night';
  return `${baseUrl}/${timeOfDay}/${code}.png`;
};

/**
 * Converts weather condition code to a color for map visualization
 * @param code Weather condition code
 * @returns Hex color string
 */
export const getWeatherColor = (code: number): string => {
  // Clear/Sunny
  if (code === 1000) return '#FDB813';
  
  // Partly cloudy
  if (code === 1003) return '#87CEEB';
  
  // Cloudy, overcast
  if (code >= 1006 && code <= 1009) return '#A9A9A9';
  
  // Mist, fog
  if (code >= 1030 && code <= 1039) return '#C0C0C0';
  
  // Rain
  if ((code >= 1063 && code <= 1069) || (code >= 1150 && code <= 1201)) return '#4682B4';
  
  // Snow
  if ((code >= 1114 && code <= 1117) || (code >= 1210 && code <= 1225)) return '#E0FFFF';
  
  // Sleet, freezing rain
  if ((code >= 1204 && code <= 1207) || (code >= 1237 && code <= 1252)) return '#6495ED';
  
  // Thunderstorm
  if (code >= 1273 && code <= 1282) return '#483D8B';
  
  // Default
  return '#FFFFFF';
};

/**
 * Formats temperature with the appropriate unit
 * @param temp Temperature value
 * @param unit 'C' or 'F'
 * @returns Formatted temperature string
 */
export const formatTemperature = (temp: number, unit: 'C' | 'F' = 'F'): string => {
  return `${Math.round(temp)}°${unit}`;
};