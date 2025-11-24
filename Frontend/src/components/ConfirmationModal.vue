<template>
  <div v-if="show" class="modal-overlay" @click="handleOverlayClick">
    <div class="confirmation-modal" @click.stop>
      <div class="modal-header-confirm">
        <div class="modal-icon" :class="type">
          <i v-if="type === 'danger'" class="fa-solid fa-exclamation-triangle"></i>
          <i v-else-if="type === 'warning'" class="fa-solid fa-question-circle"></i>
          <i v-else class="fa-solid fa-info-circle"></i>
        </div>
        <h3 class="modal-title">{{ title }}</h3>
      </div>
      
      <div class="modal-body">
        <p class="modal-message">{{ message }}</p>
        <p v-if="subMessage" class="modal-sub-message">{{ subMessage }}</p>
      </div>
      
      <div class="modal-actions">
        <button 
          class="btn secondary" 
          @click="handleCancel"
          :disabled="loading"
        >
          {{ cancelText }}
        </button>
        <button 
          class="btn" 
          :class="[type]" 
          @click="handleConfirm"
          :disabled="loading"
        >
          {{ loading ? loadingText : confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'info', // info, warning, danger
    validator: (value) => ['info', 'warning', 'danger'].includes(value)
  },
  title: {
    type: String,
    default: 'Xác nhận'
  },
  message: {
    type: String,
    required: true
  },
  subMessage: {
    type: String,
    default: ''
  },
  confirmText: {
    type: String,
    default: 'Xác nhận'
  },
  cancelText: {
    type: String,
    default: 'Hủy bỏ'
  },
  loadingText: {
    type: String,
    default: 'Đang xử lý...'
  },
  loading: {
    type: Boolean,
    default: false
  },
  closeOnOverlay: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['confirm', 'cancel', 'close'])

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
  emit('close')
}

const handleOverlayClick = () => {
  if (props.closeOnOverlay && !props.loading) {
    handleCancel()
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

.confirmation-modal {
  background: white;
  border-radius: 12px;
  min-width: 400px;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: slideIn 0.2s ease-out;
}

.modal-header-confirm {
  display: flex;
  align-items: center;
  padding: 1.5rem 1.5rem 1rem 1.5rem;
}

.modal-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  font-size: 20px;
}

.modal-icon.info {
  background: #dbeafe;
  color: #2563eb;
}

.modal-icon.warning {
  background: #fef3c7;
  color: #d97706;
}

.modal-icon.danger {
  background: #fee2e2;
  color: #dc2626;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.modal-body {
  padding: 0 1.5rem 1.5rem 1.5rem;
}

.modal-message {
  margin: 0 0 0.5rem 0;
  color: #4b5563;
  line-height: 1.5;
}

.modal-sub-message {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.4;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem 1.5rem 1.5rem;
  justify-content: flex-end;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 0 0 12px 12px;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn.secondary {
  background: white;
  color: #6b7280;
  border-color: #d1d5db;
}

.btn.secondary:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn.info {
  background: #2563eb;
  color: white;
}

.btn.info:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn.warning {
  background: #d97706;
  color: white;
}

.btn.warning:hover:not(:disabled) {
  background: #b45309;
}

.btn.danger {
  background: #dc2626;
  color: white;
}

.btn.danger:hover:not(:disabled) {
  background: #b91c1c;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .confirmation-modal {
    min-width: 90vw;
    margin: 1rem;
  }
  
  .modal-header-confirm {
    padding: 1rem 1rem 0.75rem 1rem;
  }
  
  .modal-body {
    padding: 0 1rem 1rem 1rem;
  }
  
  .modal-actions {
    padding: 0.75rem 1rem 1rem 1rem;
    flex-direction: column-reverse;
  }
  
  .btn {
    width: 100%;
    padding: 0.75rem 1rem;
  }
}
</style>