<template>
  <div class="test-result-page">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Đang tải kết quả...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <h2 class="error-title">Có lỗi xảy ra</h2>
      <p class="error-message">{{ error }}</p>
      <button class="back-btn" @click="goBack">Quay lại</button>
    </div>

    <!-- Result Content -->
    <div v-else-if="resultData" class="result-container">
      <!-- Header -->
      <div class="result-header">
        <div class="score-section">
          <h1 class="test-title">{{ resultData.testTitle }}</h1>
          <div class="score-display">
            <div class="score-number">
              <span class="score">{{ resultData.score }}</span>
              <span class="total">/ {{ resultData.totalQuestions }}</span>
            </div>
            <div class="score-percentage">
              {{ Math.round((resultData.score / resultData.totalQuestions) * 100) }}%
            </div>
          </div>
          <div class="score-status" :class="getScoreClass()">
            {{ getScoreStatus() }}
          </div>
        </div>

        <div class="actions">
          <button class="action-btn primary" @click="reviewAnswers">
            Xem lại đáp án
          </button>
          <button class="action-btn secondary" @click="goBack">
            Về trang chủ
          </button>
        </div>
      </div>

      <!-- Statistics -->
      <div class="statistics">
        <div class="stat-item">
          <div class="stat-number correct">{{ correctCount }}</div>
          <div class="stat-label">Câu đúng</div>
        </div>
        <div class="stat-item">
          <div class="stat-number incorrect">{{ incorrectCount }}</div>
          <div class="stat-label">Câu sai</div>
        </div>
        <div class="stat-item">
          <div class="stat-number total">{{ resultData.totalQuestions }}</div>
          <div class="stat-label">Tổng câu</div>
        </div>
      </div>

      <!-- Questions Review -->
      <div v-if="showReview" class="questions-review">
        <h2 class="review-title">Chi tiết đáp án</h2>
        
        <div class="filter-options">
          <button 
            class="filter-btn"
            :class="{ active: activeFilter === 'all' }"
            @click="activeFilter = 'all'"
          >
            Tất cả ({{ resultData.questions.length }})
          </button>
          <button 
            class="filter-btn"
            :class="{ active: activeFilter === 'correct' }"
            @click="activeFilter = 'correct'"
          >
            Đúng ({{ correctCount }})
          </button>
          <button 
            class="filter-btn"
            :class="{ active: activeFilter === 'incorrect' }"
            @click="activeFilter = 'incorrect'"
          >
            Sai ({{ incorrectCount }})
          </button>
        </div>

        <div class="questions-list">
          <div 
            v-for="question in filteredQuestions" 
            :key="question.questionNumber"
            class="question-card"
            :class="{ correct: question.isCorrect, incorrect: !question.isCorrect }"
          >
            <div class="question-header">
              <div class="question-number">Câu {{ question.questionNumber }}</div>
              <div class="question-status">
                <span v-if="question.isCorrect" class="status correct">✓ Đúng</span>
                <span v-else class="status incorrect">✗ Sai</span>
              </div>
            </div>

            <div class="question-content">
              <div class="question-prompt" v-html="question.prompt"></div>
              
              <!-- User Answer -->
              <div class="answer-section">
                <h4 class="answer-title">Câu trả lời của bạn:</h4>
                <div class="user-answer">
                  {{ formatUserAnswer(question) }}
                </div>
              </div>

              <!-- Correct Answer (if wrong) -->
              <div v-if="!question.isCorrect" class="answer-section">
                <h4 class="answer-title">Đáp án đúng:</h4>
                <div class="correct-answer">
                  {{ formatCorrectAnswer(question) }}
                </div>
              </div>

              <!-- Multiple Choice Options -->
              <div v-if="question.questionType === 'multiple-choice' && question.options" class="options-section">
                <h4 class="answer-title">Các lựa chọn:</h4>
                <div class="options-list">
                  <div 
                    v-for="option in question.options" 
                    :key="option.id"
                    class="option-item"
                    :class="getOptionClass(option, question)"
                  >
                    <span class="option-label">{{ option.optionLabel }}.</span>
                    <span class="option-text">{{ option.optionText }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchTestResult } from './OnlineTestPageAPI.js'

