<template>
  <div class="news-page">
    <!-- Header Section -->
    <section class="page-header">
      <div class="container">
        <h1 class="page-title">Tin tức</h1>
        <p class="page-subtitle">Cập nhật tin tức mới nhất về giáo dục tiếng Anh</p>
      </div>
    </section>

    <!-- News Content -->
    <section class="news-content">
      <div class="container">
        <div class="news-grid">
          <!-- Featured Article -->
          <article class="featured-article">
            <img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80" alt="Featured News" class="article-image" />
            <div class="article-content">
              <span class="article-category">Tin nổi bật</span>
              <h2>Phương pháp học tiếng Anh hiệu quả nhất 2024</h2>
              <p class="article-excerpt">
                Khám phá những phương pháp học tiếng Anh được chứng minh là hiệu quả nhất 
                trong năm 2024, giúp bạn nâng cao trình độ nhanh chóng.
              </p>
              <div class="article-meta">
                <span class="article-date">15/09/2024</span>
                <span class="article-author">By Enly Team</span>
              </div>
            </div>
          </article>

          <!-- Regular Articles -->
          <div class="articles-list">
            <article class="article-card" v-for="article in articles" :key="article.id">
              <img :src="article.image" :alt="article.title" class="card-image" />
              <div class="card-content">
                <span class="card-category">{{ article.category }}</span>
                <h3>{{ article.title }}</h3>
                <p>{{ article.excerpt }}</p>
                <div class="card-meta">
                  <span>{{ article.date }}</span>
                </div>
              </div>
            </article>
          </div>
        </div>

        <!-- Sidebar -->
        <aside class="sidebar">
          <div class="widget">
            <h3>Tin mới nhất</h3>
            <ul class="latest-news">
              <li v-for="item in latestNews" :key="item.id">
                <a href="#" class="news-link">{{ item.title }}</a>
                <span class="news-date">{{ item.date }}</span>
              </li>
            </ul>
          </div>

          <div class="widget">
            <h3>Danh mục</h3>
            <ul class="categories">
              <li><a href="#">Phương pháp học</a></li>
              <li><a href="#">Luyện thi</a></li>
              <li><a href="#">Kinh nghiệm</a></li>
              <li><a href="#">Tin tức chung</a></li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Sample data
const articles = ref([
  {
    id: 1,
    title: 'Cách chuẩn bị thi IELTS hiệu quả',
    excerpt: 'Hướng dẫn chi tiết cách chuẩn bị thi IELTS từ cơ bản đến nâng cao.',
    category: 'Luyện thi',
    date: '12/09/2024',
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80'
  },
  {
    id: 2,
    title: 'Lỗi phát âm thường gặp của người Việt',
    excerpt: 'Những lỗi phát âm phổ biến và cách khắc phục hiệu quả.',
    category: 'Phương pháp học',
    date: '10/09/2024',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80'
  },
  {
    id: 3,
    title: 'Kinh nghiệm học tiếng Anh online',
    excerpt: 'Chia sẻ kinh nghiệm học tiếng Anh online từ học viên thành công.',
    category: 'Kinh nghiệm',
    date: '08/09/2024',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80'
  }
])

const latestNews = ref([
  { id: 1, title: 'Khai giảng khóa IELTS mới', date: '20/09/2024' },
  { id: 2, title: 'Workshop phát âm miễn phí', date: '18/09/2024' },
  { id: 3, title: 'Thi thử TOEIC online', date: '16/09/2024' }
])

onMounted(() => {
  console.log('News page loaded')
})
</script>

<style src="./NewsPage.css" scoped></style>