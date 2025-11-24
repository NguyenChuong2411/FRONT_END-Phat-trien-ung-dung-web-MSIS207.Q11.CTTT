<template>
  <div class="test-history-page">
    <!-- Header Section -->
    <section class="page-header">
      <div class="header-container">
        <h1 class="page-title">LỊCH SỬ LÀM BÀI</h1>
        <p class="page-subtitle">Bạn đã thực hiện {{ historyList.length }} lần làm đề thi thử</p>
      </div>
    </section>

    <!-- Content Section -->
    <section class="content-section">
      <div class="content-container">
        
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner">
            <p>Đang tải dữ liệu...</p>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <div class="error-icon">⚠️</div>
          <h3 class="error-title">Có lỗi xảy ra</h3>
          <p class="error-message">{{ error }}</p>
          <button class="retry-btn" @click="loadHistory">Thử lại</button>
        </div>

        <!-- Empty State -->
        <div v-else-if="historyList.length === 0" class="empty-state">
          <i class="fa-solid fa-clipboard-list"></i>
          <h3>Bạn chưa làm bài thi nào</h3>
          <p>Hãy bắt đầu luyện tập ngay để nâng cao kỹ năng!</p>
          <button class="btn-primary" @click="goToPractice">Đến trang luyện thi</button>
        </div>

        <!-- History Table -->
        <div v-else class="history-card">
          <div class="table-responsive">
            <table class="history-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên đề thi</th>
                  <th>Loại đề</th>
                  <th>Ngày làm bài</th>
                  <th>Kết quả</th>
                  <th>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(attempt, index) in historyList" :key="attempt.id">
                  <td class="col-index">{{ index + 1 }}</td>
                  <td class="col-title">
                    <div class="test-info">
                      <span class="test-name">{{ attempt.testTitle }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="badge" :class="getBadgeClass(attempt.testType)">
                      {{ attempt.testType }}
                    </span>
                  </td>
                  <td class="col-date">
                    <div class="date-info">
                      {{ formatDate(attempt.submittedAt) }}
                    </div>
                    <div class="time-info">
                      {{ formatTime(attempt.submittedAt) }}
                    </div>
                  </td>
                  <td>
                    <div class="score-badge" :class="getScoreClass(attempt.score, attempt.totalQuestions)">
                      <span class="score-text">{{ attempt.score }}/{{ attempt.totalQuestions }}</span>
                      <span class="percentage">({{ getPercentage(attempt.score, attempt.totalQuestions) }}%)</span>
                    </div>
                  </td>
                  <td>
                    <button class="btn-view" @click="viewResult(attempt.id)" title="Xem lại kết quả">
                      <i class="fa-solid fa-eye"></i> 
                      <span>Xem lại</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchTestHistory } from '@/pages/online-test/OnlineTestPageAPI.js'

const router = useRouter()
const historyList = ref([])
const isLoading = ref(true)
const isRefreshing = ref(false)
const error = ref(null)

// Load Data
const loadHistory = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    const data = await fetchTestHistory()
    historyList.value = data || []
  } catch (err) {
    console.error('Failed to load history:', err)
    
    if (err.response?.status === 401) {
      error.value = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
      // Redirect to login after a delay
      setTimeout(() => {
        router.push('/login?redirect=/test-history')
      }, 2000)
    } else {
      error.value = err.response?.data?.message || 'Không thể tải lịch sử làm bài. Vui lòng thử lại sau.'
    }
  } finally {
    isLoading.value = false
  }
}

// Refresh data
const refreshHistory = async () => {
  isRefreshing.value = true
  try {
    const data = await fetchTestHistory()
    historyList.value = data || []
  } catch (err) {
    console.error('Failed to refresh history:', err)
    // Show a toast notification or handle error
  } finally {
    isRefreshing.value = false
  }
}

// Navigation
const goToPractice = () => {
  router.push('/online-test')
}

const viewResult = (attemptId) => {
  router.push(`/online-test/results/${attemptId}`)
}

// Helpers & Formatting
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const formatTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('vi-VN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const getBadgeClass = (type) => {
  const map = {
    'IELTS Academic': 'badge-blue',
    'IELTS General': 'badge-green', 
    'IELTS': 'badge-blue',
    'TOEIC': 'badge-orange',
    'TOEIC SW': 'badge-purple'
  }
  return map[type] || 'badge-gray'
}

const getScoreClass = (score, total) => {
  const percentage = total > 0 ? (score / total) * 100 : 0
  if (percentage >= 80) return 'score-high'
  if (percentage >= 50) return 'score-medium'
  return 'score-low'
}

