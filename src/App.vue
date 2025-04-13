<script setup>
import { ref, watch, nextTick } from 'vue';
import WeatherTabs from './components/WeatherTabs.vue';
import WeatherData from './components/WeatherData.vue';
import CitySearch from './components/CitySearch.vue';

const selectedCity = ref('Rio de Janeiro');
const showSearch = ref(false);
const searchContainerRef = ref(null);
const searchIconRef = ref(null);
const searchInputRef = ref(null);
const weatherDataRef = ref(null);

const handleCitySelected = (city) => {
  selectedCity.value = city;
  showSearch.value = false;
};

const handleCitySearch = (city) => {
  selectedCity.value = city;
  showSearch.value = false;
};

const toggleSearch = async () => {
    const newState = !showSearch.value;
    showSearch.value = newState;
    
    if (newState) {
        await nextTick();
        if (searchInputRef.value?.inputRef) {
            searchInputRef.value.inputRef.focus();
        }
    }
};

// Close search when clicking outside
const handleClickOutside = (event) => {
  if (showSearch.value &&
      searchIconRef.value &&
      !searchIconRef.value.contains(event.target) &&
      searchContainerRef.value &&
      !searchContainerRef.value.contains(event.target)) {
    showSearch.value = false;
  }
};

watch(showSearch, (newValue) => {
  if (newValue) {
    document.addEventListener('mousedown', handleClickOutside);
  } else {
    document.removeEventListener('mousedown', handleClickOutside);
  }
});

</script>

<template>
  <div id="app">
    <header class="app-header">
      <h1>Simple Weather</h1>
      <div class="header-actions">
        <div ref="searchContainerRef" :class="['search-container', { 'active': showSearch }]">
          <CitySearch
            v-show="showSearch"
            ref="searchInputRef" 
            @city-searched="handleCitySearch"
          />
        </div>
        <button v-show="!showSearch" ref="searchIconRef" class="search-icon-button" @click="toggleSearch">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="search-icon-svg">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </div>
    </header>

    <WeatherTabs :selected-city="selectedCity" @city-selected="handleCitySelected" />

    <main class="content">
      <WeatherData ref="weatherDataRef" :city="selectedCity" />
    </main>
  </div>
</template>

<style>
body {
  background: #fff;
  margin: 0;
  font-family: Avenir, Helvetica, Arial, sans-serif;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  max-width: 480px;
  margin: 0 auto;
  background: #fff;
  min-height: 100vh;
  position: relative;
}

.app-header {
    background: #007bff;
    color: white;
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0,0,0,.1);
    position: relative;
    z-index: 10;
}

.app-header h1 {
    margin: 0;
    font-size: 1.2em;
    font-weight: 500;
    white-space: nowrap;
}

.header-actions {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-grow: 1;
    margin-left: 15px;
}

.search-icon-button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    z-index: 3;
}

.search-icon-svg {
    stroke: white;
}

.search-container {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    height: 32px;
    background: rgba(255, 255, 255, .2);
    border-radius: 16px;
    width: 32px;
    opacity: 0;
    transition: width .2s ease, opacity .2s ease;
    display: flex;
    align-items: center;
    overflow: hidden;
    z-index: 2;
    box-sizing: border-box;
    padding: 0;
}

.search-container.active {
    width: calc(100% - 10px);
    opacity: 1;
    z-index: 4;
}

.search-container > :deep(.city-search-component) {
    width: 100%;
    height: 100%;
    padding: 0 5px;
}

.content {
    padding: 0;
    background: #fff;
    position: relative;
}

.forecast-wrapper {
    background: linear-gradient(to bottom, #1565c0, #1e88e5);
    padding-bottom: 0;
    border-radius: 0;
    overflow: hidden;
}

.refresh-button {
  display: none;
}
</style>
