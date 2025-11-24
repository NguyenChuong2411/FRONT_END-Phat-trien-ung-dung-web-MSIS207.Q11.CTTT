import { ref } from 'vue'

// Global notification state
const notifications = ref([])
let notificationId = 0

export function useNotification() {
  const showNotification = (options) => {
    const id = ++notificationId
    const notification = {
      id,
      show: true,
      type: options.type || 'info',
      title: options.title || '',
      message: options.message || '',
      duration: options.duration || 5000,
      autoClose: options.autoClose !== false
    }

    notifications.value.push(notification)

    // Auto remove notification after duration
    if (notification.autoClose) {
      setTimeout(() => {
        removeNotification(id)
      }, notification.duration)
    }

    return id
  }

  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const success = (message, title = '', options = {}) => {
    return showNotification({
      type: 'success',
      title,
      message,
      ...options
    })
  }

  const error = (message, title = '', options = {}) => {
    return showNotification({
      type: 'error',
      title,
      message,
      autoClose: false, // Error messages should be manually closed
      ...options
    })
  }

  const warning = (message, title = '', options = {}) => {
    return showNotification({
      type: 'warning',
      title,
      message,
      ...options
    })
  }

  const info = (message, title = '', options = {}) => {
    return showNotification({
      type: 'info',
      title,
      message,
      ...options
    })
  }

  const clearAll = () => {
    notifications.value = []
  }

  return {
    notifications,
    showNotification,
    removeNotification,
    success,
    error,
    warning,
    info,
    clearAll
  }
}