const getPercentage = (score, total) => {
  if (total === 0) return 0
  return Math.round((score / total) * 100)
}

// Lifecycle
onMounted(() => {
  loadHistory()
})
</script>

<style scoped>
.test-history-page {
  min-height: 100vh;
  background: #f8fafc;
  font-family: var(--font-family-base, 'Segoe UI', sans-serif);
}

/* Header */
.page-header {
  color: rgb(0, 0, 0);
  padding: 3rem 0 2rem;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.05em;
}

.page-subtitle {
  opacity: 0.9;
  font-size: 1.1rem;
  margin: 0;
}

/* Content */
.content-section {
  padding-bottom: 3rem;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Loading & States */
.loading-state, .empty-state, .error-state {
  background: white;
  border-radius: 1rem;
  padding: 4rem 2rem;
  text-align: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  color: #F6871F;
  font-size: 2rem;
  margin-bottom: 1rem;
}

.loading-spinner p {
  color: #6b7280;
  margin: 0;
}

.empty-state i, .error-state .error-icon {
  font-size: 4rem;
  color: #cbd5e1;
  margin-bottom: 1rem;
  display: block;
}

.error-state .error-icon {
  font-size: 3rem;
}

.empty-state h3, .error-state .error-title {
  color: #334155;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.empty-state p, .error-state .error-message {
  color: #64748b;
  margin-bottom: 2rem;
}

.btn-primary, .retry-btn {
  background: #F6871F;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover, .retry-btn:hover {
  background: #e67e22;
  transform: translateY(-1px);
}

/* History Card */
.history-card {
  background: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #cbd5e1;
  background: white;
  color: #475569;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.refresh-btn:hover:not(:disabled) {
  border-color: #F6871F;
  color: #F6871F;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.table-responsive {
  overflow-x: auto;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
}

.history-table th {
  background: #f1f5f9;
  padding: 1rem 1.5rem;
  text-align: center;
  font-weight: 600;
  color: #475569;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
}

.history-table td {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  vertical-align: middle;
  text-align: center;
}

.history-table tr:hover {
  background-color: #f8fafc;
}

/* Columns Styling */
.col-index {
  font-weight: 600;
  color: #64748b;
  text-align: center;
  width: 60px;
}

.col-title {
  font-weight: 600;
  color: #1e293b;
  max-width: 300px;
}

.test-name {
  display: block;
  line-height: 1.4;
}

.col-date {
  font-size: 0.9rem;
  width: 140px;
}

.date-info {
  /* display: flex; */
  align-items: center;
  gap: 0.5rem;
  color: #475569;
  margin-bottom: 0.25rem;
}

.time-info {
  color: #94a3b8;
  font-size: 0.85rem;
  margin-left: 1.25rem;
}

/* Badges */
.badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
}

.badge-blue { background: #e0f2fe; color: #0369a1; }
.badge-green { background: #dcfce7; color: #15803d; }
.badge-orange { background: #ffedd5; color: #c2410c; }
.badge-purple { background: #f3e8ff; color: #7e22ce; }
.badge-gray { background: #f1f5f9; color: #475569; }

/* Score */
.score-badge {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-weight: 700;
  min-width: 80px;
  text-align: center;
}

.score-text {
  font-size: 1.1rem;
  line-height: 1.2;
}

.percentage {
  font-size: 0.75rem;
  opacity: 0.8;
  font-weight: 500;
}

.score-high { background: #dcfce7; color: #166534; }
.score-medium { background: #fef9c3; color: #854d0e; }
.score-low { background: #fee2e2; color: #991b1b; }

/* Action Button */
.btn-view {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #cbd5e1;
  background: white;
  color: #475569;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  white-space: nowrap;
}

.btn-view:hover {
  border-color: #667eea;
  color: #667eea;
  background: #f8fafc;
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .content-container {
    padding: 0 1rem;
  }
  
  .card-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .history-table th,
  .history-table td {
    padding: 0.75rem 0.5rem;
  }
  
  .btn-view span {
    display: none;
  }
  
  .score-badge {
    min-width: 60px;
    padding: 0.375rem 0.5rem;
  }
  
  .score-text {
    font-size: 0.9rem;
  }
  
  .percentage {
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 2rem 0 1.5rem;
  }
  
  .page-title {
    font-size: 1.75rem;
  }
  
  .history-table {
    min-width: 700px;
  }
}
</style>