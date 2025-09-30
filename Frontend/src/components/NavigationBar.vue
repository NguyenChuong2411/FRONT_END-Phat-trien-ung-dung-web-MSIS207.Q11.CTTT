<template>
  <nav class="navigation-bar">
    <!-- Logo Section -->
    <div class="nav-logo">
      <router-link to="/" class="logo-link">
        <img src="@/assets/logo.svg" alt="Enly Logo" class="logo-image" />
      </router-link>
    </div>

    <!-- Navigation Menu -->
    <div class="nav-menu">
      <ul class="nav-list">
        <li class="nav-item">
          <router-link to="/" class="nav-link" :class="{ active: isActiveRoute('/') }">
            Trang chủ
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/about" class="nav-link" :class="{ active: isActiveRoute('/about') }">
            Về Enly
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/online-test" class="nav-link" :class="{ active: isActiveRoute('/online-test') }">
            Luyện thi Online
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/news" class="nav-link" :class="{ active: isActiveRoute('/news') }">
            Tin tức
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/sharing" class="nav-link" :class="{ active: isActiveRoute('/sharing') }">
            Góc chia sẻ
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/flashcard" class="nav-link" :class="{ active: isActiveRoute('/flashcard') }">
            Học Flashcard
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/contact" class="nav-link" :class="{ active: isActiveRoute('/contact') }">
            Liên hệ
          </router-link>
        </li>
      </ul>
    </div>

    <!-- Mobile Menu Toggle (for responsive design) -->
    <div class="mobile-menu-toggle" @click="toggleMobileMenu">
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </div>

    <!-- Mobile Menu Overlay -->
    <div class="mobile-menu-overlay" :class="{ active: isMobileMenuOpen }" @click="closeMobileMenu">
      <div class="mobile-menu">
        <ul class="mobile-nav-list">
          <li class="mobile-nav-item" v-for="item in navigationItems" :key="item.path">
            <router-link 
              :to="item.path" 
              class="mobile-nav-link" 
              @click="closeMobileMenu"
            >
              {{ item.name }}
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import './NavigationBar.css'

// Reactive data
const isMobileMenuOpen = ref(false)
const route = useRoute()

// Navigation items configuration
const navigationItems = [
  { name: 'Trang chủ', path: '/' },
  { name: 'Về Enly', path: '/about' },
  { name: 'Luyện thi Online', path: '/online-test' },
  { name: 'Tin tức', path: '/news' },
  { name: 'Góc chia sẻ', path: '/sharing' },
  { name: 'Học Flashcard', path: '/flashcard' },
  { name: 'Liên hệ', path: '/contact' }
]

// Methods
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const isActiveRoute = (path) => {
  // Special case for online-test routes
  if (path === '/online-test') {
    return route.path === '/online-test' || route.path.startsWith('/online-test/')
  }
  return route.path === path
}
</script>