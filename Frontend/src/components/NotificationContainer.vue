<template>
  <div class="notification-container">
    <NotificationToast
      v-for="notification in notifications"
      :key="notification.id"
      :show="notification.show"
      :type="notification.type"
      :title="notification.title"
      :message="notification.message"
      :duration="notification.duration"
      :auto-close="notification.autoClose"
      @close="removeNotification(notification.id)"
    />
  </div>
</template>

<script setup>
import { useNotification } from '@/composables/useNotification'
import NotificationToast from './NotificationToast.vue'

const { notifications, removeNotification } = useNotification()
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 1000;
  pointer-events: none;
}

.notification-container > * {
  pointer-events: auto;
  margin-bottom: 10px;
}
</style>