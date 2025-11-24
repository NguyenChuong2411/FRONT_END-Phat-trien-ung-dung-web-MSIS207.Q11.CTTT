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
      
      <!-- Audio Player for Listening Tests -->
      <div v-if="isListeningTest && audioUrl" class="audio-player-container">
        <div class="audio-player">
          <audio 
            ref="audioElement"
            :src="audioUrl"
            @timeupdate="onAudioTimeUpdate"
            @loadedmetadata="onAudioLoadedMetadata"
            @ended="onAudioEnded"
            preload="metadata"
          ></audio>
          
          <div class="audio-controls">
            <button class="audio-btn" @click="toggleAudio">
              <i v-if="isPlaying" class="fa-regular fa-circle-pause"></i>
              <i v-else class="fa-solid fa-headphones"></i>
            </button>
            
            <div class="audio-progress">
              <div class="audio-time-display">
                <span class="current-time">{{ formatAudioTime(currentAudioTime) }}</span>
                <span class="total-time">{{ formatAudioTime(audioDuration) }}</span>
              </div>
              <div class="audio-slider-container">
                <input 
                  type="range" 
                  class="audio-slider"
                  :min="0"
                  :max="audioDuration"
                  :value="currentAudioTime"
                  @input="seekAudio($event.target.value)"
                />
              </div>
            </div>
            
            <div class="recording-tabs">
              <button 
                v-for="(part, index) in passages.filter(p => p.isListening)" 
                :key="part.id"
                class="recording-tab"
                :class="{ active: activePassageId === part.id }"
                @click="selectPassage(part.id)"
              >
                Recording {{ index + 1 }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Test Content -->
    <div class="test-content" :class="{ 'listening-layout': isListeningTest }">
      <!-- Left Panel - Passages/Parts -->
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
          
          <div v-else-if="activePassage && !activePassage.isListening" class="passage-text">
            <h3 v-if="activePassage.sectionType === 'writing'" class="task-title">{{ activePassage.title }}</h3>
            <div v-html="activePassage.content"></div>
          </div>
          
          <div v-else-if="activePassage && activePassage.isListening" class="passage-text listening-placeholder">
            <div v-if="activePassage.sectionType === 'speaking'" class="speaking-guide">
              <h3>Phần thi Speaking</h3>
              <p>Hãy xem các đề mẫu và luyện tập</p>
            </div>
            <div v-else>
              <p>Đây là phần thi Nghe. Hãy nghe file audio và trả lời câu hỏi bên phải.</p>
            </div>
          </div>
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
          <!-- <div class="question-instruction" v-if="currentPassageQuestions.length > 0">
            <p><strong>Complete the table below.</strong></p>
            <p><strong>Choose NO MORE THAN TWO WORDS from the text for each answer.</strong></p>
            <p><strong>Write your answers in boxes {{ currentPassageQuestionRange.start }}-{{ currentPassageQuestionRange.end }} on your answer sheet.</strong></p>
          </div> -->

          <div class="questions-list">
            <template v-for="question in currentPassageQuestions" :key="question.id">
              
              <!-- Writing Question -->
              <div v-if="activePassage?.sectionType === 'writing'" class="question-item writing-item">
                <div class="question-content">
                  <!-- <div class="question-text" v-html="question.prompt"></div> -->
                  
                  <div class="writing-area">
                    <label class="writing-label">Bài làm của bạn:</label>
                    <textarea 
                      class="writing-input" 
                      rows="15" 
                      placeholder="Nhập câu trả lời của bạn tại đây..."
                      v-model="selectedAnswers[question.id]"
                      @input="saveAnswer(question.id, $event.target.value)"
                    ></textarea>
                    <div class="word-count">
                      Số từ: {{ (selectedAnswers[question.id] || '').trim().split(/\s+/).filter(w => w).length }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Speaking Question -->
              <div v-else-if="activePassage?.sectionType === 'speaking'" class="question-item speaking-item">
                <div class="question-number-badge">{{ getQuestionDisplayRange(question) }}</div>
                <div class="question-content">
                  <div class="question-text" v-html="question.prompt"></div>
                  
                  <div class="recorder-ui">
                    <div class="recorder-status">
                      <span class="status-dot"></span> Sẵn sàng ghi âm
                    </div>
                    <button class="record-btn">
                      Bắt đầu nói
                    </button>
                    <p class="recorder-note">* Chức năng ghi âm đang được phát triển. Vui lòng tự luyện tập và nhấn nộp bài khi hoàn thành.</p>
                    
                    <!-- <div class="manual-confirm">
                      <label>
                        <input type="checkbox" 
                          :checked="selectedAnswers[question.id] === 'completed'"
                          @change="saveAnswer(question.id, $event.target.checked ? 'completed' : '')"
                        > 
                        Tôi đã hoàn thành phần nói này
                      </label>
                    </div> -->
                  </div>
                </div>
              </div>

              <!-- Regular Question (Reading/Listening) -->
              <div v-else 
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
                      :class="{ selected: selectedAnswers[question.id] === option.optionLabel }" 
                    >
                      <input 
                        type="radio" 
                        :name="`question-${question.id}`"
                        :value="option.optionLabel" 
                        v-model="selectedAnswers[question.id]"
                        @change="saveAnswer(question.id, option.optionLabel)" 
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
                          <span v-if="!cell.isAnswer">{{ cell.content }}</span>
                          <strong v-else class="answer-placeholder">
                            {{ cell.answerId }} ________
                          </strong>
                        </td>
                      </tr>
                    </table>
                  </div>
                </div>
              </div>

              <!-- Table Answer Inputs - Outside question-item (only for regular tests) -->
              <div v-if="question.questionType === 'table' && question.tableData && activePassage?.sectionType !== 'speaking' && activePassage?.sectionType !== 'writing'" class="table-answers-section">
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
        <div class="submit-summary">
          <div class="summary-item">
            <span class="summary-label">Đã hoàn thành:</span>
            <span class="summary-value">{{ answeredCount }}/{{ totalQuestions }} câu hỏi</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Còn lại:</span>
            <span class="summary-value">{{ totalQuestions - answeredCount }} câu hỏi</span>
          </div>
          <div v-if="timeRemaining > 0" class="summary-item">
            <span class="summary-label">Thời gian còn lại:</span>
            <span class="summary-value">{{ formatTime(timeRemaining) }}</span>
          </div>
        </div>
        <p class="submit-warning">
          <strong>Lưu ý:</strong> Sau khi nộp bài, bạn không thể thay đổi đáp án. Bạn có chắc chắn muốn nộp bài?
        </p>
        <div class="modal-actions">
          <button class="cancel-btn" @click="showSubmitConfirm = false">Kiểm tra lại</button>
          <button class="confirm-btn" @click="submitTest">Nộp bài</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { fetchTestDetails, fetchListeningTestDetails, submitTest as submitTestAPI } from '../OnlineTestPageAPI.js'

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

const isTOEICSW = computed(() => {
  return route.query.type === 'TOEIC SW' || testData.value?.type === 'TOEIC SW';
});

// Listening test specific states
const isListeningTest = computed(() => {
  return !!(audioUrl.value || (testData.value?.parts && testData.value.parts.length > 0))
})
const audioUrl = ref('')
const currentAudioTime = ref(0)
const audioDuration = ref(0)
const isPlaying = ref(false)
const activePartId = ref(null)

const passages = computed(() => {
  if (!testData.value) return [];
  
  const sections = [];

  // Map Listening Parts
  if (testData.value.parts && testData.value.parts.length > 0) {
    sections.push(...testData.value.parts.map(part => ({
      id: part.id,
      title: part.title || `Part ${part.partNumber}`,
      content: null, 
      questions: part.questionGroups ? part.questionGroups.flatMap(group => group.questions || []) : [],
      isListening: true,
      sectionType: 'listening'
    })));
  }

  // Map Reading Passages
  if (testData.value.passages && testData.value.passages.length > 0) {
    sections.push(...testData.value.passages.map(p => ({
      id: p.id,
      title: p.title || 'Reading Passage',
      content: p.content, 
      questions: p.questions || [],
      isListening: false,
      sectionType: 'reading'
    })));
  }

  // Map Speaking Questions (TOEIC SW)
  if (testData.value.speakingQuestions && testData.value.speakingQuestions.length > 0) {
    sections.push(...testData.value.speakingQuestions.map((s, index) => ({
      id: `speaking_${s.id}`,
      title: `Speaking Q${index + 1}: ${s.partName}`,
      content: null,
      isListening: true,
      sectionType: 'speaking',
      questions: [{
        id: s.id,
        prompt: s.questionText,
        questionType: 'speaking', 
        questionNumber: index + 1,
        preparationTime: s.preparationTime,
        responseTime: s.responseTime
      }]
    })));
  }

  // Map Writing Tasks (TOEIC SW)
  if (testData.value.writingTasks && testData.value.writingTasks.length > 0) {
    sections.push(...testData.value.writingTasks.map((w, index) => ({
      id: `writing_${w.id}`,
      title: `Writing Task ${index + 1}: ${w.taskType}`,
      content: w.prompt,
      isListening: false,
      sectionType: 'writing',
      questions: [{
        id: w.id,
        prompt: w.prompt,
        questionType: 'writing',
        questionNumber: index + 1,
        minWords: w.minWords,
        durationMinutes: w.durationMinutes
      }]
    })));
  }

  // Áp dụng filter nếu cần (practice mode)
  let allSections = sections;
  if (testMode === 'practice' && selectedSectionIds.length > 0) {
    // Lọc các section nếu ở chế độ luyện tập theo section
    allSections = allSections.filter(section => {
      return selectedSectionIds.includes(String(section.id)) || selectedSectionIds.includes(section.id)
    })
  }

  return allSections;
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
  if (!passages.value) return [];
  return passages.value.flatMap(section => section.questions || []);
})

const flattenedQuestions = computed(() => {
  const result = [];
  let currentQuestionNumber = 1;

  // Dùng `passages` (computed) đã được gộp
  for (const section of passages.value) { 
    if (!section.questions) continue;
    
    for (const originalQuestion of section.questions) {
      if (originalQuestion.questionType === 'table') {
        const answerFields = getAnswerFields(originalQuestion);
        for (const field of answerFields) {
          result.push({
            id: `virtual_${originalQuestion.id}_${field.answerId}`,
            displayNumber: currentQuestionNumber,
            passageId: section.id, // Dùng ID của section (part hoặc passage)
            originalQuestionId: originalQuestion.id 
          });
          currentQuestionNumber++;
        }
      } else {
        result.push({
          id: originalQuestion.id,
          displayNumber: currentQuestionNumber,
          passageId: section.id, // Dùng ID của section
          originalQuestionId: originalQuestion.id
        });
        currentQuestionNumber++;
      }
    }
  }
  
  return result;
});

const getQuestionDisplayRange = (question) => {
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

const totalQuestions = computed(() => {
  return flattenedQuestions.value.length;
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
  // Ensure questionId is string for consistency
  const stringQuestionId = String(questionId)
  selectedAnswers.value[stringQuestionId] = answer
  localStorage.setItem(`test_${testId}_answers`, JSON.stringify(selectedAnswers.value))
  console.log(`Saved answer for question ${stringQuestionId}:`, answer)
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
// const getQuestionClass = (question) => {
//   let isAnswered = false
  
//   if (question.questionType === 'table' && question.tableData?.tableData) {
//     // For table questions, check if all answer cells are filled
//     const answerCells = []
//     question.tableData.tableData.forEach(row => {
//       row.forEach(cell => {
//         if (cell.isAnswer) {
//           answerCells.push(`q${question.id}_${cell.answerId}`)
//         }
//       })
//     })
    
//     isAnswered = answerCells.length > 0 && answerCells.every(cellId => 
//       selectedAnswers.value[cellId] && selectedAnswers.value[cellId].trim() !== ''
//     )
//   } else {
//     // For regular questions
//     isAnswered = selectedAnswers.value[question.id] && selectedAnswers.value[question.id] !== ''
//   }
  
//   const isCurrentPassage = activePassageId.value === question.passageId
  
//   return {
//     answered: isAnswered,
//     current: isCurrentPassage,
//     unanswered: !isAnswered
//   }
// }

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// Audio player methods
const audioElement = ref(null)

const playAudio = () => {
  if (audioElement.value) {
    audioElement.value.play()
    isPlaying.value = true
  }
}

const pauseAudio = () => {
  if (audioElement.value) {
    audioElement.value.pause()
    isPlaying.value = false
  }
}

const toggleAudio = () => {
  if (isPlaying.value) {
    pauseAudio()
  } else {
    playAudio()
  }
}

const seekAudio = (time) => {
  if (audioElement.value) {
    audioElement.value.currentTime = time
    currentAudioTime.value = time
  }
}

const formatAudioTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const onAudioTimeUpdate = () => {
  if (audioElement.value) {
    currentAudioTime.value = audioElement.value.currentTime
  }
}

const onAudioLoadedMetadata = () => {
  if (audioElement.value) {
    audioDuration.value = audioElement.value.duration
  }
}

const onAudioEnded = () => {
  isPlaying.value = false
}

const exitTest = () => {
  resetTestData()
  router.push('/online-test')
}

const submitTest = async () => {
  showSubmitConfirm.value = false; // Đóng modal xác nhận
  
  // Dữ liệu người dùng trả lời đã có định dạng đúng
  const submissionData = {
    testId: parseInt(testId),
    answers: selectedAnswers.value 
  };

  try {
    const result = await submitTestAPI(submissionData);
    
    // Chuyển hướng đến trang kết quả
    router.push(`/online-test/results/${result.attemptId}`);
  } catch (err) {
    console.error('Submit test error:', err);
    alert(`Nộp bài thất bại: ${err.response?.data || err.message}. Vui lòng thử lại.`);
  }
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
    // Check if this is a fresh start (not continuing from where left off)
    const urlParams = new URLSearchParams(window.location.search);
    const isFreshStart = !urlParams.has('continue') || urlParams.get('continue') === 'false';
    
    // Also check if user navigated here from test list (fresh start)
    const referrer = document.referrer;
    const isFromTestList = referrer.includes('/online-test') && !referrer.includes('/online-test/full-test');
    
    if (isFreshStart || isFromTestList || performance.navigation.type === 1) { // type 1 = refresh
      // Reset any existing data for fresh start
      console.log('Fresh start detected - clearing any existing test data');
      localStorage.removeItem(`test_${testId}_answers`);
      localStorage.removeItem(`test_${testId}_time`);
      localStorage.removeItem(`test_${testId}_startTime`);
      selectedAnswers.value = {};
    }
    
    // =======================================================
    // SỬA LẠI LOGIC TẢI DỮ LIỆU
    // =======================================================
    // Giờ đây fetchListeningTestDetails sẽ trả về CẢ listening và reading
    // (hoặc chỉ reading nếu là đề reading-only mà ta lỡ gán audio)
    // Fallback `fetchTestDetails` dùng khi test không có audio (ví dụ IELTS Reading thuần túy)
    let data;
    try {
        data = await fetchListeningTestDetails(testId);
    } catch (e) {
        console.warn("Could not fetch as ListeningTest, falling back to ReadingTest");
        data = await fetchTestDetails(testId);
    }
    // =======================================================
    
    testData.value = data;
    testTitle.value = data.title; // Cập nhật title từ API
    audioUrl.value = data.audioUrl || ''; // Lấy audioUrl nếu có
    
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

// Reset all test data
const resetTestData = () => {
  console.log('Resetting test data...')
  selectedAnswers.value = {}
  timeRemaining.value = 3600
  showExitConfirm.value = false
  showSubmitConfirm.value = false
  activePassageId.value = null
  
  // Clear localStorage
  localStorage.removeItem(`test_${testId}_answers`)
  localStorage.removeItem(`test_${testId}_time`)
  localStorage.removeItem(`test_${testId}_startTime`)
  
  // Reset audio if listening test
  if (audioElement.value) {
    audioElement.value.pause()
    audioElement.value.currentTime = 0
    isPlaying.value = false
    currentAudioTime.value = 0
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

// Reset data when component is unmounted (user navigates away)
onBeforeUnmount(() => {
  resetTestData()
})

// Reset data when user navigates to different route
onBeforeRouteLeave((to, from, next) => {
  // If user is navigating to results page, don't reset (they submitted the test)
  if (to.path.includes('/online-test/results/')) {
    next()
    return
  }
  
  // For any other navigation, reset the data
  resetTestData()
  next()
})
</script>

<style src="./FullTestPage.css" scoped></style>

<style scoped>
/* CSS MỚI CHO TOEIC SW */

/* Task title styles */
.task-title {
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

/* Writing Styles */
.writing-item {
  padding: 0;
  border: none;
  background: transparent;
}

.writing-area {
  margin-top: 1.5rem;
}

.writing-label {
  display: block;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 0.5rem;
}

.writing-input {
  width: 100%;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.6;
  resize: vertical;
  min-height: 300px;
  background-color: #fff;
}

.writing-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.word-count {
  text-align: right;
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

/* Speaking Styles */
.speaking-guide {
  text-align: center;
  padding: 2rem;
  color: #4b5563;
}

.speaking-guide i {
  font-size: 3rem;
  color: #f59e0b;
  margin-bottom: 1rem;
}

.speaking-guide h3 {
  margin: 0 0 1rem 0;
  color: #1f2937;
}

.speaking-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.recorder-ui {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  margin-top: 1.5rem;
}

.recorder-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: #059669;
  font-weight: 500;
}

.status-dot {
  width: 10px;
  height: 10px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.record-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  margin-bottom: 1rem;
}

.record-btn:hover {
  background: #dc2626;
  transform: scale(1.05);
}

.recorder-note {
  color: #6b7280;
  font-size: 0.9rem;
  font-style: italic;
  margin-bottom: 1rem;
}

.manual-confirm {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed #cbd5e1;
}

.manual-confirm label {
  cursor: pointer;
  color: #059669;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.manual-confirm input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #059669;
}
</style>