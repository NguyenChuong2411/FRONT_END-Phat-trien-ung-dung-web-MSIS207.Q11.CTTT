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
        <div class="passage-tabs">
          <button 
            v-for="passage in passages" 
            :key="passage.id"
            class="passage-tab"
            :class="{ active: activePassage === passage.id }"
            @click="selectPassage(passage.id)"
          >
            {{ passage.name }}
          </button>
        </div>
        
        <div class="passage-content">
          <div class="passage-text" v-html="currentPassage.content"></div>
        </div>
      </div>

      <!-- Middle Panel - Questions Sheet -->
      <div class="questions-sheet-panel">
        <div class="questions-header">
          <h3>{{ currentPassage.name }}</h3>
          <div class="questions-range">
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
            <div 
              v-for="question in currentPassageQuestions" 
              :key="question.id"
              :data-question-id="question.id"
              class="question-item"
              :class="{ answered: selectedAnswers[question.id] }"
            >
              <div class="question-number-badge">{{ question.number }}</div>
              
              <div class="question-content">
                <div class="question-text" v-html="question.text"></div>
                
                <!-- Multiple Choice -->
                <div class="answer-options" v-if="question.type === 'multiple-choice'">
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
                    <span class="option-label">{{ option.label }}</span>
                    <span class="option-text">{{ option.text }}</span>
                  </label>
                </div>

                <!-- Fill in Blank -->
                <div class="answer-input" v-else-if="question.type === 'fill-blank'">
                  <input 
                    type="text" 
                    class="text-answer"
                    :placeholder="question.placeholder || 'Your answer'"
                    v-model="selectedAnswers[question.id]"
                    @input="saveAnswer(question.id, $event.target.value)"
                  />
                </div>

                <!-- Table Fill -->
                <div class="table-question" v-else-if="question.type === 'table'">
                  <table class="answer-table">
                    <tbody>
                      <tr v-for="(row, rowIndex) in question.tableData" :key="rowIndex">
                        <td v-for="(cell, cellIndex) in row" :key="cellIndex" class="table-cell">
                          <input 
                            v-if="cell.isAnswer"
                            type="text" 
                            class="table-input"
                            :placeholder="cell.number"
                            v-model="selectedAnswers[cell.answerId]"
                            @input="saveAnswer(cell.answerId, $event.target.value)"
                          />
                          <span v-else>{{ cell.text }}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
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
        <div class="question-nav">
          <div class="passage-questions" v-for="passage in passages" :key="passage.id">
            <h4>{{ passage.name }}</h4>
            <div class="question-grid">
              <button 
                v-for="questionNum in passage.questions"
                :key="`${passage.id}-${questionNum}`"
                class="question-btn"
                :class="getQuestionClass(passage.id, questionNum)"
                @click="scrollToQuestion(passage.id, questionNum)"
              >
                {{ questionNum }}
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

const route = useRoute()
const router = useRouter()

// Props from route params
const testId = route.params.testId
const testMode = route.query.mode || 'fulltest'
const selectedSectionIds = route.query.sections ? route.query.sections.split(',') : []
const customTimeLimit = route.query.timeLimit || null

// State
const testTitle = ref(route.query.title || 'IELTS Simulation Reading test 1')
const activePassage = ref('passage1')
const currentQuestionId = ref('p1q1')
const selectedAnswers = ref({})
const timeRemaining = ref(3600) // 60 minutes in seconds - will be updated based on mode
const showTimer = ref(true)
const showExitConfirm = ref(false)
const showSubmitConfirm = ref(false)

