<script setup>
import { RouterView } from 'vue-router'
import NavigationBar from './components/NavigationBar.vue'
import Footer from './components/Footer.vue'
import NotificationContainer from './components/NotificationContainer.vue'

</script>

<template>
  <!-- Navigation Bar -->
  <NavigationBar />

  <!-- Main Content -->
  <main class="main-content">
    <RouterView />
  </main>

  <!-- Footer -->
  <Footer />

  <!-- Notification System -->
  <NotificationContainer />

</template>

<style>
/* Global styles for full-width layout */
body {
  margin: 0;
  padding: 0;
}

#app {
  margin: 0;
  padding: 0;
  width: 100%;
}

.main-content {
  padding-top: 80px; /* Add space for fixed navigation bar */
  min-height: calc(100vh - 80px);
  margin-bottom: 0; /* Remove any bottom margin to ensure footer connects */
}
</style>

<style scoped>
.main-content {
  min-height: 100vh;
}

/* Global styles for the app */
:global(body) {
  margin: 0;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #1f2937;
  background-color: #ffffff;
}

:global(*) {
  box-sizing: border-box;
}

:global(h1, h2, h3, h4, h5, h6) {
  margin: 0;
  font-weight: 600;
}

:global(p) {
  margin: 0 0 1rem 0;
}

:global(a) {
  color: inherit;
  text-decoration: none;
}

:global(button) {
  font-family: inherit;
}

:global(.container) {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 768px) {
  :global(.container) {
    padding: 0 2rem;
  }
}
</style>