const route = useRoute()
const router = useRouter()

// State
const resultData = ref(null)
const isLoading = ref(true)
const error = ref(null)
const showReview = ref(false)
const activeFilter = ref('all')

const attemptId = route.params.attemptId;

// Computed Properties
const correctCount = computed(() => resultData.value?.questions.filter(q => q.isCorrect).length ?? 0);
const incorrectCount = computed(() => resultData.value?.questions.filter(q => !q.isCorrect).length ?? 0);

const filteredQuestions = computed(() => {
  if (!resultData.value) return [];
  switch (activeFilter.value) {
    case 'correct': return resultData.value.questions.filter(q => q.isCorrect);
    case 'incorrect': return resultData.value.questions.filter(q => !q.isCorrect);
    default: return resultData.value.questions;
  }
});

// --- METHODS ---
const formatDisplayAnswer = (answerData) => {
  // Trả về 'N/A' nếu không có dữ liệu
  if (answerData === null || answerData === undefined) return 'N/A';
  
  // Nếu là chuỗi đơn giản (đã được backend xử lý)
  if (typeof answerData === 'string') return answerData;

  // Nếu là object (dữ liệu JSON từ backend)
  if (typeof answerData === 'object') {
    // Ưu tiên 1: Xử lý { "answer": "A" } hoặc { "answer": "text" }
    if (answerData.hasOwnProperty('answer')) {
      return answerData.answer;
    }
    
    // Ưu tiên 2: Xử lý { "answers": ["A", "C"] } cho câu hỏi nhiều đáp án
    if (answerData.hasOwnProperty('answers') && Array.isArray(answerData.answers)) {
        return answerData.answers.join(', ');
    }

    // Ưu tiên 3: Xử lý câu hỏi dạng bảng { "1": "value", "2": "value" }
    const keys = Object.keys(answerData);
    if (keys.length > 0) {
      // Định dạng lại để dễ đọc hơn: (1): value; (2): value
      return keys.map(key => `(${key}): ${answerData[key]}`).join('; ');
    }
    
    // Nếu là object rỗng {}
    return 'Chưa trả lời';
  }

  // Trường hợp dự phòng, chuyển thành chuỗi
  return String(answerData);
};


const formatUserAnswer = (question) => {
  return question.userAnswer ? formatDisplayAnswer(question.userAnswer) : 'Chưa trả lời';
};
const formatCorrectAnswer = (question) => {
  return question.correctAnswer ? formatDisplayAnswer(question.correctAnswer) : 'Không có đáp án';
};

const getScoreClass = () => {
  if (!resultData.value) return '';
  const percentage = (resultData.value.score / resultData.value.totalQuestions) * 100;
  if (percentage >= 80) return 'excellent';
  if (percentage >= 60) return 'good';
  if (percentage >= 40) return 'average';
  return 'poor';
};

const getScoreStatus = () => {
  if (!resultData.value) return '';
  const percentage = (resultData.value.score / resultData.value.totalQuestions) * 100;
  if (percentage >= 80) return 'Xuất sắc!';
  if (percentage >= 60) return 'Tốt';
  if (percentage >= 40) return 'Trung bình';
  return 'Cần cải thiện';
};

const getOptionClass = (option, question) => {
  const userAnswer = formatDisplayAnswer(question.userAnswer);
  const correctAnswer = formatDisplayAnswer(question.correctAnswer);
  
  const classes = [];
  
  if (userAnswer === option.optionLabel) {
    classes.push('selected', question.isCorrect ? 'user-correct' : 'user-incorrect');
  }
  
  if (correctAnswer === option.optionLabel) {
    classes.push('correct-option');
  }
  
  return classes;
};

const reviewAnswers = () => { showReview.value = !showReview.value; };
const goBack = () => { router.push('/online-test'); };

