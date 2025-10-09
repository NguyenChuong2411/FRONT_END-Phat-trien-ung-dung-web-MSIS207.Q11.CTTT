<template>
  <div class="multi-select" :class="{ 'is-open': isOpen, 'is-disabled': disabled }">
    <!-- Label -->
    <label v-if="label" class="multi-select-label">{{ label }}</label>
    
    <!-- Main Input -->
    <div 
      class="multi-select-input"
      @click="toggleDropdown"
      :tabindex="disabled ? -1 : 0"
      @keydown.enter.prevent="toggleDropdown"
      @keydown.space.prevent="toggleDropdown"
      @keydown.escape="closeDropdown"
    >
      <!-- Selected Items Display -->
      <div class="selected-items" v-if="selectedItems.length > 0">
        <span 
          v-for="item in displayedSelectedItems" 
          :key="getItemKey(item)"
          class="selected-tag"
        >
          {{ getItemLabel(item) }}
          <button 
            class="remove-tag-btn"
            @click.stop="removeItem(item)"
            :disabled="disabled"
            type="button"
          >
            ×
          </button>
        </span>
        
        <!-- Show count if more items selected -->
        <span v-if="hasMoreSelected" class="more-count">
          +{{ remainingCount }} thêm
        </span>
      </div>
      
      <!-- Placeholder -->
      <span v-else class="placeholder">{{ placeholder }}</span>
      
      <!-- Dropdown Arrow -->
      <div class="dropdown-arrow" :class="{ 'is-open': isOpen }">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4 6l4 4 4-4H4z"/>
        </svg>
      </div>
    </div>
    
    <!-- Dropdown Options -->
    <transition name="dropdown">
      <div v-if="isOpen" class="dropdown-menu" ref="dropdown">
        <!-- Search Input -->
        <div v-if="searchable" class="search-container">
          <input 
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            class="search-input"
            :placeholder="searchPlaceholder"
            @keydown.escape="closeDropdown"
          />
        </div>
        
        <!-- Select All Option -->
        <div v-if="showSelectAll" class="select-all-option">
          <label class="option-item">
            <input 
              type="checkbox"
              :checked="isAllSelected"
              :indeterminate="isIndeterminate"
              @change="toggleSelectAll"
            />
            <span class="option-label">{{ selectAllText }}</span>
          </label>
        </div>
        
        <!-- Options List -->
        <div class="options-container" :style="{ maxHeight: maxHeight }">
          <template v-if="filteredOptions.length > 0">
            <label 
              v-for="option in filteredOptions"
              :key="getItemKey(option)"
              class="option-item"
              :class="{ 'is-selected': isSelected(option), 'is-disabled': isOptionDisabled(option) }"
            >
              <input 
                type="checkbox"
                :checked="isSelected(option)"
                :disabled="isOptionDisabled(option)"
                @change="toggleOption(option, $event)"
              />
              <span class="option-label">{{ getItemLabel(option) }}</span>
              <span v-if="showCount && getItemCount(option)" class="option-count">
                ({{ getItemCount(option) }})
              </span>
            </label>
          </template>
          
          <!-- No Results -->
          <div v-else class="no-results">
            {{ noResultsText }}
          </div>
        </div>
      </div>
    </transition>
    
    <!-- Error Message -->
    <div v-if="error" class="error-message">{{ error }}</div>
    
    <!-- Helper Text -->
    <div v-if="helperText && !error" class="helper-text">{{ helperText }}</div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  // Data
  modelValue: {
    type: Array,
    default: () => []
  },
  options: {
    type: Array,
    default: () => []
  },
  
  // Display Configuration
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Chọn các mục...'
  },
  
  // Item Configuration
  itemKey: {
    type: [String, Function],
    default: 'id'
  },
  itemLabel: {
    type: [String, Function],
    default: 'label'
  },
  itemCount: {
    type: [String, Function],
    default: null
  },
  itemDisabled: {
    type: [String, Function],
    default: null
  },
  
  // Behavior
  searchable: {
    type: Boolean,
    default: true
  },
  searchPlaceholder: {
    type: String,
    default: 'Tìm kiếm...'
  },
  showSelectAll: {
    type: Boolean,
    default: true
  },
  selectAllText: {
    type: String,
    default: 'Chọn tất cả'
  },
  closeOnSelect: {
    type: Boolean,
    default: false
  },
  
  // Limits
  maxSelectedDisplay: {
    type: Number,
    default: 3
  },
  maxHeight: {
    type: String,
    default: '200px'
  },
  maxSelections: {
    type: Number,
    default: null
  },
  
  // States
  disabled: {
    type: Boolean,
    default: false
  },
  
  // Validation
  error: {
    type: String,
    default: ''
  },
  helperText: {
    type: String,
    default: ''
  },
  
  // Display Options
  showCount: {
    type: Boolean,
    default: false
  },
  
  // Text
  noResultsText: {
    type: String,
    default: 'Không tìm thấy kết quả'
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'search', 'open', 'close'])

