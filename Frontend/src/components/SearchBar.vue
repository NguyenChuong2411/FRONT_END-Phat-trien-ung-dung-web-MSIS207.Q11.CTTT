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
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.search-tabs {
  display: flex;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.search-tab {
  flex: 1;
  padding: 0.875rem 1rem;
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
}

.search-tab:hover {
  background-color: #f1f5f9;
  color: #475569;
}

.search-tab.active {
  background-color: #3b82f6;
  color: white;
  border-bottom-color: #1d4ed8;
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
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  outline: none;
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-input::placeholder {
  color: #9ca3af;
}

.search-btn {
  padding: 0.875rem 2rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  white-space: nowrap;
}

.search-btn:hover {
  background-color: #2563eb;
}

.search-btn:active {
  background-color: #1d4ed8;
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