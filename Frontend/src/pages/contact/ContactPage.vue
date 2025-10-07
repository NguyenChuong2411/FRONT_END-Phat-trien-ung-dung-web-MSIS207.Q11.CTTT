<template>
  <div class="contact-page">
    <!-- Header Section -->
    <section class="page-header">
      <div class="container">
        <h1 class="page-title">Liên hệ</h1>
        <p class="page-subtitle">Hãy kết nối với chúng tôi để bắt đầu hành trình học tiếng Anh</p>
      </div>
    </section>

    <!-- Contact Content -->
    <section class="contact-content">
      <div class="container">
        <div class="contact-layout">
          <!-- Contact Form -->
          <div class="contact-form-section">
            <h2>Gửi tin nhắn cho chúng tôi</h2>
            <form @submit.prevent="submitForm" class="contact-form">
              <div class="form-row">
                <div class="form-group">
                  <label for="firstName">Họ *</label>
                  <input 
                    type="text" 
                    id="firstName" 
                    v-model="form.firstName" 
                    required 
                    class="form-input"
                  />
                </div>
                <div class="form-group">
                  <label for="lastName">Tên *</label>
                  <input 
                    type="text" 
                    id="lastName" 
                    v-model="form.lastName" 
                    required 
                    class="form-input"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="email">Email *</label>
                  <input 
                    type="email" 
                    id="email" 
                    v-model="form.email" 
                    required 
                    class="form-input"
                  />
                </div>
                <div class="form-group">
                  <label for="phone">Số điện thoại</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    v-model="form.phone" 
                    class="form-input"
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="subject">Chủ đề *</label>
                <select id="subject" v-model="form.subject" required class="form-select">
                  <option value="">Chọn chủ đề</option>
                  <option value="course-info">Thông tin khóa học</option>
                  <option value="enrollment">Đăng ký học</option>
                  <option value="support">Hỗ trợ kỹ thuật</option>
                  <option value="partnership">Hợp tác</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div class="form-group">
                <label for="message">Tin nhắn *</label>
                <textarea 
                  id="message" 
                  v-model="form.message" 
                  required 
                  rows="5" 
                  class="form-textarea"
                  placeholder="Nhập nội dung tin nhắn của bạn..."
                ></textarea>
              </div>

              <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                <span v-if="isSubmitting">Đang gửi...</span>
                <span v-else>Gửi tin nhắn</span>
              </button>
            </form>

            <div v-if="submitMessage" class="submit-message" :class="submitSuccess ? 'success' : 'error'">
              {{ submitMessage }}
            </div>
          </div>

          <!-- Contact Info -->
          <div class="contact-info-section">
            <h2>Thông tin liên hệ</h2>
            
            <div class="contact-methods">
              <div class="contact-method">
                <div class="method-icon">📧</div>
                <div class="method-content">
                  <h4>Email</h4>
                  <p>info@enly.vn</p>
                  <p>support@enly.vn</p>
                </div>
              </div>

              <div class="contact-method">
                <div class="method-icon">📞</div>
                <div class="method-content">
                  <h4>Điện thoại</h4>
                  <p>Hotline: (028) 1234 5678</p>
                  <p>Zalo: 0909 123 456</p>
                </div>
              </div>

              <div class="contact-method">
                <div class="method-icon">📍</div>
                <div class="method-content">
                  <h4>Địa chỉ</h4>
                  <p>123 Nguyễn Văn Cừ, Quận 5</p>
                  <p>TP. Hồ Chí Minh, Việt Nam</p>
                </div>
              </div>

              <div class="contact-method">
                <div class="method-icon">🕒</div>
                <div class="method-content">
                  <h4>Giờ làm việc</h4>
                  <p>Thứ 2 - Thứ 6: 8:00 - 20:00</p>
                  <p>Thứ 7 - CN: 8:00 - 17:00</p>
                </div>
              </div>
            </div>

            <!-- Social Media -->
            <div class="social-media">
              <h4>Theo dõi chúng tôi</h4>
              <div class="social-links">
                <a href="#" class="social-link facebook">Facebook</a>
                <a href="#" class="social-link youtube">YouTube</a>
                <a href="#" class="social-link instagram">Instagram</a>
                <a href="#" class="social-link linkedin">LinkedIn</a>
              </div>
            </div>
          </div>
        </div>

        <!-- Map Section -->
        <div class="map-section">
          <h2>Vị trí của chúng tôi</h2>
          <div class="map-container">
            <div class="map-placeholder">
              <p>🗺️ Bản đồ Google Maps sẽ được tích hợp tại đây</p>
              <p>123 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

// Reactive data
const isSubmitting = ref(false)
const submitMessage = ref('')
const submitSuccess = ref(false)

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
})

// Methods
const submitForm = async () => {
  isSubmitting.value = true
  submitMessage.value = ''
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Reset form
    Object.keys(form).forEach(key => {
      form[key] = ''
    })
    
    submitMessage.value = 'Tin nhắn đã được gửi thành công! Chúng tôi sẽ phản hồi trong vòng 24h.'
    submitSuccess.value = true
    
    // Clear message after 5 seconds
    setTimeout(() => {
      submitMessage.value = ''
    }, 5000)
    
  } catch (error) {
    submitMessage.value = 'Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.'
    submitSuccess.value = false
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  console.log('Contact page loaded')
})
</script>

<style src="./ContactPage.css" scoped></style>