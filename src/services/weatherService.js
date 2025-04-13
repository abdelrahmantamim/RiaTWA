import axios from 'axios';

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export const getWeatherData = async (city) => {
  try {
    // Get coordinates first
    const geoResponse = await axios.get('https://api.openweathermap.org/geo/1.0/direct', {
      params: {
        q: city,
        limit: 1,
        appid: API_KEY,
      },
    });

    if (!geoResponse.data || geoResponse.data.length === 0) {
      throw new Error(`City not found: ${city}`);
    }

    const { lat, lon } = geoResponse.data[0];

    // Get 5-day forecast (3h intervals)
    const weatherResponse = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units: 'metric',
      },
    });

    return weatherResponse.data;
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
}; 