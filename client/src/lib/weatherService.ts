/**
 * Weather data service for fetching weather information for trip locations
 */

export interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    localtime: string;
  };
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
    const response = await fetch(`/api/weather/current?lat=${lat}&lng=${lng}`);
    
    if (!response.ok) {
      console.error('Weather API error:', await response.text());
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching current weather:', error);
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
    const response = await fetch(`/api/weather/forecast?lat=${lat}&lng=${lng}&days=${days}`);
    
    if (!response.ok) {
      console.error('Weather forecast API error:', await response.text());
      return null;
    }
    
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
  // The API already provides icon URLs, but this function is here for future customization
  return `https://cdn.weatherapi.com/weather/64x64/${isDay ? 'day' : 'night'}/${code}.png`;
};

/**
 * Converts weather condition code to a color for map visualization
 * @param code Weather condition code
 * @returns Hex color string
 */
export const getWeatherColor = (code: number): string => {
  // Clear, sunny
  if (code === 1000) return '#f59e0b'; // amber-500
  
  // Partly cloudy, cloudy
  if (code >= 1003 && code <= 1030) return '#6b7280'; // gray-500
  
  // Fog, mist
  if (code >= 1135 && code <= 1147) return '#9ca3af'; // gray-400
  
  // Rain, drizzle
  if ((code >= 1063 && code <= 1069) || (code >= 1150 && code <= 1201)) 
    return '#3b82f6'; // blue-500
  
  // Snow, sleet
  if ((code >= 1114 && code <= 1117) || (code >= 1210 && code <= 1225)) 
    return '#e5e7eb'; // gray-200
  
  // Thunderstorm
  if (code >= 1273 && code <= 1282) return '#6366f1'; // indigo-500
  
  // Default - unknown condition
  return '#6b7280'; // gray-500
};

/**
 * Formats temperature with the appropriate unit
 * @param temp Temperature value
 * @param unit 'C' or 'F'
 * @returns Formatted temperature string
 */
export const formatTemperature = (temp: number, unit: 'C' | 'F' = 'F'): string => {
  const roundedTemp = Math.round(temp);
  return `${roundedTemp}°${unit}`;
};

/**
 * Formats the date for display in weather forecasts
 * @param dateStr Date string in format YYYY-MM-DD
 * @returns Formatted date string (e.g., "Mon, Jan 1")
 */
export const formatForecastDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

/**
 * Gets a human-readable description of precipitation chances
 * @param rainChance Chance of rain (0-100)
 * @param snowChance Chance of snow (0-100)
 * @returns Descriptive string about precipitation
 */
export const getPrecipitationDescription = (rainChance: number, snowChance: number): string => {
  if (rainChance > 70 || snowChance > 70) {
    return snowChance > rainChance ? 'Heavy snow likely' : 'Heavy rain likely';
  } else if (rainChance > 40 || snowChance > 40) {
    return snowChance > rainChance ? 'Possible snow' : 'Possible rain';
  } else if (rainChance > 20 || snowChance > 20) {
    return snowChance > rainChance ? 'Slight chance of snow' : 'Slight chance of rain';
  } else {
    return 'Precipitation unlikely';
  }
};