import AsyncStorage from '@react-native-async-storage/async-storage';

const WEATHER_CACHE_KEY = '@mydaily_cached_weather';

/**
 * Fetch current weather data from Open-Meteo (keyless, free) or fallback to cached snapshot.
 * Lat/Long default to a standard location (e.g. Kuala Lumpur 3.1390, 101.6869) or user provided.
 */
export const fetchCurrentWeather = async (latitude = 3.1390, longitude = 101.6869, locationName = 'Kuala Lumpur') => {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
    
    const response = await fetch(url, { timeout: 5000 });
    
    if (!response.ok) {
      throw new Error(`Weather server responded with status: ${response.status}`);
    }

    const data = await response.json();
    if (!data || !data.current_weather) {
      throw new Error('Invalid weather data structure received');
    }

    const { temperature, weathercode } = data.current_weather;
    const condition = getWeatherConditionFromCode(weathercode);

    const weatherSnapshot = {
      temp: Math.round(temperature),
      condition: condition.label,
      icon: condition.icon,
      location: locationName,
      timestamp: new Date().toISOString(),
    };

    // Cache latest weather snapshot
    await AsyncStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(weatherSnapshot));

    return {
      success: true,
      data: weatherSnapshot,
      isCached: false,
    };
  } catch (error) {
    console.warn('Weather fetch failed, attempting cache fallback:', error.message);
    const cachedData = await getCachedWeather();
    if (cachedData) {
      return {
        success: true,
        data: cachedData,
        isCached: true,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Weather service unavailable',
    };
  }
};

/**
 * Get cached weather snapshot from AsyncStorage.
 */
export const getCachedWeather = async () => {
  try {
    const cached = await AsyncStorage.getItem(WEATHER_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (e) {
    return null;
  }
};

/**
 * WMO Weather interpretation codes (WW)
 */
function getWeatherConditionFromCode(code) {
  if (code === 0) return { label: 'Clear Sky', icon: '☀️' };
  if (code >= 1 && code <= 3) return { label: 'Partly Cloudy', icon: '⛅' };
  if (code >= 45 && code <= 48) return { label: 'Foggy', icon: '🌫️' };
  if (code >= 51 && code <= 67) return { label: 'Rainy', icon: '🌧️' };
  if (code >= 71 && code <= 77) return { label: 'Snowy', icon: '❄️' };
  if (code >= 80 && code <= 82) return { label: 'Showers', icon: '🌧️' };
  if (code >= 95 && code <= 99) return { label: 'Thunderstorm', icon: '🌩️' };
  return { label: 'Mild', icon: '🌤️' };
}
