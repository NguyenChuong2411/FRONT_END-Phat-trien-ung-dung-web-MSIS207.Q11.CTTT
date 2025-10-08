<template>
  <div class="sharing-page">
    <!-- Header Section -->
    <section class="page-header">
      <div class="container">
        <h1 class="page-title">Góc chia sẻ</h1>
        <p class="page-subtitle">Chia sẻ kinh nghiệm và câu chuyện học tiếng Anh</p>
      </div>
    </section>

    <!-- Sharing Content -->
    <section class="sharing-content">
      <div class="container">
        <div class="content-layout">
          <!-- Main Content -->
          <div class="main-content">
            <!-- Categories Filter -->
            <div class="filter-section">
              <h3>Lọc theo chủ đề:</h3>
              <div class="filter-tags">
                <button 
                  v-for="category in categories" 
                  :key="category.id"
                  class="filter-tag"
                  :class="{ active: selectedCategory === category.id }"
                  @click="selectedCategory = category.id"
                >
                  {{ category.name }}
                </button>
              </div>
            </div>

            <!-- Stories Grid -->
            <div class="stories-grid">
              <div 
                v-for="story in filteredStories" 
                :key="story.id"
                class="story-card"
              >
                <div class="story-avatar">
                  <img :src="story.avatar" :alt="story.author" />
                </div>
                <div class="story-content">
                  <div class="story-header">
                    <h4>{{ story.title }}</h4>
                    <span class="story-category">{{ story.category }}</span>
                  </div>
                  <p class="story-excerpt">{{ story.excerpt }}</p>
                  <div class="story-meta">
                    <span class="story-author">{{ story.author }}</span>
                    <span class="story-date">{{ story.date }}</span>
                    <span class="story-score">{{ story.score }}</span>
                  </div>
                  <button class="read-more-btn">Đọc thêm</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <aside class="sidebar">
            <div class="widget">
              <h3>Chia sẻ câu chuyện của bạn</h3>
              <p>Bạn có câu chuyện học tiếng Anh thú vị? Hãy chia sẻ với cộng đồng!</p>
              <button class="btn btn-primary">Chia sẻ ngay</button>
            </div>

            <div class="widget">
              <h3>Câu chuyện nổi bật</h3>
              <ul class="featured-stories">
                <li v-for="featured in featuredStories" :key="featured.id">
                  <a href="#" class="featured-link">{{ featured.title }}</a>
                  <span class="featured-score">{{ featured.score }}</span>
                </li>
              </ul>
            </div>

            <div class="widget">
              <h3>Thống kê</h3>
              <div class="stats">
                <div class="stat-item">
                  <span class="stat-number">1,234</span>
                  <span class="stat-label">Câu chuyện</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">856</span>
                  <span class="stat-label">Thành viên</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Reactive data
const selectedCategory = ref('all')

const categories = ref([
  { id: 'all', name: 'Tất cả' },
  { id: 'ielts', name: 'IELTS' },
  { id: 'toeic', name: 'TOEIC' },
  { id: 'conversation', name: 'Giao tiếp' },
  { id: 'study-abroad', name: 'Du học' },
  { id: 'motivation', name: 'Động lực' }
])

const stories = ref([
  {
    id: 1,
    title: 'Từ 5.0 lên 7.5 IELTS trong 6 tháng',
    excerpt: 'Chia sẻ hành trình học IELTS đầy thử thách và những phương pháp hiệu quả...',
    author: 'Nguyễn Minh Anh',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60&q=80',
    category: 'IELTS',
    date: '15/09/2024',
    score: 'IELTS 7.5'
  },
  {
    id: 2,
    title: 'Kinh nghiệm phỏng vấn du học Mỹ',
    excerpt: 'Những điều cần biết khi phỏng vấn visa du học và cách chuẩn bị tiếng Anh...',
    author: 'Trần Đức Huy',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60&q=80',
    category: 'Du học',
    date: '12/09/2024',
    score: 'Du học thành công'
  },
  {
    id: 3,
    title: 'Cách học từ vựng hiệu quả nhất',
    excerpt: 'Phương pháp học từ vựng giúp tôi nhớ lâu và áp dụng được trong giao tiếp...',
    author: 'Phạm Thu Hà',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60&q=80',
    category: 'Giao tiếp',
    date: '10/09/2024',
    score: '2000+ từ vựng'
  }
])

const featuredStories = ref([
  { id: 1, title: 'Từ 0 lên band 8 IELTS', score: 'IELTS 8.0' },
  { id: 2, title: 'Học tiếng Anh qua phim', score: 'Fluent' },
  { id: 3, title: 'TOEIC 990 điểm', score: 'TOEIC 990' }
])

// Computed
const filteredStories = computed(() => {
  if (selectedCategory.value === 'all') {
    return stories.value
  }
  return stories.value.filter(story => 
    story.category.toLowerCase().includes(selectedCategory.value)
  )
})

onMounted(() => {
  console.log('Sharing page loaded')
})
</script>

<style src="./SharingPage.css" scoped></style>