// All available passages data (mock - replace with API call)
const allPassages = [
  {
    id: 'passage1',
    name: 'Passage 1',
    questions: Array.from({length: 13}, (_, i) => i + 1),
    content: `
      <h3>A disaster of Titanic proportions</h3>
      <p>At 11:39 p.m. on the evening of Sunday 14 April 1912, lookouts Frederick Fleet and Reginald Lee on the forward mast of the Titanic sighted an iceberg dead ahead of the ship. Fleet picked up the phone to the helm, waited for Sixth Officer Moody to answer, and yelled "Iceberg, right ahead!" The greatest disaster in maritime history was about to be set in motion.</p>
      
      <p>Thirty-seven seconds later, despite the efforts of First Officer William Murdoch to steer around the iceberg, the Titanic struck a piece of submerged ice, bursting rivets in the ship's hull and flooding the first five watertight compartments. The ship's designer, Thomas Andrews, carried out a visual inspection of the ship's damage and informed Captain Smith at midnight that the ship would be lost within an hour.</p>
      
      <p>The first lifeboat was successfully lowered 15 minutes later, with only 28 of its 65 seats occupied. By 1:15 a.m., the water was lapping at the name on the ship's bow, and over the next hour every lifeboat would be released as officers struggled to bring passengers and crew up onto the boat deck.</p>
      
      <p>The closing moments of the Titanic's sinking began shortly after 2 a.m., as the ship's lights blinked once and went out and the ship's wireless fell silent. Less than 20 minutes later, the Titanic broke apart and sank into the frigid waters.</p>
    `
  },
  {
    id: 'passage2', 
    name: 'Passage 2',
    questions: Array.from({length: 13}, (_, i) => i + 14),
    content: '<p>Passage 2 content will be loaded here...</p>'
  },
  {
    id: 'passage3',
    name: 'Passage 3', 
    questions: Array.from({length: 14}, (_, i) => i + 27),
    content: '<p>Passage 3 content will be loaded here...</p>'
  }
]

// Filter passages based on mode and selected sections
const passages = computed(() => {
  if (testMode === 'practice' && selectedSectionIds.length > 0) {
    return allPassages.filter(passage => selectedSectionIds.includes(passage.id))
  }
  return allPassages
})

// All questions data - organized by passages
const allQuestionsData = {
  passage1: [
    {
      id: 'p1q1',
      number: 1,
      type: 'table',
      text: 'Complete the table below:',
      tableData: [
        [{ text: 'Time' }, { text: 'Event' }],
        [{ text: '11:39 p.m.' }, { isAnswer: true, answerId: 'p1q1', number: '1' }],
        [{ isAnswer: true, answerId: 'p1q2', number: '2' }, { text: 'Titanic struck iceberg' }],
        [{ text: 'Midnight' }, { isAnswer: true, answerId: 'p1q3', number: '3' }],
      ]
    },
    {
      id: 'p1q4',
      number: 4,
      type: 'multiple-choice',
      text: 'The lookouts who first sighted the iceberg were:',
      options: [
        { id: 'A', label: 'A', text: 'Frederick Fleet and Reginald Lee' },
        { id: 'B', label: 'B', text: 'William Murdoch and Thomas Andrews' },
        { id: 'C', label: 'C', text: 'Captain Smith and Sixth Officer Moody' },
        { id: 'D', label: 'D', text: 'Thomas Andrews and Captain Smith' }
      ]
    },
    {
      id: 'p1q5',
      number: 5,
      type: 'fill-blank',
      text: 'The Titanic struck the iceberg at _______ seconds after the lookouts spotted it.',
      placeholder: 'number of seconds'
    },
    {
      id: 'p1q6',
      number: 6,
      type: 'multiple-choice',
      text: 'According to the passage, how long did Thomas Andrews predict the ship would survive?',
      options: [
        { id: 'A', label: 'A', text: 'Less than one hour' },
        { id: 'B', label: 'B', text: 'Less than two hours' },
        { id: 'C', label: 'C', text: 'Less than three hours' },
        { id: 'D', label: 'D', text: 'More than two hours' }
      ]
    },
    // Add more questions for passage 1 (up to 13)
    ...Array.from({length: 7}, (_, i) => ({
      id: `p1q${i + 7}`,
      number: i + 7,
      type: 'fill-blank',
      text: `Question ${i + 7} for Passage 1`,
      placeholder: 'Your answer'
    }))
  ],
  passage2: [
    ...Array.from({length: 13}, (_, i) => ({
      id: `p2q${i + 1}`,
      number: i + 14,
      type: 'multiple-choice',
      text: `Question ${i + 14} for Passage 2`,
      options: [
        { id: 'A', label: 'A', text: 'Option A' },
        { id: 'B', label: 'B', text: 'Option B' },
        { id: 'C', label: 'C', text: 'Option C' },
        { id: 'D', label: 'D', text: 'Option D' }
      ]
    }))
  ],
  passage3: [
    ...Array.from({length: 14}, (_, i) => ({
      id: `p3q${i + 1}`,
      number: i + 27,
      type: 'fill-blank',
      text: `Question ${i + 27} for Passage 3`,
      placeholder: 'Your answer'
    }))
  ]
}

