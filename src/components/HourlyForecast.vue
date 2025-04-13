<template>
  <div class="hourly-forecast card">
    <h3>Next hours</h3>
    <div class="forecast-items-container">
      <div class="forecast-items">
        <!-- Current -->
        <div v-if="currentWeather" class="forecast-item current">
          <p class="temp">
            {{ Math.round(currentWeather.main.temp) }}°
          </p>
          <p class="pop">
            {{ Math.round((currentWeather.pop || 0) * 100) }}%
          </p>
          <img :src="getWeatherIconUrl(currentWeather.weather[0].icon)" :alt="currentWeather.weather[0].description">
          <p class="time">
            Now
          </p>
        </div>
        <!-- Hourly -->
        <div v-for="item in hourlyData" :key="item.dt" class="forecast-item">
          <p class="temp">
            {{ Math.round(item.main.temp) }}°
          </p>
          <p class="pop">
            {{ Math.round((item.pop || 0) * 100) }}%
          </p>
          <img :src="getWeatherIconUrl(item.weather[0].icon)" :alt="item.weather[0].description">
          <p class="time">
            {{ formatTime(item.dt) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
  hourlyData: Array,
  currentWeather: Object,
});

// TODO: Add 12/24 hour format toggle
const formatTime = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
};

const getWeatherIconUrl = iconCode => `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
</script>

<style scoped>
.card {
    background: #fff;
    border-radius: 0;
    padding: 10px 15px;
    margin: 10px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

h3 {
    margin: 0 -15px 10px;
    font-size: 1.1em;
    color: #333;
    font-weight: 600;
    border-bottom: 1px solid #eaeaea;
    padding: 15px;
}

.forecast-items-container { overflow-x: auto; }
.forecast-items-container::-webkit-scrollbar { height: 4px; }
.forecast-items-container::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 3px; }
.forecast-items-container::-webkit-scrollbar-thumb { background: #ddd; border-radius: 3px; }
.forecast-items-container::-webkit-scrollbar-thumb:hover { background: #bbb; }

.forecast-items {
  display: flex;
  padding-bottom: 5px;
  gap: 0;
}

.forecast-item {
  text-align: center;
  min-width: 70px;
  padding: 0 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.forecast-item::after {
  content: '';
  position: absolute;
  right: 0;
  top: 25%;
  height: 50%;
  width: 1px;
  background-color: #f0f0f0;
}

.forecast-items > .forecast-item:last-child::after { display: none; }

.forecast-item.current { font-weight: bold; color: #007bff; }
.forecast-item.current .time { color: #007bff; }

.forecast-item img {
  width: 75px;
  height: 75px;
  margin: 4px 0;
  order: 2;
}

.time {
  font-size: .8em;
  color: #555;
  margin-top: 2px;
  order: 3;
  white-space: nowrap;
}

.temp {
  font-weight: normal;
  font-size: 1em;
  margin: 0;
  order: 0;
}

.pop {
    font-size: .8em;
    color: #17a2b8;
    margin-top: 0;
    margin-bottom: 0;
    order: 1;
}
</style> 