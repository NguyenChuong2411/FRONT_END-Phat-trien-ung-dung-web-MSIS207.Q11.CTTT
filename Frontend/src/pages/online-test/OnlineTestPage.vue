<template>
  <div class="online-test-page">
    <!-- Header Section -->
    <section class="page-header">
      <div class="header-container">
        <h1 class="page-title">THƯ VIỆN ĐỀ THI</h1>
      </div>
    </section>

    <!-- Search Bar -->
    <section class="search-section">
      <div class="content-container">
        <SearchBar 
          :tabs="searchTabs"
          placeholder="Nhập từ khóa tìm kiếm"
          @search="handleSearch"
          @tab-change="handleTabChange"
        />
      </div>
    </section>

    <!-- Test List -->
    <section class="test-list-section">
      <div class="content-container">
        <div class="box-list-container">
          <div class="box-list-grid" v-if="filteredTests.length > 0">
            <div 
              v-for="test in paginatedTests" 
              :key="test.id"
              class="box-list-item"
            >
              <!-- Test Header -->
              <div class="box-header">
                <h3 class="box-title">{{ test.title }}</h3>
                <span class="box-badge" :class="getBadgeClass(test.type)">
                  {{ test.type }}
                </span>
              </div>

              <!-- Test Metadata -->
              <div class="box-meta">
                <div class="box-meta-item">
                  <span class="box-meta-label">Thời gian</span>
                  <span class="box-meta-value">{{ test.duration }}</span>
                </div>
                <div class="box-meta-item">
                  <span class="box-meta-label">Câu hỏi</span>
                  <span class="box-meta-value">{{ test.questions }}</span>
                </div>
                <div class="box-meta-item">
                  <span class="box-meta-label">Lượt thi</span>
                  <span class="box-meta-value">{{ test.attempts }}</span>
                </div>
              </div>

              <!-- Test Description -->
              <div class="box-content">
                <p class="box-description">{{ test.description }}</p>
              </div>

              <!-- Test Stats -->
              <div class="box-stats">
                <div class="box-stat-item">
                  <span class="box-stat-icon">👥</span>
                  <span class="box-stat-value">{{ test.participants }}</span>
                  <span>người tham gia</span>
                </div>
                <div class="box-stat-item">
                  <span class="box-stat-icon">⭐</span>
                  <span class="box-stat-value">{{ test.rating }}</span>
                  <span>điểm đánh giá</span>
                </div>
              </div>

              <!-- Test Actions -->
              <div class="box-footer">
                <div class="box-actions">
                  <button class="box-btn box-btn-outline" @click="openTestDetail(test)">Chi tiết</button>
                  <!-- <button class="box-btn box-btn-primary" @click="startDirectTest(test)">Bắt đầu thi</button> -->
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="box-list-empty">
            <div class="box-list-empty-icon">�</div>
            <h3 class="box-list-empty-title">Không tìm thấy bài thi</h3>
            <p class="box-list-empty-description">
              Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
            </p>
          </div>

          <!-- Pagination -->
          <Pagination 
            :current-page="currentPage"
            :total-pages="totalPages"
            @page-change="handlePageChange"
          />
        </div>
      </div>
    </section>

    <!-- Test Detail Modal -->
    <TestDetailModal 
      :is-open="showDetailModal"
      :test-data="selectedTest || {}"
      @close="closeTestDetail"
      @start-practice="handleStartPractice"
      @start-fulltest="handleStartFullTest"
      @join-discussion="handleJoinDiscussion"
    />
  </div>
</template>

<script setup>
import '../../assets/box-list.css'
import SearchBar from '../../components/SearchBar.vue'
import Pagination from '../../components/Pagination.vue'
import TestDetailModal from './online-test_modal/TestDetailModal.vue'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// Search functionality
const searchTabs = [
  { label: 'Tất cả', value: 'all' },
  { label: 'IELTS Academic', value: 'ielts-academic' },
  { label: 'IELTS General', value: 'ielts-general' },
  { label: 'TOEIC', value: 'toeic' },
  { label: 'TOEIC SW', value: 'toeic-sw' }
]

const activeTab = ref('all')
const searchQuery = ref('')

// Pagination
const currentPage = ref(1)
const itemsPerPage = 6

// Modal state
const showDetailModal = ref(false)
const selectedTest = ref(null)

