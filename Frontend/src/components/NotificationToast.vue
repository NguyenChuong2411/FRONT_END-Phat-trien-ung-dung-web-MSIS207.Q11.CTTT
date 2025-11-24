<template>
  <div v-if="show" class="notification-toast" :class="type">
    <div class="toast-content">
      <div class="toast-icon">
        <i v-if="type === 'success'" class="fa-solid fa-check-circle"></i>
        <i v-else-if="type === 'error'" class="fa-solid fa-exclamation"></i>
        <i v-else-if="type === 'warning'" class="fa-solid fa-exclamation"></i>
        <i v-else class="fa-solid fa-info-circle"></i>
      </div>
      <div class="toast-message">
        <div v-if="title" class="toast-title">{{ title }}</div>
        <div class="toast-text">{{ message }}</div>
      </div>
      <button class="toast-close" @click="close">
        <i class="fa-solid fa-circle-xmark"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'info', // success, error, warning, info
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 5000 // 5 seconds
  },
  autoClose: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close'])

let timeoutId = null

const close = () => {
  emit('close')
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
}

watch(() => props.show, (newValue) => {
  if (newValue && props.autoClose) {
    timeoutId = setTimeout(() => {
      close()
    }, props.duration)
  }
})
</script>

<style scoped>
.notification-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  min-width: 300px;
  max-width: 500px;
  z-index: 1000;
  animation: slideInRight 0.3s ease-out;
}

.notification-toast.success {
  background: linear-gradient(135deg, #4ade80, #22c55e);
  color: white;
}

.notification-toast.error {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.notification-toast.warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.notification-toast.info {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.toast-content {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

.toast-icon {
  margin-right: 12px;
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.toast-message {
  flex: 1;
}

.toast-title {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
}

.toast-text {
  font-size: 14px;
  line-height: 1.4;
  opacity: 0.95;
}

.toast-close {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 4px;
  margin-left: 12px;
  border-radius: 4px;
  transition: background-color 0.2s;
  flex-shrink: 0;
}

.toast-close:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification-toast.hide {
  animation: slideOutRight 0.3s ease-in forwards;
}

@keyframes slideOutRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .notification-toast {
    left: 20px;
    right: 20px;
    min-width: auto;
    max-width: none;
  }
  
  @keyframes slideInRight {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
}
</style>