// Filter questions based on available passages
const questionsData = computed(() => {
  if (testMode === 'practice' && selectedSectionIds.length > 0) {
    const filtered = {}
    selectedSectionIds.forEach(id => {
      if (allQuestionsData[id]) {
        filtered[id] = allQuestionsData[id]
      }
    })
    return filtered
  }
  return allQuestionsData
})

// Computed properties
const currentPassage = computed(() => {
  return passages.value.find(p => p.id === activePassage.value) || passages.value[0]
})

const currentPassageQuestions = computed(() => {
  return questionsData.value[activePassage.value] || []
})

const currentPassageQuestionRange = computed(() => {
  const questions = currentPassageQuestions.value
  if (questions.length === 0) return { start: 1, end: 1 }
  return {
    start: questions[0].number,
    end: questions[questions.length - 1].number
  }
})

const allQuestions = computed(() => {
  return Object.values(questionsData.value).flat()
})

const totalQuestions = computed(() => {
  return allQuestions.value.length
})

const answeredCount = computed(() => {
  return Object.keys(selectedAnswers.value).length
})

// Navigation computed properties not needed in sheet layout

// Methods
const selectPassage = (passageId) => {
  activePassage.value = passageId
}

const scrollToQuestion = (passageId, questionNum) => {
  // Switch to the passage first
  activePassage.value = passageId
  
  // Scroll to the specific question in the questions sheet
  const questionId = `${passageId.replace('passage', 'p')}q${questionNum}`
  setTimeout(() => {
    const questionElement = document.querySelector(`[data-question-id="${questionId}"]`)
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
  // Auto-save to localStorage
  localStorage.setItem(`test_${testId}_answers`, JSON.stringify(selectedAnswers.value))
}

const getQuestionClass = (passageId, questionNum) => {
  // Find the actual question to get its ID
  const passageQuestions = questionsData.value[passageId] || []
  const question = passageQuestions.find(q => q.number === questionNum)
  
  if (!question) return { unanswered: true }
  
  const isAnswered = selectedAnswers.value[question.id] !== undefined
  const isCurrentPassage = activePassage.value === passageId
  
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
  // Clear saved progress
  localStorage.removeItem(`test_${testId}_answers`)
  router.push('/online-test')
}

const submitTest = () => {
  // Save final answers
  const finalAnswers = { ...selectedAnswers.value }
  
  // Navigate to results page or show results modal
  console.log('Submitting test with answers:', finalAnswers)
  
  // For now, just go back to test list
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
onMounted(() => {
  // Set custom time limit if provided
  if (testMode === 'practice' && customTimeLimit) {
    const timeInMinutes = parseInt(customTimeLimit)
    if (!isNaN(timeInMinutes)) {
      timeRemaining.value = timeInMinutes * 60
    } else if (customTimeLimit === '') {
      // No time limit for practice mode
      timeRemaining.value = 0
      showTimer.value = false
    }
  }
  
  // Set initial active passage to first available passage
  if (passages.value.length > 0) {
    activePassage.value = passages.value[0].id
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
  
  console.log(`Test mode: ${testMode}`, `Selected sections:`, selectedSectionIds)
})

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

<style scoped>
/* Full Test Page Layout */
.full-test-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
  overflow: hidden;
}

/* Test Header */
.test-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.test-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.test-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.practice-mode-badge {
  font-size: 0.875rem;
  font-weight: 400;
  opacity: 0.9;
}

.exit-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.exit-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Test Content - 3 Panel Layout */
.test-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Left Panel - Passages (40%) */
.passages-panel {
  width: 50%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e5e7eb;
  background: white;
}

.passage-tabs {
  display: flex;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.passage-tab {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: #6b7280;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.passage-tab:hover {
  background: #f1f5f9;
  color: #374151;
}

.passage-tab.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  background: white;
}

.passage-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.passage-text {
  line-height: 1.6;
  color: #374151;
}

.passage-text h3 {
  color: #1f2937;
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.passage-text p {
  margin-bottom: 1rem;
  text-align: justify;
}

/* Middle Panel - Questions Sheet (40%) */
.questions-sheet-panel {
  width: 30%;
  display: flex;
  flex-direction: column;
  background: #fafafa;
  border-right: 1px solid #e5e7eb;
}

.questions-header {
  background: white;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  text-align: center;
}

.questions-header h3 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-size: 1.25rem;
}

.questions-range {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
}

.questions-sheet {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background: white;
}

.question-instruction {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.question-instruction p {
  margin: 0.25rem 0;
  color: #374151;
  font-size: 0.875rem;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.question-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: #fafafa;
  transition: all 0.3s ease;
}

.question-item.answered {
  background: #f0fdf4;
  border-color: #10b981;
}

.question-item.highlight {
  background: #fef3c7;
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.question-number-badge {
  background: #3b82f6;
  color: white;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.question-item.answered .question-number-badge {
  background: #10b981;
}

.question-content {
  flex: 1;
}

.question-text {
  margin-bottom: 1rem;
  color: #374151;
  line-height: 1.6;
}

/* Right Panel - Timer & Navigation (20%) */
.timer-nav-panel {
  width: 20%;
  display: flex;
  flex-direction: column;
  background: white;
}

.timer-section {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  text-align: center;
  background: #f8fafc;
}

.timer-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.timer-display {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.75rem;
}

.hide-timer-btn {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
}

.question-nav {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.passage-questions {
  margin-bottom: 1.5rem;
}

.passage-questions h4 {
  color: #374151;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.question-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.375rem;
}

.question-btn {
  aspect-ratio: 1;
  border: 1px solid #d1d5db;
  background: white;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.question-btn:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.question-btn.current {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.question-btn.answered {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.question-btn.unanswered {
  background: white;
  color: #6b7280;
  border-color: #d1d5db;
}

/* Question content styling moved to questions sheet */

.answer-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.answer-option {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 0.5rem;
  background: white;
}

.answer-option:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.answer-option.selected {
  background: #eff6ff;
  border-color: #3b82f6;
}

.answer-option input[type="radio"] {
  margin: 0;
  cursor: pointer;
}

.option-label {
  font-weight: 600;
  color: #374151;
  min-width: 1.5rem;
}

.option-text {
  flex: 1;
  color: #6b7280;
}

.answer-input {
  margin-top: 1rem;
}

.text-answer {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.text-answer:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Table Questions */
.table-question {
  margin-top: 1rem;
}

.answer-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #d1d5db;
}

.table-cell {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  vertical-align: middle;
}

.table-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.table-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* Submit Section */
.submit-section {
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Navigation buttons removed - using question grid instead */

.submit-btn {
  padding: 0.75rem 1.5rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  margin-left: auto;
}

.submit-btn:hover {
  background: #059669;
}

/* Modal Overlays */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.confirm-modal {
  background: white;
  border-radius: 0.75rem;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.confirm-modal h3 {
  margin: 0 0 1rem 0;
  color: #1f2937;
  font-size: 1.25rem;
}

.confirm-modal p {
  color: #6b7280;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
}

.confirm-btn {
  padding: 0.75rem 1.5rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

.confirm-btn:hover {
  background: #dc2626;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .test-content {
    flex-direction: column;
  }
  
  .passages-panel,
  .questions-sheet-panel {
    width: 100%;
    height: 45%;
  }
  
  .timer-nav-panel {
    width: 100%;
    height: 10%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
  }
  
  .timer-section {
    flex: 0 0 auto;
  }
  
  .question-nav {
    flex: 1;
    max-height: none;
    overflow: visible;
  }
  
  .question-grid {
    grid-template-columns: repeat(10, 1fr);
    gap: 0.25rem;
  }
  
  .question-btn {
    font-size: 0.75rem;
    min-width: 1.5rem;
    height: 1.5rem;
  }
}

@media (max-width: 768px) {
  .passages-panel,
  .questions-sheet-panel {
    height: 47%;
  }
  
  .timer-nav-panel {
    height: 6%;
  }
  
  .question-item {
    padding: 0.75rem;
    gap: 0.75rem;
  }
  
  .question-number-badge {
    width: 1.5rem;
    height: 1.5rem;
    font-size: 0.75rem;
  }
  
  .questions-sheet {
    padding: 1rem;
  }
}
</style>