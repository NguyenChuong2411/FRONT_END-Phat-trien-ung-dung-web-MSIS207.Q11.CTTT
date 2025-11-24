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
        <li class="nav-item" v-if="isAdmin">
          <router-link to="/test-management" class="nav-link" :class="{ active: isActiveRoute('/test-management') }">
            Quản lý đề thi
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/news" class="nav-link" :class="{ active: isActiveRoute('/news') }">
            Tin tức
          </router-link>
        </li>
        <!-- <li class="nav-item">
          <router-link to="/sharing" class="nav-link" :class="{ active: isActiveRoute('/sharing') }">
            Góc chia sẻ
          </router-link>
        </li> -->
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

    <!-- Account Section -->
    <div class="account-section">
      <div class="account-dropdown" @click="toggleAccountDropdown" ref="accountDropdown">
        <div class="account-trigger">
          <i class="fa-solid fa-user-circle account-icon"></i>
          <span class="account-text">{{ isLoggedIn ? userName : 'Tài khoản' }}</span>
          <i class="fa-solid fa-sun dropdown-arrow" :class="{ 'rotate': isAccountDropdownOpen }"></i>
        </div>
        

        <div class="nav-dropdown-menu" :class="{ 'show': isAccountDropdownOpen }">
          <div v-if="isLoggedIn" class="dropdown-content">
            <div class="dropdown-header">
              <div class="user-avatar">
                <i class="fa-solid fa-user-circle"></i>
              </div>
              <div class="user-info">
                <span class="user-name">{{ userName }}</span>
                <span class="user-email">{{ userEmail }}</span>
              </div>
            </div>
            <hr class="dropdown-divider">
            <a href="#" class="dropdown-item" @click="goToProfile">
              <i class="fa-solid fa-user"></i>
              <span>Thông tin cá nhân</span>
            </a>
            <a href="#" class="dropdown-item" @click="goToHistory">
              <i class="fa-solid fa-address-book"></i>
              <span>Lịch sử làm bài</span>
            </a>
            <hr class="dropdown-divider">
            <a href="#" class="dropdown-item logout" @click="handleLogout">
              <span>Đăng xuất</span>
            </a>
          </div>

          <div v-else class="dropdown-content">
            <a href="#" class="dropdown-item login" @click="handleLogin">
              <span>Đăng nhập</span>
            </a>
            <a href="#" class="dropdown-item register" @click="handleRegister">
              <span>Đăng ký</span>
            </a>
          </div>
        </div>
      </div>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authAPI } from '@/services/AuthAPI.js'
import './NavigationBar.css'

const isAdmin = computed(() => {
  return isLoggedIn.value && userRole.value === 1;
})

// Reactive data
const isMobileMenuOpen = ref(false)
const isAccountDropdownOpen = ref(false)
const route = useRoute()
const router = useRouter()

// Account related data - sử dụng thực từ AuthAPI
const isLoggedIn = ref(false)
const userName = ref('')
const userEmail = ref('')
const userRole = ref(2)

// Khởi tạo trạng thái đăng nhập khi component được mount
onMounted(() => {
  updateAuthState()
  // Lắng nghe sự kiện thay đổi trạng thái auth
  window.addEventListener('auth-state-changed', updateAuthState)
})

onUnmounted(() => {
  // Cleanup event listener
  window.removeEventListener('auth-state-changed', updateAuthState)
})

// Hàm cập nhật trạng thái đăng nhập
const updateAuthState = async () => {
  isLoggedIn.value = authAPI.isAuthenticated()
  if (isLoggedIn.value) {
    // Cố gắng lấy thông tin từ localStorage trước
    let userInfo = authAPI.getUserInfo()
    
    if (userInfo) {
      userName.value = userInfo.fullName || userInfo.email?.split('@')[0] || 'User'
      userEmail.value = userInfo.email || ''
      userRole.value = userInfo.roleId || 2
    }
    
    // Lấy thông tin mới nhất từ server để đồng bộ
    try {
      const result = await authAPI.getUserProfile()
      if (result.success) {
        userName.value = result.data.fullName || result.data.email?.split('@')[0] || 'User'
        userEmail.value = result.data.email || ''
        if (result.data.roleId) {
            userRole.value = result.data.roleId;
        }
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      // Nếu lỗi và chưa có thông tin user, dùng thông tin từ localStorage
      if (!userInfo) {
        userName.value = 'User'
        userEmail.value = ''
      }
    }
  } else {
    userName.value = ''
    userEmail.value = ''
    userRole.value = 2
  }
}

// Navigation items configuration
const navigationItems = [
  { name: 'Trang chủ', path: '/' },
  { name: 'Về Enly', path: '/about' },
  { name: 'Luyện thi Online', path: '/online-test' },
  { name: 'Quản lý đề thi', path: '/test-management' },
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

const toggleAccountDropdown = (event) => {
  event.stopPropagation()
  isAccountDropdownOpen.value = !isAccountDropdownOpen.value
}

const closeAccountDropdown = () => {
  isAccountDropdownOpen.value = false
}

const isActiveRoute = (path) => {
  // Special case for online-test routes
  if (path === '/online-test') {
    return route.path === '/online-test' || route.path.startsWith('/online-test/')
  }
  return route.path === path
}

// Account actions
const handleLogin = () => {
  closeAccountDropdown()
  // Navigate to login page
  router.push('/login')
}

const handleRegister = () => {
  closeAccountDropdown()
  // Navigate to register page
  router.push('/login?mode=register')
}

const handleLogout = () => {
  closeAccountDropdown()
  // Thực hiện logout với AuthAPI
  const result = authAPI.logout()
  if (result.success) {
    // Cập nhật trạng thái UI
    updateAuthState()
    // Thông báo và redirect về trang chủ
    alert('Đăng xuất thành công!')
    router.push('/')
  }
}

const goToProfile = () => {
  closeAccountDropdown()
  // Navigate to profile page
  router.push('/profile')
}

const goToSettings = () => {
  closeAccountDropdown()
  // TODO: Navigate to settings page
  console.log('Navigate to settings')
  // router.push('/settings')
}

const goToHistory = () => {
  closeAccountDropdown()
  // Navigate to test history page
  router.push('/test-history')
}

// Handle click outside to close dropdowns
const handleClickOutside = (event) => {
  if (isAccountDropdownOpen.value) {
    closeAccountDropdown()
  }
  if (isMobileMenuOpen.value) {
    closeMobileMenu()
  }
}

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>