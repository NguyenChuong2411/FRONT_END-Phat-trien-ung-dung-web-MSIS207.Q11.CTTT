<template>
  <div class="user-profile-page">
    <!-- Header Section -->
    <!-- <section class="page-header">
      <div class="header-container">
        <h1 class="page-title">THÔNG TIN CÁ NHÂN</h1>
        <p class="page-subtitle">Quản lý thông tin tài khoản của bạn</p>
      </div>
    </section> -->

    <!-- Profile Content -->
    <section class="profile-section">
      <div class="content-container">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Đang tải thông tin người dùng...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-container">
          <div class="error-icon">⚠️</div>
          <h3 class="error-title">Có lỗi xảy ra</h3>
          <p class="error-message">{{ error }}</p>
          <button class="retry-btn" @click="loadUserProfile">Thử lại</button>
        </div>

        <!-- Profile Content -->
        <div v-else class="profile-content">
          <div class="profile-card">
            <!-- Profile Header -->
            <div class="profile-header">
              <div class="profile-avatar">
                <i class="fa-solid fa-user-circle"></i>
              </div>
              <div class="profile-info">
                <h2 class="profile-name">{{ userProfile?.fullName || 'Chưa cập nhật' }}</h2>
                <p class="profile-email">{{ userProfile?.email || '' }}</p>
                <span class="profile-status">Tài khoản đã xác thực</span>
              </div>
            </div>

            <!-- Profile Details -->
            <div class="profile-details">
              <h3 class="section-title">Thông tin chi tiết</h3>
              
              <div class="detail-group">
                <div class="detail-item">
                  <span class="detail-label">Họ và tên:</span>
                  <span class="detail-value">{{ userProfile?.fullName || 'Chưa cập nhật' }}</span>
                </div>
                
                <div class="detail-item">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value">{{ userProfile?.email || 'Chưa cập nhật' }}</span>
                </div>
                
                <!-- <div class="detail-item">
                  <span class="detail-label">ID người dùng:</span>
                  <span class="detail-value">{{ userProfile?.id || 'N/A' }}</span>
                </div> -->
              </div>

              <!-- Future expansion placeholder -->
              <div class="future-sections">
                <div class="coming-soon">
                  <h4>Sắp có thêm:</h4>
                  <ul>
                    <li>Thông tin liên hệ</li>
                    <li>Cài đặt tài khoản</li>
                    <li>Thống kê học tập</li>
                    <li>Lịch sử hoạt động</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Profile Actions -->
            <div class="profile-actions">
              <button class="action-btn primary" @click="refreshProfile">
                Làm mới thông tin
              </button>
              <button class="action-btn secondary" @click="goBack">
                Quay lại
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '@/services/AuthAPI.js'

const router = useRouter()

// Reactive data
const isLoading = ref(true)
const error = ref(null)
const userProfile = ref(null)

// Methods
const loadUserProfile = async () => {
  isLoading.value = true
  error.value = null

  try {
    // Kiểm tra xác thực
    if (!authAPI.isAuthenticated()) {
      router.push('/login?redirect=/profile')
      return
    }

    // Lấy thông tin user profile từ server
    const result = await authAPI.getUserProfile()
    
    if (result.success) {
      userProfile.value = result.data
    } else {
      error.value = result.error || 'Không thể tải thông tin người dùng'
    }
  } catch (err) {
    console.error('Error loading user profile:', err)
    
    if (err.response?.status === 401) {
      // Token không hợp lệ, chuyển về login
      router.push('/login?redirect=/profile')
      return
    }
    
    error.value = 'Có lỗi xảy ra khi tải thông tin. Vui lòng thử lại sau.'
  } finally {
    isLoading.value = false
  }
}

const refreshProfile = async () => {
  await loadUserProfile()
}

const goBack = () => {
  router.back()
}

// Lifecycle
onMounted(() => {
  loadUserProfile()
})
</script>

<style scoped>
.user-profile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: var(--font-family-base, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif);
}

/* Header Section */
.page-header {
  background: transparent;
  color: white;
  padding: 3rem 0 2rem 0;
  text-align: center;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.05em;
}

.page-subtitle {
  font-size: 1.1rem;
  margin: 0;
  opacity: 0.9;
}

/* Profile Section */
.profile-section {
  background: #f8fafc;
  min-height: calc(100vh - 200px);
  padding: 2rem 0;
  /* border-radius: 2rem 2rem 0 0; */
  margin-top: 1rem;
}

.content-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #F6871F;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-container p {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
}

/* Error State */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 2rem;
  text-align: center;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-title {
  color: #dc2626;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.error-message {
  color: #6b7280;
  font-size: 1rem;
  margin-bottom: 1.5rem;
}

.retry-btn {
  background-color: #F6871F;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.retry-btn:hover {
  background-color: #e67e22;
}

/* Profile Card */
.profile-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.profile-header {
  background: linear-gradient(135deg, #F6871F 0%, #e67e22 100%);
  color: white;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.profile-avatar {
  font-size: 4rem;
  opacity: 0.9;
}

.profile-name {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.profile-email {
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
  opacity: 0.9;
}

.profile-status {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Profile Details */
.profile-details {
  padding: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #f3f4f6;
  padding-bottom: 0.5rem;
}

.detail-group {
  display: grid;
  gap: 1rem;
}

.detail-item {
  display: grid;
  grid-template-columns: 1fr 8fr;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  /* border-left: 4px solid #F6871F; */
}

.detail-label {
  font-weight: 600;
  color: #374151;
}

.detail-value {
  color: #6b7280;
  word-break: break-word;
}

/* Future Sections */
.future-sections {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.coming-soon {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.coming-soon h4 {
  color: #0369a1;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.coming-soon ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.coming-soon li {
  color: #0284c7;
  padding: 0.25rem 0;
  position: relative;
  padding-left: 1.5rem;
}

.coming-soon li::before {
  content: "🚀";
  position: absolute;
  left: 0;
}

/* Profile Actions */
.profile-actions {
  background: #f9fafb;
  padding: 1.5rem 2rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
  border-top: 1px solid #e5e7eb;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.action-btn.primary {
  background-color: #F6871F;
  color: white;
}

.action-btn.primary:hover {
  background-color: #e67e22;
  transform: translateY(-1px);
}

.action-btn.secondary {
  background-color: #6b7280;
  color: white;
}

.action-btn.secondary:hover {
  background-color: #374151;
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .detail-item {
    grid-template-columns: 1fr;
  }
  
  .profile-actions {
    flex-direction: column;
  }
  
  .content-container {
    padding: 0 1rem;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 2rem 0 1.5rem 0;
  }
  
  .profile-details {
    padding: 1.5rem;
  }
  
  .profile-header {
    padding: 1.5rem;
  }
}
</style>