// Refs
const dropdown = ref(null)
const searchInput = ref(null)

// State
const isOpen = ref(false)
const searchQuery = ref('')

// Computed Properties
const selectedItems = computed(() => props.modelValue || [])

const displayedSelectedItems = computed(() => {
  return selectedItems.value.slice(0, props.maxSelectedDisplay)
})

const hasMoreSelected = computed(() => {
  return selectedItems.value.length > props.maxSelectedDisplay
})

const remainingCount = computed(() => {
  return selectedItems.value.length - props.maxSelectedDisplay
})

const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value.trim()) {
    return props.options
  }
  
  const query = searchQuery.value.toLowerCase()
  const filtered = props.options.filter(option => {
    const label = getItemLabel(option).toLowerCase()
    return label.includes(query)
  })
  return filtered
})

const isAllSelected = computed(() => {
  const selectableOptions = filteredOptions.value.filter(option => !isOptionDisabled(option))
  return selectableOptions.length > 0 && 
         selectableOptions.every(option => isSelected(option))
})

const isIndeterminate = computed(() => {
  const selectableOptions = filteredOptions.value.filter(option => !isOptionDisabled(option))
  const selectedCount = selectableOptions.filter(option => isSelected(option)).length
  return selectedCount > 0 && selectedCount < selectableOptions.length
})

// Helper Functions
const getItemKey = (item) => {
  if (typeof props.itemKey === 'function') {
    return props.itemKey(item)
  }
  return item[props.itemKey] ?? item
}

const getItemLabel = (item) => {
  if (typeof props.itemLabel === 'function') {
    return props.itemLabel(item)
  }
  return item[props.itemLabel] ?? item
}

const getItemCount = (item) => {
  if (!props.itemCount) return null
  if (typeof props.itemCount === 'function') {
    return props.itemCount(item)
  }
  return item[props.itemCount]
}

const isOptionDisabled = (item) => {
  if (!props.itemDisabled) return false
  if (typeof props.itemDisabled === 'function') {
    return props.itemDisabled(item)
  }
  return item[props.itemDisabled]
}

const isSelected = (item) => {
  return selectedItems.value.some(selected => 
    getItemKey(selected) === getItemKey(item)
  )
}

// Methods
const toggleDropdown = () => {
  if (props.disabled) return
  
  if (isOpen.value) {
    closeDropdown()
  } else {
    openDropdown()
  }
}

const openDropdown = async () => {
  if (props.disabled) return
  
  isOpen.value = true
  emit('open')
  
  if (props.searchable) {
    await nextTick()
    searchInput.value?.focus()
  }
}

const closeDropdown = () => {
  isOpen.value = false
  searchQuery.value = ''
  emit('close')
}

const toggleOption = (option, event) => {
  if (isOptionDisabled(option)) return
  
  const newSelected = [...selectedItems.value]
  const index = newSelected.findIndex(item => 
    getItemKey(item) === getItemKey(option)
  )
  
  if (index > -1) {
    // Remove item
    newSelected.splice(index, 1)
  } else {
    // Add item (check max limit)
    if (props.maxSelections && newSelected.length >= props.maxSelections) {
      return
    }
    newSelected.push(option)
  }
  
  updateValue(newSelected)
  
  if (props.closeOnSelect && !event.shiftKey) {
    closeDropdown()
  }
}

const removeItem = (item) => {
  if (props.disabled) return
  
  const newSelected = selectedItems.value.filter(selected => 
    getItemKey(selected) !== getItemKey(item)
  )
  updateValue(newSelected)
}

