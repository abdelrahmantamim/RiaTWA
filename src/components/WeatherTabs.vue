<template>
  <div class="tabs">
    <button
      v-for="city in cities"
      :key="city"
      :class="{ active: city === selectedCity }"
      class="tab-button"
      @click="selectCity(city)"
    >
      {{ city.toUpperCase() }}
    </button>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';

defineProps({
  selectedCity: String,
});

const emit = defineEmits(['city-selected']);
const cities = ref(['Rio de Janeiro', 'Beijing', 'Los Angeles']);
const selectCity = city => emit('city-selected', city);
</script>

<style scoped>
.tabs {
  margin-bottom: 0;
  display: flex;
  justify-content: space-around;
  background: white;
  padding-top: 10px;
}

.tab-button {
  padding: 10px 5px;
  cursor: pointer;
  border: none;
  border-bottom: 3px solid transparent;
  background: transparent;
  color: #6c757d;
  font-weight: bold;
  font-size: .9em;
  transition: color .3s, border-color .3s;
  flex-grow: 1;
  text-align: center;
}

.tab-button.active {
  color: #007bff;
  border-bottom-color: #fd6e5b;
}

.tab-button:hover:not(.active) { color: #343a40; }
</style> 