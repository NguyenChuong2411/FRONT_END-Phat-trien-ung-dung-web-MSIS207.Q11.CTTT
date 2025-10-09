<template>
  <div class="full-test-page">
    <!-- Test Header -->
    <div class="test-header">
      <div class="test-info">
        <h1 class="test-title">
          {{ testTitle }}
          <span v-if="testMode === 'practice'" class="practice-mode-badge">- Chế độ luyện tập</span>
        </h1>
        <button class="exit-btn" @click="showExitConfirm = true">
          Thoát
        </button>
      </div>
    </div>

    <!-- Test Content -->
    <div class="test-content">
      <!-- Left Panel - Passages -->
      <div class="passages-panel">
        <div class="passage-tabs" v-if="!isLoading && passages.length > 0">
          <button 
            v-for="passage in passages" 
            :key="passage.id"
            class="passage-tab"
            :class="{ active: activePassageId === passage.id }"
            @click="selectPassage(passage.id)"
          >
            {{ passage.title }}
          </button>
        </div>
        
        <div class="passage-content">
          <div v-if="isLoading" class="loading-state">
            <p>Đang tải nội dung...</p>
          </div>
          <div v-else-if="error" class="error-state">
            <p>{{ error }}</p>
          </div>
          <div v-else-if="activePassage" class="passage-text" v-html="activePassage.content"></div>
        </div>
      </div>

      <!-- Middle Panel - Questions Sheet -->
      <div class="questions-sheet-panel">
        <div class="questions-header">
          <div class="questions-range" v-if="currentPassageQuestionRange.start > 0">
            Questions {{ currentPassageQuestionRange.start }} - {{ currentPassageQuestionRange.end }}
          </div>
        </div>
        
        <div class="questions-sheet">
          <div class="question-instruction" v-if="currentPassageQuestions.length > 0">
            <p><strong>Complete the table below.</strong></p>
            <p><strong>Choose NO MORE THAN TWO WORDS from the text for each answer.</strong></p>
            <p><strong>Write your answers in boxes {{ currentPassageQuestionRange.start }}-{{ currentPassageQuestionRange.end }} on your answer sheet.</strong></p>
          </div>

          <div class="questions-list">
            <template v-for="question in currentPassageQuestions" :key="question.id">
              <!-- Question Display -->
              <div 
                :data-question-id="question.id"
                class="question-item"
                :class="{ answered: isQuestionAnswered(question) }"
              >
                <div class="question-number-badge">{{ getQuestionDisplayRange(question) }}</div>
                
                <div class="question-content">
                  <div class="question-text" v-html="question.prompt"></div>
                  
                  <!-- Multiple Choice -->
                  <div class="answer-options" v-if="question.questionType === 'multiple-choice'">
                    <label 
                      v-for="option in question.options" 
                      :key="option.id"
                      class="answer-option"
                      :class="{ selected: selectedAnswers[question.id] === option.id }"
                    >
                      <input 
                        type="radio" 
                        :name="`question-${question.id}`"
                        :value="option.id"
                        v-model="selectedAnswers[question.id]"
                        @change="saveAnswer(question.id, option.id)"
                      />
                      <span class="option-label">{{ option.optionLabel }}</span>
                      <span class="option-text">{{ option.optionText }}</span>
                    </label>
                  </div>

                  <!-- Fill in Blank -->
                  <div class="answer-input" v-else-if="question.questionType === 'fill-blank'">
                    <input 
                      type="text" 
                      class="text-answer"
                      v-model="selectedAnswers[question.id]"
                      @input="saveAnswer(question.id, $event.target.value)"
                    />
                  </div>

                  <!-- Table Display Only -->
                  <div class="table-question" v-else-if="question.questionType === 'table' && question.tableData">
                    <table class="answer-table">
                      <tr v-for="(row, rowIndex) in question.tableData.tableData" :key="rowIndex">
                        <td v-for="(cell, colIndex) in row" :key="colIndex" class="table-cell">
                          <span v-if="!cell.isAnswer">{{ cell.text }}</span>
                          <strong v-else class="answer-placeholder">
                            {{ cell.answerId }} ________
                          </strong>
                        </td>
                      </tr>
                    </table>
                  </div>
                </div>
              </div>

              <!-- Table Answer Inputs - Outside question-item -->
              <div v-if="question.questionType === 'table' && question.tableData" class="table-answers-section">
                <div 
                  v-for="answerField in getAnswerFields(question)" 
                  :key="answerField.answerId"
                  class="answer-input"
                >
                  <label class="answer-label">{{ answerField.answerId }}</label>
                  <input 
                    type="text" 
                    class="text-answer"
                    v-model="selectedAnswers[`q${question.id}_${answerField.answerId}`]"
                    @input="saveAnswer(`q${question.id}_${answerField.answerId}`, $event.target.value)"
                  />
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Right Panel - Timer & Navigation -->
      <div class="timer-nav-panel">
        <!-- Timer -->
        <div class="timer-section" v-if="timeRemaining > 0 || testMode === 'fulltest'">
          <div class="timer-label">{{ testMode === 'practice' && timeRemaining === 0 ? 'Không giới hạn thời gian' : 'Thời gian còn lại' }}</div>
          <div class="timer-display" v-if="timeRemaining > 0">{{ formatTime(timeRemaining) }}</div>
          <div class="timer-display" v-else>∞</div>
          <button class="hide-timer-btn" @click="toggleTimer" v-if="timeRemaining > 0">
            {{ showTimer ? 'Ẩn bài' : 'Hiện bài' }}
          </button>
        </div>

        <!-- Question Navigation Grid -->
        <div class="question-nav" v-if="!isLoading && passages.length > 0">
          <div class="passage-questions" v-for="passage in passages" :key="passage.id">
            <h4>{{ passage.title }}</h4>
            <div class="question-grid">
              <button 
                v-for="flatQuestion in flattenedQuestions.filter(fq => fq.passageId === passage.id)"
                :key="flatQuestion.id"
                class="question-btn"
                :class="{ 
                  answered: isFlatQuestionAnswered(flatQuestion),
                  current: activePassageId === passage.id
                }"
                @click="scrollToQuestion(flatQuestion.passageId, flatQuestion.originalQuestionId)"
              >
                {{ flatQuestion.displayNumber }}
              </button>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="submit-section">
          <button class="submit-btn" @click="showSubmitConfirm = true">
            Nộp bài
          </button>
        </div>
      </div>
    </div>

    <!-- Exit Confirmation Modal -->
    <div v-if="showExitConfirm" class="modal-overlay" @click="showExitConfirm = false">
      <div class="confirm-modal" @click.stop>
        <h3>Xác nhận thoát</h3>
        <p>Bạn có chắc chắn muốn thoát khỏi bài thi? Tiến độ sẽ không được lưu.</p>
        <div class="modal-actions">
          <button class="cancel-btn" @click="showExitConfirm = false">Hủy</button>
          <button class="confirm-btn" @click="exitTest">Thoát</button>
        </div>
      </div>
    </div>

    <!-- Submit Confirmation Modal -->
    <div v-if="showSubmitConfirm" class="modal-overlay" @click="showSubmitConfirm = false">
      <div class="confirm-modal" @click.stop>
        <h3>Xác nhận nộp bài</h3>
        <p>Bạn đã hoàn thành {{ answeredCount }}/{{ totalQuestions }} câu hỏi.</p>
        <p>Bạn có chắc chắn muốn nộp bài?</p>
        <div class="modal-actions">
          <button class="cancel-btn" @click="showSubmitConfirm = false">Kiểm tra lại</button>
          <button class="confirm-btn" @click="submitTest">Nộp bài</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchTestDetails } from '../OnlineTestPageAPI.js'

