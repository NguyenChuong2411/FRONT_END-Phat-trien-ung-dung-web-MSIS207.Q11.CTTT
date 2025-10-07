<template>
  <div class="flashcard-page">
    <!-- Header Section -->
    <section class="page-header">
      <div class="header-container">
        <h1 class="page-title">HỌC FLASHCARD</h1>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats-section">
      <div class="content-container">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">{{ userStats.totalCards }}</div>
            <div class="stat-label">Tổng thẻ</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ userStats.masteredCards }}</div>
            <div class="stat-label">Đã thuộc</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ userStats.reviewCards }}</div>
            <div class="stat-label">Cần ôn</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ userStats.streak }}</div>
            <div class="stat-label">Chuỗi ngày</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Flashcard Categories -->
    <section class="categories-section">
      <div class="content-container">
        <h2 class="section-title">Danh mục học tập</h2>
        
        <div class="categories-grid">
          <div 
            v-for="category in categories" 
            :key="category.id"
            class="category-card"
            @click="openCategory(category)"
          >
            <div class="category-header">
              <div class="category-level" :class="category.level.toLowerCase()">
                {{ category.level }}
              </div>
            </div>
            
            <h3 class="category-title">{{ category.title }}</h3>
            <p class="category-description">{{ category.description }}</p>
            
            <div class="category-stats">
              <div class="category-stat">
                <span class="stat-value">{{ category.totalWords }}</span>
                <span class="stat-text">từ vựng</span>
              </div>
              <div class="category-stat">
                <span class="stat-value">{{ category.completedWords }}</span>
                <span class="stat-text">đã học</span>
              </div>
            </div>
            
            <div class="category-progress">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: `${category.progress}%` }"
                ></div>
              </div>
              <span class="progress-text">{{ category.progress }}%</span>
            </div>
            
            <button class="category-btn">
              {{ category.completedWords === 0 ? 'Bắt đầu học' : 'Tiếp tục học' }}
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// User statistics
const userStats = ref({
  totalCards: 1250,
  masteredCards: 320,
  reviewCards: 45,
  streak: 7
})

// Categories data
const categories = ref([
  {
    id: 1,
    title: 'IELTS Vocabulary',
    description: 'Từ vựng cần thiết cho kỳ thi IELTS',
    level: 'Advanced',
    totalWords: 500,
    completedWords: 120,
    progress: 24
  },
  {
    id: 2,
    title: 'TOEIC Business',
    description: 'Từ vựng kinh doanh cho TOEIC',
    level: 'Intermediate',
    totalWords: 400,
    completedWords: 200,
    progress: 50
  },
  {
    id: 3,
    title: 'Daily Conversation',
    description: 'Từ vựng giao tiếp hàng ngày',
    level: 'Beginner',
    totalWords: 300,
    completedWords: 280,
    progress: 93
  },
  {
    id: 4,
    title: 'Academic English',
    description: 'Từ vựng học thuật cho môi trường đại học',
    level: 'Advanced',
    totalWords: 600,
    completedWords: 50,
    progress: 8
  },
  {
    id: 5,
    title: 'Travel English',
    description: 'Từ vựng du lịch và khám phá',
    level: 'Intermediate',
    totalWords: 250,
    completedWords: 180,
    progress: 72
  },
  {
    id: 6,
    title: 'Medical Terms',
    description: 'Thuật ngữ y tế cơ bản',
    level: 'Advanced',
    totalWords: 350,
    completedWords: 0,
    progress: 0
  }
])

// Methods
const openCategory = (category) => {
  console.log('Opening category:', category.title)
  // Navigate to category detail page
}

onMounted(() => {
  console.log('Flashcard page loaded')
})
</script>

<style src="./FlashcardPage.css" scoped></style>