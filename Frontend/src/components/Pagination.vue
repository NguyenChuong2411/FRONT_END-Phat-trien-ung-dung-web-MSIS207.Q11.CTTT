<template>
  <div class="pagination-container">
    <nav class="pagination">
      <!-- Previous button -->
      <button 
        class="pagination-btn pagination-prev"
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
      >
        ‹
      </button>

      <!-- Page numbers -->
      <template v-for="page in visiblePages" :key="page">
        <button 
          v-if="page !== '...'"
          class="pagination-btn pagination-number"
          :class="{ active: page === currentPage }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
        <span v-else class="pagination-dots">...</span>
      </template>

      <!-- Next button -->
      <button 
        class="pagination-btn pagination-next"
        :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)"
      >
        ›
      </button>
    </nav>
  </div>
</template>

<script setup>
import { computed, defineEmits, defineProps } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    default: 1
  },
  totalPages: {
    type: Number,
    required: true
  },
  maxVisiblePages: {
    type: Number,
    default: 5
  }
})

const emit = defineEmits(['page-change'])

const visiblePages = computed(() => {
  const { currentPage, totalPages, maxVisiblePages } = props
  const pages = []
  
  if (totalPages <= maxVisiblePages) {
    // Show all pages if total is less than max visible
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    // Complex pagination logic
    const half = Math.floor(maxVisiblePages / 2)
    let start = Math.max(1, currentPage - half)
    let end = Math.min(totalPages, start + maxVisiblePages - 1)
    
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1)
    }
    
    // Add first page and ellipsis if needed
    if (start > 1) {
      pages.push(1)
      if (start > 2) {
        pages.push('...')
      }
    }
    
    // Add visible pages
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    // Add ellipsis and last page if needed
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push('...')
      }
      pages.push(totalPages)
    }
  }
  
  return pages
})

const goToPage = (page) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('page-change', page)
  }
}
</script>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: center;
  margin: 2rem 0;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: white;
  padding: 0.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pagination-btn {
  min-width: 2.5rem;
  height: 2.5rem;
  border: 1px solid #e5e7eb;
  background: white;
  color: #6b7280;
  cursor: pointer;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f3f4f6;
  border-color: #d1d5db;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn.active {
  background-color: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.pagination-btn.active:hover {
  background-color: #2563eb;
}

.pagination-dots {
  padding: 0 0.5rem;
  color: #9ca3af;
  font-weight: 500;
}

.pagination-prev,
.pagination-next {
  font-size: 1.125rem;
  font-weight: 600;
}

/* Responsive design */
@media (max-width: 640px) {
  .pagination-btn {
    min-width: 2rem;
    height: 2rem;
    font-size: 0.875rem;
  }
  
  .pagination-dots {
    padding: 0 0.25rem;
  }
}
</style>