const route = useRoute()
const router = useRouter()

// Props from route params
const testId = route.params.testId
const testMode = route.query.mode || 'fulltest'
const selectedSectionIds = route.query.sections ? route.query.sections.split(',') : []
// const customTimeLimit = route.query.timeLimit || null

const testData = ref(null)      // <-- Sẽ chứa dữ liệu trả về từ API
const isLoading = ref(true)     // <-- Trạng thái loading
const error = ref(null)         // <-- Trạng thái lỗi

// State
const testTitle = ref(route.query.title || 'Đang tải...') // Cập nhật title mặc định
const activePassageId = ref(null)
const selectedAnswers = ref({})
const timeRemaining = ref(3600)
const showExitConfirm = ref(false)
const showSubmitConfirm = ref(false)

// Filter passages based mode and selected sections
const passages = computed(() => {
  if (!testData.value?.passages) return []
  
  if (testMode === 'practice' && selectedSectionIds.length > 0) {
    // Lọc các passage nếu ở chế độ luyện tập theo section
    // So sánh cả number và string ID để đảm bảo tương thích
    const filteredPassages = testData.value.passages.filter(p => {
      return selectedSectionIds.includes(String(p.id)) || selectedSectionIds.includes(p.id)
    })
    return filteredPassages
  }
  
  return testData.value.passages || []
})
const activePassage = computed(() => {
    if (!activePassageId.value && passages.value.length > 0) {
        activePassageId.value = passages.value[0].id
    }
    return passages.value.find(p => p.id === activePassageId.value) || null
})