// Sample test data (replace with API call)
const allTests = ref([
  {
    id: 1,
    title: 'IELTS Simulation Listening test 1',
    type: 'IELTS Academic',
    duration: '30 phút',
    questions: '40 câu hỏi',
    attempts: '2288',
    participants: '1200+',
    rating: '4.5',
    description: '4 phần thi | 40 câu hỏi | 40 phút (30 phút nghe + 10 phút chép bài)',
    category: 'ielts-academic'
  },
  {
    id: 2,
    title: 'IELTS Simulation Listening test 2',
    type: 'IELTS Academic',
    duration: '30 phút',
    questions: '40 câu hỏi',
    attempts: '2140',
    participants: '980+',
    rating: '4.3',
    description: '4 phần thi | 40 câu hỏi | 40 phút (30 phút nghe + 10 phút chép bài)',
    category: 'ielts-academic'
  },
  {
    id: 3,
    title: 'TOEIC Listening Practice Test',
    type: 'TOEIC',
    duration: '45 phút',
    questions: '100 câu hỏi',
    attempts: '1850',
    participants: '750+',
    rating: '4.2',
    description: 'Bài thi thực hành TOEIC Listening với 100 câu hỏi',
    category: 'toeic'
  },
  {
    id: 4,
    title: 'IELTS General Training Reading',
    type: 'IELTS General',
    duration: '60 phút',
    questions: '40 câu hỏi',
    attempts: '1420',
    participants: '600+',
    rating: '4.4',
    description: '3 phần thi | 40 câu hỏi | 60 phút đọc hiểu',
    category: 'ielts-general'
  },
  {
    id: 5,
    title: 'TOEIC Speaking & Writing',
    type: 'TOEIC SW',
    duration: '90 phút',
    questions: '19 câu hỏi',
    attempts: '980',
    participants: '450+',
    rating: '4.1',
    description: 'Bài thi TOEIC Speaking & Writing đầy đủ',
    category: 'toeic-sw'
  },
  // Add more sample data to demonstrate pagination
  {
    id: 6,
    title: 'IELTS Academic Writing Task 1',
    type: 'IELTS Academic',
    duration: '20 phút',
    questions: '1 bài viết',
    attempts: '1650',
    participants: '820+',
    rating: '4.3',
    description: 'Luyện tập viết biểu đồ và báo cáo',
    category: 'ielts-academic'
  },
  {
    id: 7,
    title: 'IELTS Academic Writing Task 1',
    type: 'IELTS Academic',
    duration: '20 phút',
    questions: '1 bài viết',
    attempts: '1650',
    participants: '820+',
    rating: '4.3',
    description: 'Luyện tập viết biểu đồ và báo cáo',
    category: 'ielts-academic'
  },
  {
    id: 8,
    title: 'IELTS Academic Writing Task 1',
    type: 'IELTS Academic',
    duration: '20 phút',
    questions: '1 bài viết',
    attempts: '1650',
    participants: '820+',
    rating: '4.3',
    description: 'Luyện tập viết biểu đồ và báo cáo',
    category: 'ielts-academic'
  },
  {
    id: 9,
    title: 'IELTS Academic Writing Task 1',
    type: 'IELTS Academic',
    duration: '20 phút',
    questions: '1 bài viết',
    attempts: '1650',
    participants: '820+',
    rating: '4.3',
    description: 'Luyện tập viết biểu đồ và báo cáo',
    category: 'ielts-academic'
  },
  {
    id: 10,
    title: 'IELTS Academic Writing Task 1',
    type: 'IELTS Academic',
    duration: '20 phút',
    questions: '1 bài viết',
    attempts: '1650',
    participants: '820+',
    rating: '4.3',
    description: 'Luyện tập viết biểu đồ và báo cáo',
    category: 'ielts-academic'
  },
  {
    id: 11,
    title: 'IELTS Academic Writing Task 1',
    type: 'IELTS Academic',
    duration: '20 phút',
    questions: '1 bài viết',
    attempts: '1650',
    participants: '820+',
    rating: '4.3',
    description: 'Luyện tập viết biểu đồ và báo cáo',
    category: 'ielts-academic'
  },
  {
    id: 12,
    title: 'IELTS Academic Writing Task 1',
    type: 'IELTS Academic',
    duration: '20 phút',
    questions: '1 bài viết',
    attempts: '1650',
    participants: '820+',
    rating: '4.3',
    description: 'Luyện tập viết biểu đồ và báo cáo',
    category: 'ielts-academic'
  }
])

// Computed properties
const filteredTests = computed(() => {
  let filtered = allTests.value

  // Filter by tab
  if (activeTab.value !== 'all') {
    filtered = filtered.filter(test => test.category === activeTab.value)
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(test => 
      test.title.toLowerCase().includes(query) ||
      test.type.toLowerCase().includes(query) ||
      test.description.toLowerCase().includes(query)
    )
  }

  return filtered
})

const totalPages = computed(() => {
  return Math.ceil(filteredTests.value.length / itemsPerPage)
})

const paginatedTests = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredTests.value.slice(start, end)
})

// Methods
const handleSearch = ({ query, tab }) => {
  searchQuery.value = query
  activeTab.value = tab
  currentPage.value = 1 // Reset to first page when searching
}

const handleTabChange = (tab) => {
  activeTab.value = tab
  currentPage.value = 1 // Reset to first page when changing tab
}

const handlePageChange = (page) => {
  currentPage.value = page
  // Scroll to top of results
  document.querySelector('.test-list-section')?.scrollIntoView({ 
    behavior: 'smooth' 
  })
}

const getBadgeClass = (type) => {
  const typeMap = {
    'IELTS Academic': 'success',
    'IELTS General': 'success',
    'TOEIC': 'warning',
    'TOEIC SW': 'danger'
  }
  return typeMap[type] || ''
}

// Modal methods
const openTestDetail = (test) => {
  selectedTest.value = test
  showDetailModal.value = true
}

const closeTestDetail = () => {
  showDetailModal.value = false
  selectedTest.value = null
}

const handleStartPractice = (data) => {
  console.log('Starting practice:', data)
  // Implement practice mode navigation
  closeTestDetail()
}

const handleStartFullTest = (data) => {
  // This is now handled directly in TestDetailModal
  // Modal will close itself and navigate to FullTestPage
  console.log('Full test started:', data)
}

const handleJoinDiscussion = (data) => {
  console.log('Joining discussion:', data)
  // Implement discussion navigation
  closeTestDetail()
}

// // Direct test start method
// const startDirectTest = (test) => {
//   console.log('Starting direct test:', test)
//   router.push({
//     name: 'full-test',
//     params: { testId: test.id },
//     query: { 
//       title: test.title,
//       type: test.type,
//       duration: test.duration
//     }
//   })
// }

onMounted(() => {
  console.log('Online Test page loaded')
})
</script>

<style src="./OnlineTestPage.css" scoped></style>