<template>
  <div class="city-search-component">
    <div class="search-input-wrapper">
      <input
        ref="inputRef"
        v-model.trim="searchQuery"
        type="text"
        placeholder="Search city..."
        @input="handleInput"
        @keydown.down.prevent="navigateSuggestions('down')"
        @keydown.up.prevent="navigateSuggestions('up')"
        @keydown.enter.prevent="selectSuggestion(highlightedIndex)"
        @blur="hideSuggestionsDebounced"
        @focus="showSuggestions"
      >
    </div>
    <Teleport to="body">
      <ul
        v-if="showSuggestionList && suggestions.length"
        class="suggestions-list-teleported"
        :style="suggestionsStyle" 
      >
        <li
          v-for="(suggestion, index) in suggestions"
          :key="index"
          :class="{ highlighted: index === highlightedIndex }"
          @mousedown.prevent="selectSuggestion(index)"
        >
          {{ suggestion.city_name }}, {{ suggestion.country_full }}
        </li>
      </ul>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import Papa from 'papaparse';

const searchQuery = ref('');
const emit = defineEmits(['city-searched']);
const cities = ref([]);
const suggestions = ref([]);
const showSuggestionList = ref(false);
const selectedCityName = ref(null);
const highlightedIndex = ref(-1);
const inputRef = ref(null);
let hideSuggestionsTimeout = null;
const suggestionsStyle = ref({});

defineExpose({ inputRef });

// Load city data from CSV
onMounted(async () => {
  try {
    const response = await fetch('/cities_20000.csv');
    if (!response.ok) throw new Error(`Failed to load city data: ${response.status}`);
    
    const csvText = await response.text();
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        cities.value = results.data
          .map(city => ({
            city_name: city.city_name,
            country_full: city.country_full
          }))
          .filter(city => city.city_name);
      },
      error: err => console.error('CSV parse error:', err)
    });
  } catch (err) {
    console.error(err);
  }
});

const handleInput = () => {
  selectedCityName.value = null;
  highlightedIndex.value = -1;
  
  if (searchQuery.value.length > 1) {
    const q = searchQuery.value.toLowerCase();
    suggestions.value = cities.value
      .filter(city => city.city_name.toLowerCase().startsWith(q))
      .slice(0, 5);
    showSuggestionList.value = suggestions.value.length > 0;
  } else {
    suggestions.value = [];
    showSuggestionList.value = false;
  }
};

const selectSuggestion = (index) => {
  if (index >= 0 && index < suggestions.value.length) {
    const selected = suggestions.value[index];
    searchQuery.value = `${selected.city_name}, ${selected.country_full}`;
    selectedCityName.value = selected.city_name;
    suggestions.value = [];
    showSuggestionList.value = false;
    highlightedIndex.value = -1;
    if (inputRef.value) inputRef.value.blur();
    searchSelectedCity();
  }
};

const searchSelectedCity = () => {
  if (selectedCityName.value) {
    emit('city-searched', selectedCityName.value);
    searchQuery.value = '';
    selectedCityName.value = null;
  }
};

const navigateSuggestions = (direction) => {
  if (!showSuggestionList.value || !suggestions.value.length) return;
  
  if (direction === 'down') {
    highlightedIndex.value = (highlightedIndex.value + 1) % suggestions.value.length;
  } else if (direction === 'up') {
    highlightedIndex.value = (highlightedIndex.value - 1 + suggestions.value.length) % suggestions.value.length;
  }
  
  inputRef.value?.focus();
};

const hideSuggestionsDebounced = () => {
  clearTimeout(hideSuggestionsTimeout);
  hideSuggestionsTimeout = setTimeout(() => {
    showSuggestionList.value = false;
    highlightedIndex.value = -1;
  }, 200);
};

const calculateSuggestionPosition = async () => {
  if (!inputRef.value || !showSuggestionList.value) {
    suggestionsStyle.value = { display: 'none' };
    return;
  }

  if (window._suggestionPositionTimeout) {
    clearTimeout(window._suggestionPositionTimeout);
  }
  
  window._suggestionPositionTimeout = setTimeout(() => {
    if (!inputRef.value) return;
    const rect = inputRef.value.getBoundingClientRect();
    
    suggestionsStyle.value = {
      position: 'fixed',
      top: `${rect.bottom}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      maxWidth: '100%',
      display: 'block',
      zIndex: 9999
    };
  }, 50);
};

watch(showSuggestionList, newValue => {
  if (newValue) calculateSuggestionPosition();
});

const showSuggestions = async () => {
  if (searchQuery.value.length > 1 && suggestions.value.length > 0) {
    clearTimeout(hideSuggestionsTimeout);
    showSuggestionList.value = true;
    await calculateSuggestionPosition();
  }
};
</script>

<style scoped>
.city-search-component {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}

.search-input-wrapper {
  width: 100%;
  position: relative;
}

input[type="text"] {
  width: 100%;
  height: 100%;
  padding: 5px 15px;
  border: none;
  border-radius: 16px;
  background: transparent;
  color: white;
  font-size: .9em;
  box-sizing: border-box;
  outline: none;
  margin: 0;
}

input[type="text"]::placeholder {
  color: rgba(255, 255, 255, .7);
}
</style>

<style>
.suggestions-list-teleported {
  position: fixed;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  list-style: none;
  margin: 0;
  padding: 5px 0;
  max-height: 200px;
  overflow-y: auto;
  z-index: 9999;
  box-shadow: 0 4px 8px rgba(0, 0, 0, .15);
  color: #333;
  box-sizing: border-box;
  animation: fadeIn .1s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.suggestions-list-teleported li {
  padding: 8px 15px;
  cursor: pointer;
  font-size: .9em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.suggestions-list-teleported li:hover,
.suggestions-list-teleported li.highlighted {
  background: #f0f0f0;
}
</style> 