const currentPassageQuestions = computed(() => {
  if (!activePassage.value) return []
  return activePassage.value.questions || []
})

const currentPassageQuestionRange = computed(() => {
  if (!activePassage.value) return { start: 0, end: 0 }
  
  // Lấy tất cả flattenedQuestions của passage hiện tại
  const passageQuestions = flattenedQuestions.value.filter(fq => fq.passageId === activePassage.value.id)
  if (passageQuestions.length === 0) return { start: 0, end: 0 }
  
  return {
    start: passageQuestions[0].displayNumber,
    end: passageQuestions[passageQuestions.length - 1].displayNumber
  }
})

const allQuestions = computed(() => {
  if (!passages.value) return []
  return passages.value.flatMap(p => p.questions || [])
})

// HÀM HELPER MỚI: TẠO RA DANH SÁCH CÂU HỎI "PHẲNG" VÀ ĐÁNH SỐ LẠI
const flattenedQuestions = computed(() => {
  if (!testData.value?.passages) return [];

  const result = [];
  let currentQuestionNumber = 1;

  // Lặp qua tất cả các passage
  for (const passage of testData.value.passages) {
    if (!passage.questions) continue;
    
    // Lặp qua các câu hỏi gốc từ API trong mỗi passage
    for (const originalQuestion of passage.questions) {
      if (originalQuestion.questionType === 'table') {
        // Nếu là câu hỏi bảng, bung nó ra thành các câu hỏi con
        const answerFields = getAnswerFields(originalQuestion); // Dùng lại hàm helper đã tạo
        for (const field of answerFields) {
          result.push({
            // Tạo một object câu hỏi "ảo"
            id: `virtual_${originalQuestion.id}_${field.answerId}`,
            displayNumber: currentQuestionNumber, // Số thứ tự mới
            passageId: passage.id,
            // Thêm tham chiếu đến câu hỏi gốc để scroll
            originalQuestionId: originalQuestion.id 
          });
          currentQuestionNumber++;
        }
      } else {
        // Nếu là câu hỏi thường, chỉ cần đánh lại số thứ tự
        result.push({
          id: originalQuestion.id,
          displayNumber: currentQuestionNumber, // Số thứ tự mới
          passageId: passage.id,
          originalQuestionId: originalQuestion.id
        });
        currentQuestionNumber++;
      }
    }
  }
  return result;
});

// HÀM HELPER MỚI: LẤY KHOẢNG SỐ THỨ TỰ ĐỂ HIỂN THỊ
const getQuestionDisplayRange = (question) => {
    // Tìm câu hỏi đầu tiên trong flattenedQuestions khớp với ID của câu hỏi gốc
    const firstSubQuestion = flattenedQuestions.value.find(
        (fq) => fq.originalQuestionId === question.id
    );

    if (!firstSubQuestion) return question.questionNumber;

    if (question.questionType !== 'table') {
        return firstSubQuestion.displayNumber;
    }

    // Nếu là bảng, tìm câu hỏi con cuối cùng và tạo khoảng
    const answerFields = getAnswerFields(question);
    if (answerFields.length > 1) {
        const lastDisplayNumber = firstSubQuestion.displayNumber + answerFields.length - 1;
        return `${firstSubQuestion.displayNumber}-${lastDisplayNumber}`;
    }
    
    return firstSubQuestion.displayNumber;
};

