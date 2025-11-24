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
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Đang tải danh sách bài thi...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-container">
          <p class="error-message">{{ error }}</p>
        </div>

        <!-- Main Content -->
        <div v-else class="box-list-container">
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
import { fetchAllTests, fetchReadingTestDetails, fetchListeningTestDetails } from './OnlineTestPageAPI.js'
import { useRouter } from 'vue-router'
import { authAPI } from '@/services/AuthAPI.js'
import { useNotification } from '@/composables/useNotification'

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

const allTests = ref([]) // <-- Khởi tạo mảng rỗng
const isLoading = ref(true) // <-- Thêm trạng thái loading
const error = ref(null) // <-- Thêm trạng thái lỗi

// User info
const router = useRouter()
const userInfo = ref(null)
const { error: showError } = useNotification()

// Computed properties
const filteredTests = computed(() => {
  let filtered = allTests.value

  // Filter by tab
  if (activeTab.value !== 'all') {
    // Sửa lại logic filter cho khớp với dữ liệu từ DTO
    const typeName = searchTabs.find(t => t.value === activeTab.value)?.label;
    if (typeName) {
        filtered = filtered.filter(test => test.type === typeName);
    }
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(test => 
      test.title.toLowerCase().includes(query) ||
      test.type.toLowerCase().includes(query) ||
      (test.description && test.description.toLowerCase().includes(query))
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
  currentPage.value = 1
}

const handleTabChange = (tab) => {
  activeTab.value = tab
  currentPage.value = 1
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
const openTestDetail = async (testItem) => {
  try {
    let fullDetails;
    try {
      fullDetails = await fetchListeningTestDetails(testItem.id);
    } catch (listeningError) {
      console.warn("Could not fetch as ListeningTest, trying ReadingTest:", listeningError);
      fullDetails = await fetchReadingTestDetails(testItem.id);
    }

    // Gộp thông tin từ list và thông tin chi tiết
    selectedTest.value = { ...testItem, ...fullDetails };
    showDetailModal.value = true;
    
  } catch (error) {
    // Nếu cả hai API đều lỗi, vẫn mở modal với thông tin cơ bản
    console.error("Could not fetch test details, showing basic info:", error);
    selectedTest.value = testItem;
    showDetailModal.value = true;
  }
}

const closeTestDetail = () => {
  showDetailModal.value = false
  selectedTest.value = null
}

// Hàm gọi API khi component được mounted
onMounted(async () => {
  try {
    // Kiểm tra xác thực trước khi gọi API
    if (!authAPI.isAuthenticated()) {
      router.push('/login?redirect=/online-test')
      return
    }

    // Lấy thông tin user từ localStorage trước
    userInfo.value = authAPI.getUserInfo()

    // Cố gắng lấy thông tin user mới nhất từ server
    try {
      const profileResult = await authAPI.getUserProfile()
      if (profileResult.success) {
        userInfo.value = profileResult.data
      }
    } catch (profileError) {
      console.error('Failed to fetch user profile:', profileError)
      // Không block flow chính nếu lỗi
    }

    // Gọi API để lấy dữ liệu
    const dataFromApi = await fetchAllTests();
    allTests.value = dataFromApi;
  } catch (err) {
    // Xử lý lỗi nếu API không thành công
    if (err.response?.status === 401) {
      // Token không hợp lệ, chuyển về login
      router.push('/login?redirect=/online-test')
      return
    }
    error.value = 'Không thể tải danh sách bài thi. Vui lòng thử lại sau.';
    console.error(err);
  } finally {
    // Dù thành công hay thất bại, cũng kết thúc trạng thái loading
    isLoading.value = false;
  }
})
</script>

<style src="./OnlineTestPage.css" scoped></style>