const toggleSelectAll = () => {
  const selectableOptions = filteredOptions.value.filter(option => !isOptionDisabled(option))
  
  if (isAllSelected.value) {
    // Deselect all filtered options
    const newSelected = selectedItems.value.filter(selected => 
      !selectableOptions.some(option => getItemKey(option) === getItemKey(selected))
    )
    updateValue(newSelected)
  } else {
    // Select all filtered options (respecting max limit)
    let newSelected = [...selectedItems.value]
    
    for (const option of selectableOptions) {
      if (props.maxSelections && newSelected.length >= props.maxSelections) {
        break
      }
      
      if (!isSelected(option)) {
        newSelected.push(option)
      }
    }
    
    updateValue(newSelected)
  }
}

const updateValue = (newValue) => {
  emit('update:modelValue', newValue)
  emit('change', newValue)
}

// Handle click outside
const handleClickOutside = (event) => {
  if (dropdown.value && !dropdown.value.contains(event.target) && 
      !event.target.closest('.multi-select-input')) {
    closeDropdown()
  }
}

// Watch search query
watch(searchQuery, (newQuery) => {
  emit('search', newQuery)
})

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Main Container */
.multi-select {
  position: relative;
  width: 100%;
}

.multi-select.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Label */
.multi-select-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

/* Input Container */
.multi-select-input {
  position: relative;
  min-height: 2.5rem;
  padding: 0.5rem 2.5rem 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.multi-select-input:hover:not(.is-disabled) {
  border-color: #9ca3af;
}

.multi-select-input:focus,
.multi-select.is-open .multi-select-input {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.multi-select.is-disabled .multi-select-input {
  background-color: #f9fafb;
  cursor: not-allowed;
}

/* Selected Items */
.selected-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
}

.selected-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: #eff6ff;
  color: #1e40af;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  max-width: 180px;
}

.selected-tag:hover {
  background: #dbeafe;
}

.remove-tag-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  margin: 0;
  font-size: 1rem;
  line-height: 1;
  transition: color 0.2s ease;
}

.remove-tag-btn:hover {
  color: #ef4444;
}

.more-count {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  background: #f3f4f6;
  color: #6b7280;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Placeholder */
.placeholder {
  color: #9ca3af;
  font-size: 0.875rem;
  flex: 1;
}

/* Dropdown Arrow */
.dropdown-arrow {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  transition: transform 0.2s ease;
  pointer-events: none;
}

.dropdown-arrow.is-open {
  transform: translateY(-50%) rotate(180deg);
}

/* Dropdown Menu */
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 50;
  margin-top: 0.25rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

/* Search Container */
.search-container {
  padding: 0.75rem;
  border-bottom: 1px solid #f3f4f6;
}

.search-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  outline: none;
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Select All Option */
.select-all-option {
  border-bottom: 1px solid #ccced0;
  background: #f9fafb;
}

/* Options Container */
.options-container {
  max-height: 200px;
  overflow-y: auto;
}

/* Option Items */
.option-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border: none;
  width: 100%;
  text-align: left;
}

.option-item:hover:not(.is-disabled) {
  background-color: #f3f4f6;
}

.option-item.is-selected {
  background-color: #eff6ff;
  color: #1e40af;
}

.option-item.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.option-item input[type="checkbox"] {
  margin: 0;
  cursor: pointer;
}

.option-item.is-disabled input[type="checkbox"] {
  cursor: not-allowed;
}

.option-label {
  flex: 1;
  font-size: 0.875rem;
}

.option-count {
  font-size: 0.75rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}

/* No Results */
.no-results {
  padding: 2rem 1rem;
  text-align: center;
  color: #9ca3af;
  font-size: 0.875rem;
}

/* Error and Helper Text */
.error-message {
  margin-top: 0.5rem;
  color: #ef4444;
  font-size: 0.875rem;
}

.helper-text {
  margin-top: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

/* Transitions */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}

/* Responsive */
@media (max-width: 640px) {
  .selected-tag {
    max-width: 120px;
    font-size: 0.75rem;
  }
  
  .option-item {
    padding: 0.625rem 0.75rem;
  }
  
  .dropdown-menu {
    margin-top: 0.125rem;
  }
}

/* Scrollbar Styling */
.options-container::-webkit-scrollbar {
  width: 6px;
}

.options-container::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.options-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.options-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>