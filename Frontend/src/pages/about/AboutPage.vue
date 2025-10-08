<template>
  <div class="about-page">
    <!-- Header Section -->
    <section class="page-header">
      <div class="container">
        <h1 class="page-title">Về Enly</h1>
        <p class="page-subtitle">Trung tâm tiếng Anh hàng đầu Việt Nam</p>
      </div>
    </section>

    <!-- About Content -->
    <section class="about-content">
      <div class="container">
        <div class="content-grid">
          <div class="text-content">
            <h2>Câu chuyện của chúng tôi</h2>
            <p>
              Enly được thành lập với sứ mệnh mang đến trải nghiệm học tiếng Anh 
              độc đáo và hiệu quả nhất cho người Việt Nam.
            </p>
            <p>
              Với đội ngũ giáo viên native speakers giàu kinh nghiệm và phương pháp 
              giảng dạy hiện đại, chúng tôi cam kết giúp học viên đạt được mục tiêu 
              học tập của mình.
            </p>
          </div>
          <div class="image-content">
            <img src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=400&q=80" alt="About Enly" class="about-image" />
          </div>
        </div>
      </div>
    </section>

    <!-- Mission & Vision -->
    <section class="mission-vision">
      <div class="container">
        <div class="mv-grid">
          <div class="mv-card">
            <h3>Sứ mệnh</h3>
            <p>Tạo ra môi trường học tiếng Anh tự nhiên và hiệu quả nhất cho mọi học viên</p>
          </div>
          <div class="mv-card">
            <h3>Tầm nhìn</h3>
            <p>Trở thành trung tâm tiếng Anh số 1 Việt Nam với chất lượng giảng dạy quốc tế</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  console.log('About page loaded')
})
</script>

<style src="./AboutPage.css" scoped></style>