// CẬP NHẬT LẠI COMPUTED `totalQuestions`
const totalQuestions = computed(() => {
  return flattenedQuestions.value.length; // <-- Đếm trên danh sách đã được làm phẳng
})

const answeredCount = computed(() => {
  let count = 0
  
  allQuestions.value.forEach(question => {
    if (question.questionType === 'table' && question.tableData?.tableData) {
      // For table questions, check if all answer cells are filled
      const answerCells = []
      question.tableData.tableData.forEach(row => {
        row.forEach(cell => {
          if (cell.isAnswer) {
            answerCells.push(`q${question.id}_${cell.answerId}`)
          }
        })
      })
      
      const allAnswered = answerCells.length > 0 && answerCells.every(cellId => 
        selectedAnswers.value[cellId] && selectedAnswers.value[cellId].trim() !== ''
      )
      
      if (allAnswered) count++
    } else {
      // For regular questions
      if (selectedAnswers.value[question.id] && selectedAnswers.value[question.id] !== '') {
        count++
      }
    }
  })
  
  return count
})

// Methods
const selectPassage = (passageId) => {
  activePassageId.value = passageId
}

// HÀM HELPER: Lấy và sắp xếp các ô cần trả lời cho câu hỏi dạng bảng
const getAnswerFields = (question) => {
  if (question.questionType !== 'table' || !question.tableData?.tableData) {
    return [];
  }
  
  // Lấy tất cả các cell là câu trả lời ra một mảng phẳng
  const answerCells = question.tableData.tableData.flat().filter(cell => cell.isAnswer);
  
  // Sắp xếp chúng theo answerId để đảm bảo thứ tự đúng (1, 2, 3...)
  answerCells.sort((a, b) => {
    // Chuyển answerId sang số để so sánh chính xác
    const idA = parseInt(a.answerId, 10);
    const idB = parseInt(b.answerId, 10);
    return idA - idB;
  });
  
  return answerCells;
};

const scrollToQuestion = (passageId, originalQuestionId) => {
  // Switch to the passage first
  activePassageId.value = passageId
  
  setTimeout(() => {
    // Cuộn đến phần tử DOM bằng ID của câu hỏi gốc
    const questionElement = document.querySelector(`[data-question-id="${originalQuestionId}"]`)
    if (questionElement) {
      questionElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      questionElement.classList.add('highlight')
      setTimeout(() => {
        questionElement.classList.remove('highlight')
      }, 2000)
    }
  }, 100)
}

const saveAnswer = (questionId, answer) => {
  selectedAnswers.value[questionId] = answer
  localStorage.setItem(`test_${testId}_answers`, JSON.stringify(selectedAnswers.value))
}

const isQuestionAnswered = (question) => {
  if (question.questionType === 'table' && question.tableData?.tableData) {
    // For table questions, check if all answer cells are filled
    const answerCells = []
    question.tableData.tableData.forEach(row => {
      row.forEach(cell => {
        if (cell.isAnswer) {
          answerCells.push(`q${question.id}_${cell.answerId}`)
        }
      })
    })
    
    return answerCells.length > 0 && answerCells.every(cellId => 
      selectedAnswers.value[cellId] && selectedAnswers.value[cellId].trim() !== ''
    )
  } else {
    // For regular questions
    return selectedAnswers.value[question.id] && selectedAnswers.value[question.id] !== ''
  }
}

