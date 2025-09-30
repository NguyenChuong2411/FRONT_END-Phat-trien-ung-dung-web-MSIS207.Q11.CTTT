<template>
  <div class="search-bar-container">
    <div class="search-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.value"
        class="search-tab"
        :class="{ active: activeTab === tab.value }"
        @click="selectTab(tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>
    
    <div class="search-input-container">
      <div class="search-input-wrapper">
        <input 
          v-model="searchQuery"
          type="text" 
          class="search-input"
          :placeholder="placeholder"
          @input="handleInput"
          @keyup.enter="handleSearch"
        />
        <button 
          class="search-btn"
          @click="handleSearch"
        >
          Tìm
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
  tabs: {
    type: Array,
    default: () => [
      { label: 'Tất cả', value: 'all' },
      { label: 'IELTS Academic', value: 'ielts-academic' },
      { label: 'IELTS General', value: 'ielts-general' },
      { label: 'TOEIC', value: 'toeic' },
      { label: 'TOEIC SW', value: 'toeic-sw' }
    ]
  },
  placeholder: {
    type: String,
    default: 'Nhập từ khóa tìm kiếm'
  },
  defaultActiveTab: {
    type: String,
    default: 'all'
  }
})

const emit = defineEmits(['search', 'tab-change'])

const activeTab = ref(props.defaultActiveTab)
const searchQuery = ref('')

const selectTab = (tabValue) => {
  activeTab.value = tabValue
  emit('tab-change', tabValue)
  // Trigger search when tab changes
  handleSearch()
}

const handleInput = () => {
  // Optional: emit real-time search
  // emit('search', { query: searchQuery.value, tab: activeTab.value })
}

const handleSearch = () => {
  emit('search', { 
    query: searchQuery.value.trim(), 
    tab: activeTab.value 
  })
}
</script>

<style scoped>
.search-bar-container {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  border-radius: 1.5rem;
  overflow: hidden;
  margin-bottom: 2rem;
}

.search-tabs {
  display: flex;
  background: rgba(255, 255, 255, 0.2);
}

.search-tab {
  flex: 1;
  padding: 0.875rem 1rem;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 3px solid transparent;
}

.search-tab:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.search-tab.active {
  color: white;
  border-bottom-color: white;
}

.search-input-container {
  padding: 1.5rem;
}

.search-input-wrapper {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 0.875rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s ease;
  outline: none;
  background: transparent;
  color: white;
}

.search-input:focus {
  border-color: white;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.search-btn {
  padding: 0.875rem 2rem;
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.search-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
}

.search-btn:active {
  transform: translateY(0);
  background: linear-gradient(135deg, #4c7de6, #2563eb);
}

/* Responsive design */
@media (max-width: 768px) {
  .search-tabs {
    flex-wrap: wrap;
  }
  
  .search-tab {
    flex: 1 1 auto;
    min-width: calc(50% - 0.5rem);
    font-size: 0.875rem;
    padding: 0.75rem 0.5rem;
  }
  
  .search-input-wrapper {
    flex-direction: column;
    gap: 1rem;
  }
  
  .search-input,
  .search-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .search-tab {
    min-width: 100%;
    text-align: center;
  }
  
  .search-input-container {
    padding: 1rem;
  }
}
</style>