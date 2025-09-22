<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            Native-like <br>
            <span class="highlight">speakers</span>
          </h1>
          <p class="hero-subtitle">
            Tiếng Anh trải nghiệm duy nhất tại Việt Nam
          </p>
          <div class="hero-buttons">
            <button class="btn btn-primary">Bắt đầu học ngay</button>
            <button class="btn btn-secondary">Tìm hiểu thêm</button>
          </div>
        </div>
        <div class="hero-image">
          <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80" alt="Enly Education" class="hero-img" />
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="container">
        <h2 class="section-title">Tại sao chọn Enly?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🎯</div>
            <h3>Luyện thi chuyên nghiệp</h3>
            <p>Hệ thống luyện thi online với đề thi chuẩn quốc tế</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">👨‍🏫</div>
            <h3>Giáo viên native</h3>
            <p>Đội ngũ giáo viên bản ngữ giàu kinh nghiệm</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3>Học mọi lúc mọi nơi</h3>
            <p>Nền tảng học trực tuyến hiện đại, dễ sử dụng</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container">
        <h2>Chào mừng bạn</h2>
        <p>Bắt đầu hành trình học tiếng Anh cùng Enly ngay hôm nay</p>
        <router-link to="/about" class="btn btn-primary">Tìm hiểu về Enly</router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import './HomePage.css'

// Component logic
onMounted(() => {
  console.log('Home page loaded')
})
</script>
.home-page {
  min-height: 100vh;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4rem 2rem;
  min-height: 80vh;
  display: flex;
  align-items: center;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.highlight {
  color: #fbbf24;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background-color: #fbbf24;
  color: #1f2937;
}

.btn-primary:hover {
  background-color: #f59e0b;
  transform: translateY(-2px);
}

.btn-secondary {
  background-color: transparent;
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background-color: white;
  color: #667eea;
}

.hero-img {
  width: 100%;
  height: auto;
  border-radius: 1rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

/* Features Section */
.features-section {
  padding: 4rem 2rem;
  background-color: #f9fafb;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: #1f2937;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #1f2937;
}

.feature-card p {
  color: #6b7280;
  line-height: 1.6;
}

/* CTA Section */
.cta-section {
  background-color: #1f2937;
  color: white;
  padding: 4rem 2rem;
  text-align: center;
}

.cta-section h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.cta-section p {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-buttons {
    justify-content: center;
    flex-direction: column;
