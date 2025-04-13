<template>
  <div class="weather-data">
    <div v-if="error" class="error">
      {{ error }}
    </div>
    <div v-if="weatherData && !error && !loading" class="weather-content">
      <div v-if="isRefreshing" class="refresh-indicator">
        <div class="refresh-spinner" />
      </div>
      
      <div class="forecast-wrapper">
        <!-- Hourly Forecast -->
        <HourlyForecast :hourly-data="hourlyForecast" :current-weather="currentWeather" />

        <!-- Daily Forecast -->
        <DailyForecast :daily-data="dailyForecast" />
      </div>

      <div class="last-updated">
        <button title="Refresh weather data" class="refresh-button" @click="refreshData">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M23 4v6h-6" />
            <path d="M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
            <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" />
          </svg>
        </button>
        <span>Last updated on {{ lastUpdatedTimestamp }}</span>
      </div>
    </div>
    <div v-if="loading" class="loading-indicator">
      Loading weather data...
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, onMounted, computed, defineExpose } from 'vue';
import { getWeatherData } from '../services/weatherService';
import HourlyForecast from './HourlyForecast.vue';
import DailyForecast from './DailyForecast.vue';

const props = defineProps({
  city: String,
});

const weatherData = ref(null);
const currentWeather = ref(null);
const hourlyForecast = ref([]);
const dailyForecast = ref([]);
const loading = ref(false);
const error = ref(null);
const lastUpdated = ref(null);
const isRefreshing = ref(false);

const fetchData = async () => {
  if (!props.city) return;
  loading.value = true;
  error.value = null;
  weatherData.value = null; // Clear previous data
  currentWeather.value = null;
  hourlyForecast.value = [];
  dailyForecast.value = [];

  try {
    const data = await getWeatherData(props.city);
    weatherData.value = data;
    // The API returns a list of forecasts (every 3 hours for 5 days)
    // The first item in the list is the closest to the current weather
    currentWeather.value = data.list[0];
    processForecastData(data.list);
    lastUpdated.value = new Date(); // Store update time
  } catch (err) {
    error.value = `Failed to fetch weather data. ${err.message || 'Please try again.'}`;
    console.error(err);
  } finally {
    loading.value = false;
    isRefreshing.value = false;
  }
};

const refreshData = async () => {
  if (loading.value) return;
  isRefreshing.value = true;
  await fetchData();
};

const processForecastData = (forecastList) => {
  // Get hourly data
  const now = new Date();
  const hourlyData = [];
  
  // Next 12 hours
  for (let hour = 0; hour < 12; hour++) {
    const targetTime = new Date(now.getTime() + hour * 60 * 60 * 1000);
    
    // Find closest forecast point
    let closestItem = forecastList[0];
    let minDiff = Math.abs(targetTime - new Date(forecastList[0].dt * 1000));
    
    forecastList.forEach(item => {
      const itemTime = new Date(item.dt * 1000);
      const diff = Math.abs(targetTime - itemTime);
      if (diff < minDiff) {
        minDiff = diff;
        closestItem = item;
      }
    });
    
    // Copy and adjust time
    const hourlyItem = {...closestItem};
    hourlyItem.dt = Math.floor(targetTime.getTime() / 1000);
    hourlyData.push(hourlyItem);
  }
  
  hourlyForecast.value = hourlyData;

  // Group by day for daily forecast
  const daily = {};
  forecastList.forEach(item => {
    const date = new Date(item.dt * 1000).toLocaleDateString();
    if (!daily[date]) {
      daily[date] = {
        temps: [],
        weather: [],
        icons: [],
        date: new Date(item.dt * 1000)
      };
    }
    daily[date].temps.push(item.main.temp);
    daily[date].weather.push(item.weather[0].description);
    daily[date].icons.push(item.weather[0].icon);
  });

  // Process daily data
  dailyForecast.value = Object.values(daily).map(day => {
    // Find min/max temp
    const minTemp = Math.min(...day.temps);
    const maxTemp = Math.max(...day.temps);
    
    // Get most common weather
    const weatherCounts = day.weather.reduce((acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {});
    const mostFrequentWeather = Object.keys(weatherCounts)
      .reduce((a, b) => weatherCounts[a] > weatherCounts[b] ? a : b);

    // Get most common icon
    const iconCounts = day.icons.reduce((acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {});
    const mostFrequentIcon = Object.keys(iconCounts)
      .reduce((a, b) => iconCounts[a] > iconCounts[b] ? a : b);

    return {
      date: day.date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
      minTemp: Math.round(minTemp),
      maxTemp: Math.round(maxTemp),
      weather: mostFrequentWeather,
      icon: mostFrequentIcon
    };
  }).sort((a, b) => new Date(a.date) - new Date(b.date));
};

// Computed property to format the timestamp
const lastUpdatedTimestamp = computed(() => {
    if (!lastUpdated.value) return '';
    return lastUpdated.value.toLocaleString('en-US', {
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false, 
        hourCycle: 'h23'
    });
});

// Fetch on mount and city change
onMounted(fetchData);
watch(() => props.city, fetchData);

// Expose the refresh method to parent components
defineExpose({ refreshData });

</script>

<style scoped>
.weather-data {
  position: relative;
  min-height: 300px;
  padding-bottom: 15px;
}

.loading-indicator, .error {
  text-align: center;
  padding: 50px;
  color: #888;
  background: white;
  margin: 10px;
  border-radius: 0;
  box-shadow: 0 2px 5px rgba(0,0,0,.08);
}

.error {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 15px;
  border-radius: 0;
  margin: 10px;
}

.forecast-wrapper {
  background: linear-gradient(to bottom, #1565c0, #1e88e5);
  padding-bottom: 0;
  border-radius: 0;
  overflow: hidden;
  margin-bottom: 0;
}

.last-updated {
  background: #1565c0;
  color: white;
  padding: 8px 15px;
  font-size: .8em;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin: 0;
  border-radius: 0;
}

.last-updated span {
  flex-grow: 1;
  text-align: right;
}

.refresh-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  opacity: 0.85;
  transition: transform 0.2s ease;
  border-radius: 50%;
}

.refresh-button:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1);
  transform: rotate(30deg);
}

.refresh-button:active {
  transform: rotate(180deg);
}

.refresh-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  padding: 5px 0;
  z-index: 5;
}

.refresh-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 123, 255, 0.3);
  border-radius: 50%;
  border-top-color: #007bff;
  animation: spin 1s ease infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Add more specific styles as needed */
</style> 