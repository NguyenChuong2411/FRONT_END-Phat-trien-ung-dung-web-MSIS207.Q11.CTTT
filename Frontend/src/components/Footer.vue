<template>
  <footer class="footer">
    <div class="footer-container">
      <!-- Main Footer Content -->
      <div class="footer-content">
        <!-- Logo Section -->
        <div class="footer-logo-section">
          <div class="footer-logo">
            <img src="@/assets/logo.svg" alt="Enly Logo" class="logo-image" />
          </div>
          <!-- Native Speaker Badge -->
          <div class="native-speaker-badge">
            <span class="badge-text">Native-like speakers</span>
          </div>
        </div>

        <!-- Contact Information Columns -->
        <div class="footer-columns">
          <!-- Contact Info 1 -->
          <div class="footer-column">
            <h3 class="footer-column-title">Địa chỉ chi nhánh</h3>
            <div class="contact-info">
              <h4 class="contact-branch">Enly Đống Đa</h4>
              <div class="contact-item">
                <span class="contact-icon">📍</span>
                <span class="contact-text">Tầng 8, văn công nghệ, 25 Vũ Ngọc Phan, Đống Đa, Hà Nội</span>
              </div>
              <div class="contact-item">
                <span class="contact-icon">📞</span>
                <span class="contact-text">0966799488</span>
              </div>
            </div>

            <div class="contact-info">
              <h4 class="contact-branch">Enly Hai Bà Trưng</h4>
              <div class="contact-item">
                <span class="contact-icon">📍</span>
                <span class="contact-text">Số 155 Bạch Mai, Hai Bà Trưng, Hà Nội</span>
              </div>
              <div class="contact-item">
                <span class="contact-icon">📞</span>
                <span class="contact-text">0901699488</span>
              </div>
            </div>
          </div>


          <!-- Links Column -->
          <div class="footer-column">
            <h3 class="footer-column-title">Tìm hiểu thêm</h3>
            <ul class="footer-links">
              <li><router-link to="/about" class="footer-link">Về Enly</router-link></li>
              <li><router-link to="/news" class="footer-link">Tin tức</router-link></li>
              <li><router-link to="/contact" class="footer-link">Liên hệ</router-link></li>
            </ul>
          </div>

          <!-- Newsletter Column -->
          <div class="footer-column newsletter-column">
            <h3 class="footer-column-title">Nhận ngay ưu đãi mới nhất từ Enly</h3>
            <div class="newsletter-form">
              <div class="input-group">
                <input 
                  type="email" 
                  v-model="emailInput"
                  placeholder="Nhập email của bạn"
                  class="email-input"
                  @keyup.enter="subscribeNewsletter"
                />
                <button 
                  @click="subscribeNewsletter"
                  class="subscribe-btn"
                  :disabled="!emailInput.trim()"
                >
                  ➤
                </button>
              </div>
              <!-- <div class="trust-badge">
                <div class="trust-icon">✓</div>
                <span class="trust-text">Đã thông báo<br/>Bộ Công Thương</span>
              </div> -->
            </div>
          </div>
        </div>
      </div>

      <!-- Social Media Links -->
      <div class="footer-social">
        <div class="social-icons">
          <a href="#" class="social-icon facebook" aria-label="Facebook">
            <span>f</span>
          </a>
          <a href="#" class="social-icon youtube" aria-label="YouTube">
            <span>▷</span>
          </a>
          <a href="#" class="social-icon instagram" aria-label="Instagram">
            <span>📷</span>
          </a>
          <a href="#" class="social-icon tiktok" aria-label="TikTok">
            <span>♪</span>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref } from 'vue'

// Newsletter subscription
const emailInput = ref('')

const subscribeNewsletter = () => {
  if (emailInput.value.trim()) {
    console.log('Subscribing email:', emailInput.value)
    // Here you would implement the actual newsletter subscription logic
    alert('Cảm ơn bạn đã đăng ký nhận tin!')
    emailInput.value = ''
  }
}
</script>

<style scoped>
.footer {
  background: linear-gradient(135deg, #4C63D2 0%, #2D4AA7 50%, #1E3A8A 100%);
  color: white;
  padding: 60px 0 20px;
  position: relative;
  overflow: hidden;
}

.footer-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 1;
}

.footer-content {
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
}

.footer-logo-section {
  flex: 0 0 250px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 20px;
}

.footer-logo .logo-image {
  height: 60px;
  width: auto;
  filter: brightness(0) invert(1);
}

.native-speaker-badge {
  background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
  padding: 15px 25px;
  border-radius: 50px;
  position: relative;
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.3);
}

.native-speaker-badge::before {
  content: '★';
  position: absolute;
  top: -8px;
  right: -5px;
  color: #FFD700;
  font-size: 20px;
  animation: sparkle 2s infinite;
}

.badge-text {
  font-weight: 600;
  font-size: 16px;
  color: white;
}

.footer-columns {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 40px;
}

.footer-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.footer-column-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: #E5E7EB;
}

.contact-info {
  margin-bottom: 25px;
}

.contact-branch {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: white;
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 8px;
}

.contact-icon {
  font-size: 14px;
  margin-top: 2px;
  opacity: 0.8;
}

.contact-text {
  font-size: 14px;
  line-height: 1.4;
  opacity: 0.9;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 12px;
}

.footer-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s ease;
}

.footer-link:hover {
  color: white;
  text-decoration: underline;
}

.newsletter-column {
  max-width: 350px;
}

.newsletter-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  display: flex;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 25px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.email-input {
  flex: 1;
  padding: 12px 20px;
  border: none;
  background: transparent;
  color: white;
  font-size: 14px;
  outline: none;
}

.email-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.subscribe-btn {
  padding: 12px 20px;
  background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
  border: none;
  color: white;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
  min-width: 50px;
}

.subscribe-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #F7931E 0%, #FF6B35 100%);
  transform: translateX(2px);
}

.subscribe-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* .trust-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.trust-icon {
  width: 30px;
  height: 30px;
  background: #10B981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 16px;
}

.trust-text {
  font-size: 12px;
  line-height: 1.3;
  opacity: 0.9;
} */

.footer-social {
  text-align: center;
  padding-top: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.social-icons {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.social-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-decoration: none;
  font-size: 16px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.social-icon:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.social-icon.facebook:hover {
  background: #1877F2;
  border-color: #1877F2;
}

.social-icon.youtube:hover {
  background: #FF0000;
  border-color: #FF0000;
}

.social-icon.instagram:hover {
  background: linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D);
  border-color: transparent;
}

.social-icon.tiktok:hover {
  background: #000000;
  border-color: #000000;
}

/* Animations */
@keyframes sparkle {
  0%, 100% { 
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
  50% { 
    opacity: 0.7;
    transform: scale(1.2) rotate(180deg);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .footer {
    padding: 40px 0 30px;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 30px;
  }
  
  .footer-logo-section {
    flex: none;
    align-items: center;
    text-align: center;
  }
  
  .footer-columns {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  
  .newsletter-column {
    max-width: none;
  }
  
  .contact-item {
    flex-direction: column;
    gap: 5px;
  }
  
  .contact-icon {
    align-self: flex-start;
  }
}

@media (max-width: 480px) {
  .footer-container {
    padding: 0 15px;
  }
  
  .input-group {
    flex-direction: column;
  }
  
  .subscribe-btn {
    border-radius: 0 0 25px 25px;
  }
  
  .social-icons {
    gap: 10px;
  }
  
  .social-icon {
    width: 35px;
    height: 35px;
    font-size: 14px;
  }
}
</style>