// Lifecycle Hook
onMounted(async () => {
  try {
    resultData.value = await fetchTestResult(attemptId);
  } catch (err) {
    error.value = 'Không thể tải kết quả bài thi. Vui lòng thử lại sau.';
    console.error('Error fetching test result:', err);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.test-result-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 0;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  color: white;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-left: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 1.2rem;
  font-weight: 500;
}

/* Error State */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  color: white;
  text-align: center;
  padding: 2rem;
}

.error-title {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.error-message {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

/* Result Container */
.result-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Result Header */
.result-header {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 2rem;
}

.score-section {
  flex: 1;
}

.test-title {
  font-size: 1.8rem;
  color: #1f2937;
  margin: 0 0 1rem 0;
  font-weight: 700;
}

.score-display {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: 1rem;
}

.score-number {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.score {
  font-size: 3rem;
  font-weight: 800;
  color: #3b82f6;
}

.total {
  font-size: 1.5rem;
  color: #6b7280;
  font-weight: 600;
}

.score-percentage {
  font-size: 1.2rem;
  color: #6b7280;
  font-weight: 600;
}

.score-status {
  font-size: 1.1rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  display: inline-block;
}

.score-status.excellent {
  background: #dcfce7;
  color: #166534;
}

.score-status.good {
  background: #dbeafe;
  color: #1e40af;
}

.score-status.average {
  background: #fef3c7;
  color: #92400e;
}

.score-status.poor {
  background: #fee2e2;
  color: #991b1b;
}

.actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.action-btn.primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.action-btn.secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.action-btn.secondary:hover {
  background: #e5e7eb;
}

.back-btn {
  padding: 0.75rem 1.5rem;
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #f9fafb;
}

/* Statistics */
.statistics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-item {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.stat-number.correct {
  color: #10b981;
}

.stat-number.incorrect {
  color: #ef4444;
}

.stat-number.total {
  color: #6b7280;
}

.stat-label {
  color: #6b7280;
  font-weight: 500;
}

/* Questions Review */
.questions-review {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.review-title {
  font-size: 1.5rem;
  color: #1f2937;
  margin: 0 0 1.5rem 0;
  font-weight: 700;
}

.filter-options {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  background: #f9fafb;
  color: #374151;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background: #f3f4f6;
}

.filter-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

/* Question Cards */
.questions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.question-card {
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  background: #fafafa;
}

.question-card.correct {
  border-left: 4px solid #10b981;
  background: #f0fdf4;
}

.question-card.incorrect {
  border-left: 4px solid #ef4444;
  background: #fef2f2;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.question-number {
  font-weight: 700;
  color: #1f2937;
  font-size: 1.1rem;
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
}

.status.correct {
  background: #dcfce7;
  color: #166534;
}

.status.incorrect {
  background: #fee2e2;
  color: #991b1b;
}

.question-content {
  color: #374151;
}

.question-prompt {
  margin-bottom: 1rem;
  font-weight: 500;
}

.answer-section {
  margin-bottom: 1rem;
}

.answer-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
}

.user-answer,
.correct-answer {
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-weight: 500;
}

.user-answer {
  background: #f3f4f6;
  color: #374151;
}

.correct-answer {
  background: #dcfce7;
  color: #166534;
}

/* Options */
.options-section {
  margin-top: 1rem;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.option-item {
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  display: flex;
  gap: 0.5rem;
}

.option-item.selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.option-item.user-incorrect {
  border-color: #ef4444;
  background: #fef2f2;
}

.option-item.correct-option {
  border-color: #10b981;
  background: #f0fdf4;
  font-weight: 600;
}

.option-label {
  font-weight: 600;
  min-width: 1.5rem;
}

.option-text {
  flex: 1;
}

/* Responsive Design */
@media (max-width: 768px) {
  .test-result-page {
    padding: 1rem 0;
  }

  .result-container {
    padding: 0 1rem;
  }

  .result-header {
    flex-direction: column;
    text-align: center;
  }

  .score-display {
    justify-content: center;
  }

  .actions {
    justify-content: center;
    width: 100%;
  }

  .action-btn {
    flex: 1;
    min-width: 120px;
  }

  .statistics {
    grid-template-columns: 1fr;
  }

  .filter-options {
    flex-direction: column;
  }

  .filter-btn {
    text-align: center;
  }

  .question-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
}
</style>