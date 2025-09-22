<template>
  <div class="online-test-page">
    <!-- Header Section -->
    <section class="page-header">
      <div class="container">
        <h1 class="page-title">Luyện thi Online</h1>
        <p class="page-subtitle">Hệ thống luyện thi tiếng Anh toàn diện</p>
      </div>
    </section>

    <!-- Test Categories -->
    <section class="test-categories">
      <div class="container">
        <h2 class="section-title">Các loại bài thi</h2>
        <div class="categories-grid">
          <div class="category-card">
            <div class="category-icon">📝</div>
            <h3>IELTS</h3>
            <p>Luyện thi IELTS với đề thi chuẩn quốc tế</p>
            <button class="btn btn-primary">Bắt đầu luyện thi</button>
          </div>
          <div class="category-card">
            <div class="category-icon">🎓</div>
            <h3>TOEIC</h3>
            <p>Chuẩn bị cho kỳ thi TOEIC hiệu quả</p>
            <button class="btn btn-primary">Bắt đầu luyện thi</button>
          </div>
          <div class="category-card">
            <div class="category-icon">🏫</div>
            <h3>TOEFL</h3>
            <p>Luyện thi TOEFL để du học</p>
            <button class="btn btn-primary">Bắt đầu luyện thi</button>
          </div>
          <div class="category-card">
            <div class="category-icon">🌟</div>
            <h3>Tiếng Anh Giao Tiếp</h3>
            <p>Rèn luyện kỹ năng giao tiếp hàng ngày</p>
            <button class="btn btn-primary">Bắt đầu luyện thi</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="container">
        <h2 class="section-title">Tính năng nổi bật</h2>
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon">⏱️</div>
            <h4>Thi thử trực tuyến</h4>
            <p>Mô phỏng chính xác kỳ thi thật</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📊</div>
            <h4>Báo cáo chi tiết</h4>
            <p>Phân tích kết quả và điểm yếu</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🎯</div>
            <h4>Luyện tập từng kỹ năng</h4>
            <p>Listening, Reading, Writing, Speaking</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📚</div>
            <h4>Ngân hàng đề thi</h4>
            <p>Hàng nghìn câu hỏi được cập nhật liên tục</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import './OnlineTestPage.css'
import { onMounted } from 'vue'

onMounted(() => {
  console.log('Online Test page loaded')
})
</script>