// Helper function để kiểm tra trạng thái answered cho navigation buttons
const isFlatQuestionAnswered = (flatQuestion) => {
  // Tìm original question từ flatQuestion
  const originalQuestion = allQuestions.value.find(q => q.id === flatQuestion.originalQuestionId)
  if (!originalQuestion) return false
  
  if (originalQuestion.questionType === 'table' && originalQuestion.tableData?.tableData) {
    // Đối với câu hỏi bảng, kiểm tra specific answer cell của flatQuestion này
    if (flatQuestion.id.startsWith('virtual_')) {
      // Lấy answerId từ virtual question ID
      const parts = flatQuestion.id.split('_')
      const answerId = parts[parts.length - 1]
      const answerKey = `q${originalQuestion.id}_${answerId}`
      return selectedAnswers.value[answerKey] && selectedAnswers.value[answerKey].trim() !== ''
    }
    
    // Nếu không phải virtual question, check toàn bộ bảng
    const answerCells = []
    originalQuestion.tableData.tableData.forEach(row => {
      row.forEach(cell => {
        if (cell.isAnswer) {
          answerCells.push(`q${originalQuestion.id}_${cell.answerId}`)
        }
      })
    })
    
    return answerCells.length > 0 && answerCells.every(cellId => 
      selectedAnswers.value[cellId] && selectedAnswers.value[cellId].trim() !== ''
    )
  } else {
    // Đối với câu hỏi thường
    return selectedAnswers.value[originalQuestion.id] && selectedAnswers.value[originalQuestion.id] !== ''
  }
}
const getQuestionClass = (question) => {
  let isAnswered = false
  
  if (question.questionType === 'table' && question.tableData?.tableData) {
    // For table questions, check if all answer cells are filled
    const answerCells = []
    question.tableData.tableData.forEach(row => {
      row.forEach(cell => {
        if (cell.isAnswer) {
          answerCells.push(`q${question.id}_${cell.answerId}`)
        }
      })
    })
    
    isAnswered = answerCells.length > 0 && answerCells.every(cellId => 
      selectedAnswers.value[cellId] && selectedAnswers.value[cellId].trim() !== ''
    )
  } else {
    // For regular questions
    isAnswered = selectedAnswers.value[question.id] && selectedAnswers.value[question.id] !== ''
  }
  
  const isCurrentPassage = activePassageId.value === question.passageId
  
  return {
    answered: isAnswered,
    current: isCurrentPassage,
    unanswered: !isAnswered
  }
}

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const toggleTimer = () => {
  showTimer.value = !showTimer.value
}

const exitTest = () => {
  localStorage.removeItem(`test_${testId}_answers`)
  router.push('/online-test')
}

const submitTest = () => {
  console.log('Submitting test with answers:', selectedAnswers.value)
  router.push('/online-test')
}

// Timer countdown
let timerInterval = null

const startTimer = () => {
  // Only start timer if there's a time limit
  if (timeRemaining.value <= 0) return
  
  timerInterval = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--
    } else {
      // Time's up - auto submit
      clearInterval(timerInterval)
      submitTest()
    }
  }, 1000)
}

// Lifecycle
onMounted(async () => {
  try {
    const data = await fetchTestDetails(testId);
    testData.value = data;
    testTitle.value = data.title; // Cập nhật title từ API
    
    // Set custom time limit if provided (practice mode)
    if (testMode === 'practice' && route.query.timeLimit) {
      const timeInMinutes = parseInt(route.query.timeLimit)
      if (!isNaN(timeInMinutes)) {
        timeRemaining.value = timeInMinutes * 60
      } else if (route.query.timeLimit === '') {
        // No time limit for practice mode
        timeRemaining.value = 0
      }
    }
    
    // Set initial active passage to first available passage
    if (passages.value.length > 0) {
      activePassageId.value = passages.value[0].id
    }

    // Load saved answers if any
    const savedAnswers = localStorage.getItem(`test_${testId}_answers`)
    if (savedAnswers) {
        selectedAnswers.value = JSON.parse(savedAnswers)
    }
    
    // Start timer only if time limit is set
    if (timeRemaining.value > 0) {
      startTimer()
    }

  } catch (err) {
    error.value = "Không thể tải được dữ liệu bài thi. Vui lòng thử lại.";
    console.error(err);
  } finally {
    isLoading.value = false;
  }
});

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})

// Handle beforeunload
const handleBeforeUnload = (e) => {
  e.preventDefault()
  e.returnValue = ''
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<style src="./FullTestPage.css" scoped></style>