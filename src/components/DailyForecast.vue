<template>
  <div class="daily-forecast card">
    <h3>Next 5 days</h3>
    <ul class="forecast-list">
      <li v-for="day in dailyData" :key="day.date" class="forecast-item">
        <img :src="getWeatherIconUrl(day.icon)" :alt="day.weather" class="weather-icon">
        <div class="day-info">
          <p class="date">
            {{ formatDay(day.date) }}
          </p>
          <p class="condition">
            {{ day.weather }}
          </p>
        </div>
        <p class="temp">
          {{ day.maxTemp }}° {{ day.minTemp }}°
        </p>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
  dailyData: Array,
});

const getWeatherIconUrl = iconCode => `https://openweathermap.org/img/wn/${iconCode}.png`;

const formatDay = (dateString) => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    } catch (e) {
        return dateString;
    }
};
</script>

<style scoped>
.card {
    background: white;
    border-radius: 0;
    padding: 10px 15px;
    margin: 25px 10px 0 10px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.daily-forecast h3 {
    margin: 0 -15px 10px;
    font-size: 1.1em;
    color: #333;
    font-weight: 600;
    border-bottom: 1px solid #eaeaea;
    padding: 15px;
}

.forecast-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.forecast-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.forecast-item:last-child { border-bottom: none; }

.weather-icon {
  width: 40px;
  height: 40px;
  margin-right: 15px;
}

.day-info {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.date {
  font-weight: bold;
  margin: 0 0 2px;
  font-size: .95em;
  text-align: center;
}

.temp {
  font-size: .95em;
  font-weight: 600;
  text-align: right;
  min-width: 60px;
  margin: 0;
  color: #333;
}

.condition {
    font-size: .85em;
    color: #6c757d;
    margin: 0;
    text-transform: capitalize;
    text-align: center;
}
</style> 