<template>
  <div class="question-form">
    <div class="question-header">
      <h6>
        Câu hỏi {{ questionNumber }}
        <!-- <span v-if="showId && question.id" class="id-badge">ID: {{ question.id }}</span> -->
      </h6>
      <button type="button" class="btn-remove small" @click="$emit('remove')">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    </div>

    <div class="question-content">
      <!-- Step 1: Select Question Type (if not selected) -->
      <div v-if="!localQuestion.questionType" class="question-type-selection">
        <h6 class="selection-title">
            Chọn loại câu hỏi
        </h6>
        <div class="type-cards">
          <div class="type-card" @click="selectQuestionType('multiple-choice')">
            <div class="type-icon">
              <i class="fa-solid fa-rectangle-list"></i>
            </div>
            <div class="type-info">
              <h6>Trắc nghiệm</h6>
              <p>Câu hỏi với nhiều lựa chọn (A, B, C, D...)</p>
            </div>
          </div>

          <div class="type-card" @click="selectQuestionType('fill-blank')">
            <div class="type-icon">
              <i class="fa-solid fa-keyboard"></i>
            </div>
            <div class="type-info">
              <h6>Điền vào chỗ trống</h6>
              <p>Thí sinh tự nhập câu trả lời</p>
            </div>
          </div>

          <div class="type-card" @click="selectQuestionType('table')">
            <div class="type-icon">
              <i class="fa-solid fa-window-restore"></i>
            </div>
            <div class="type-info">
              <h6>Bảng</h6>
              <p>Câu hỏi dạng bảng với nhiều ô trả lời</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Fill Question Details (after type selected) -->
      <div v-else class="question-details">
        <!-- Question Type Badge with Change Button -->
        <div class="type-badge-container">
          <span class="type-badge" :class="localQuestion.questionType">
            {{ getQuestionTypeName(localQuestion.questionType) }}
          </span>
          <button type="button" class="btn-change-type" @click="changeQuestionType" title="Đổi loại câu hỏi">
            Đổi loại câu hỏi
          </button>
        </div>

        <!-- Question Prompt (Common for all types) -->
        <div class="form-group">
          <label>Nội dung câu hỏi *</label>
          <textarea 
            v-model="localQuestion.prompt" 
            placeholder="Nhập nội dung câu hỏi..."
            rows="3"
            required
            class="form-textarea"
            @input="updateQuestion"
          ></textarea>
        </div>

        <!-- Multiple Choice Form -->
        <div v-if="localQuestion.questionType === 'multiple-choice'" class="answer-section">
          <div class="section-header">
            <h6>
              Các lựa chọn ({{ options.length }})
            </h6>
            <button type="button" class="btn-add small" @click="addMultipleChoiceOption">
              <i class="fa-solid fa-plus"></i>
              Thêm lựa chọn
            </button>
          </div>

          <div class="options-list">
            <div v-for="(option, index) in options" :key="'option-' + index" class="option-item">
              <div class="option-header">
                <label class="option-label">
                  <input 
                    type="radio" 
                    :name="'correct-' + questionNumber"
                    :checked="option.isCorrect"
                    @change="setCorrectMultipleChoice(index)"
                    class="option-radio"
                  />
                  <span class="option-letter">{{ getOptionLetter(index) }}.</span>
                  <span v-if="option.isCorrect" class="correct-indicator">
                    <i class="fa-solid fa-check-circle"></i> Đáp án đúng
                  </span>
                </label>
                <button 
                  v-if="options.length > 2" 
                  type="button" 
                  class="btn-remove-option" 
                  @click="removeMultipleChoiceOption(index)"
                >
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
              <input 
                type="text" 
                v-model="option.optionText" 
                placeholder="Nhập nội dung lựa chọn..."
                class="form-input"
                required
                @input="updateQuestion"
              />
            </div>
          </div>
        </div>

        <!-- Fill Blank Form -->
        <div v-else-if="localQuestion.questionType === 'fill-blank'" class="answer-section">
          <h6 class="section-title">
            <i class="fa-solid fa-check-circle"></i>
            Đáp án đúng
          </h6>
          <div class="form-group">
            <label>Câu trả lời chấp nhận *</label>
            <input 
              type="text" 
              v-model="localQuestion.correctAnswers"
              placeholder="VD: London (hoặc nhiều đáp án cách nhau bởi dấu ;)"
              class="form-input"
              required
              @input="updateQuestion"
            />
            <small class="help-text">
              <i class="fa-solid fa-lightbulb"></i>
              Có thể nhập nhiều đáp án đúng, phân cách bởi dấu chấm phẩy (;). 
              VD: "London; london; LONDON"
            </small>
          </div>
        </div>

        <!-- Table Form -->
        <div v-else-if="localQuestion.questionType === 'table'" class="answer-section">
          <h6 class="section-title">
            Cấu trúc bảng
          </h6>
          
          <div class="form-row">
            <div class="form-group">
              <label>Số hàng *</label>
              <input 
                type="number" 
                v-model.number="tableRows"
                min="2"
                max="10"
                class="form-input"
                @change="regenerateTable"
              />
            </div>
            <div class="form-group">
              <label>Số cột *</label>
              <input 
                type="number" 
                v-model.number="tableCols"
                min="2"
                max="6"
                class="form-input"
                @change="regenerateTable"
              />
            </div>
          </div>

          <div class="table-editor">
            <p class="help-text">
              Click vào ô để đánh dấu là câu trả lời. Ô được đánh dấu sẽ để trống cho thí sinh điền.
            </p>
            
            <table class="preview-table">
              <tbody>
                <tr v-for="(row, rowIndex) in localQuestion.tableData.tableData" :key="'row-' + rowIndex">
                  <td 
                    v-for="(cell, colIndex) in row" 
                    :key="'cell-' + colIndex"
                    :class="{ 
                      'is-answer': cell.isAnswer, 
                      'is-header': rowIndex === 0 || colIndex === 0 
                    }"
                    @click="toggleAnswerCell(rowIndex, colIndex)"
                  >
                    <div v-if="cell.isAnswer" class="answer-indicator">
                      <i class="fa-solid fa-edit"></i>
                      <span class="answer-number">{{ cell.answerId }}</span>
                    </div>
                    <input 
                      v-else
                      type="text" 
                      v-model="cell.content"
                      :placeholder="(rowIndex === 0 || colIndex === 0) ? 'Header' : 'Content'"
                      class="cell-input"
                      @input="updateQuestion"
                      @click.stop
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Correct Answers for Table -->
          <div v-if="tableAnswerCells.length > 0" class="table-answers">
            <h6 class="section-title">
              <i class="fa-solid fa-check-circle"></i>
              Đáp án đúng cho các ô ({{ tableAnswerCells.length }} ô)
            </h6>
            <div v-for="cell in tableAnswerCells" :key="cell.answerId" class="answer-input-group">
              <label>Ô {{ cell.answerId }}:</label>
              <input 
                type="text" 
                v-model="cell.correctAnswer"
                :placeholder="'Nhập đáp án đúng cho ô ' + cell.answerId"
                class="form-input"
                required
                @input="updateQuestion"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <ConfirmationModal
      :show="showConfirmModal"
      type="warning"
      title="Xác nhận thay đổi"
      message="Thay đổi này sẽ xóa tất cả dữ liệu hiện tại. Bạn có chắc chắn?"
      confirm-text="Tiếp tục"
      cancel-text="Hủy bỏ"
      @confirm="confirmAction"
      @cancel="showConfirmModal = false"
      @close="showConfirmModal = false"
    />
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'

const props = defineProps({
  question: {
    type: Object,
    required: true
  },
  questionNumber: {
    type: Number,
    required: true
  },
  showId: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update', 'remove'])

// Helper function to parse correctAnswers
const parseCorrectAnswers = (correctAnswers) => {
  if (!correctAnswers) return ''
  if (typeof correctAnswers === 'string') return correctAnswers
  if (typeof correctAnswers === 'object' && 'answer' in correctAnswers) {
    return correctAnswers.answer || ''
  }
  return String(correctAnswers)
}

const localQuestion = ref({
  ...props.question,
  questionType: props.question.questionType || '',
  questionNumber: props.question.questionNumber || props.questionNumber,
  prompt: props.question.prompt || '',
  correctAnswers: parseCorrectAnswers(props.question.correctAnswers),
  tableData: props.question.tableData || null
})

const options = ref([])
const tableRows = ref(3)
const tableCols = ref(3)
const showConfirmModal = ref(false)
const confirmAction = ref(null)

const tableAnswerCells = computed(() => {
  if (!localQuestion.value.tableData?.tableData) return []
  
  const answerCells = []
  localQuestion.value.tableData.tableData.forEach(row => {
    row.forEach(cell => {
      if (cell.isAnswer) {
        answerCells.push(cell)
      }
    })
  })
  
  // Sort by answerId
  answerCells.sort((a, b) => (a.answerId || 0) - (b.answerId || 0))
  return answerCells
})

// Methods
const selectQuestionType = (type) => {
  localQuestion.value.questionType = type
  
  // Initialize based on type
  if (type === 'multiple-choice') {
    initializeMultipleChoice()
  } else if (type === 'fill-blank') {
    localQuestion.value.correctAnswers = ''
  } else if (type === 'table') {
    initializeTable()
  }
  
  updateQuestion()
}

const changeQuestionType = () => {
  confirmAction.value = () => {
    localQuestion.value.questionType = ''
    localQuestion.value.prompt = ''
    localQuestion.value.correctAnswers = ''
    localQuestion.value.tableData = null
    options.value = []
    updateQuestion()
    showConfirmModal.value = false
  }
  showConfirmModal.value = true
}

const initializeMultipleChoice = () => {
  options.value = [
    { optionText: '', isCorrect: false, optionLabel: 'A', displayOrder: 1 },
    { optionText: '', isCorrect: false, optionLabel: 'B', displayOrder: 2 },
    { optionText: '', isCorrect: false, optionLabel: 'C', displayOrder: 3 },
    { optionText: '', isCorrect: false, optionLabel: 'D', displayOrder: 4 }
  ]
}

const addMultipleChoiceOption = () => {
  const nextLetter = String.fromCharCode(65 + options.value.length)
  options.value.push({
    optionText: '',
    isCorrect: false,
    optionLabel: nextLetter,
    displayOrder: options.value.length + 1
  })
  updateQuestion()
}

const removeMultipleChoiceOption = (index) => {
  if (options.value.length <= 2) {
    // Có thể thay thế bằng notification toast nếu muốn
    alert('Phải có ít nhất 2 lựa chọn!')
    return
  }
  options.value.splice(index, 1)
  options.value.forEach((opt, i) => {
    opt.optionLabel = String.fromCharCode(65 + i)
    opt.displayOrder = i + 1
  })
  updateQuestion()
}

const setCorrectMultipleChoice = (index) => {
  options.value.forEach((opt, i) => {
    opt.isCorrect = (i === index)
  })
  updateQuestion()
}

const getOptionLetter = (index) => {
  return String.fromCharCode(65 + index)
}

const initializeTable = () => {
  const tableData = []
  for (let i = 0; i < tableRows.value; i++) {
    const row = []
    for (let j = 0; j < tableCols.value; j++) {
      row.push({
        content: '',
        isAnswer: false,
        answerId: null,
        correctAnswer: ''
      })
    }
    tableData.push(row)
  }
  
  localQuestion.value.tableData = {
    rows: tableRows.value,
    cols: tableCols.value,
    tableData: tableData
  }
}

const regenerateTable = () => {
  confirmAction.value = () => {
    initializeTable()
    updateQuestion()
    showConfirmModal.value = false
  }
  showConfirmModal.value = true
}

const toggleAnswerCell = (rowIndex, colIndex) => {
  const cell = localQuestion.value.tableData.tableData[rowIndex][colIndex]
  
  if (cell.isAnswer) {
    cell.isAnswer = false
    cell.answerId = null
    cell.correctAnswer = ''
  } else {
    cell.isAnswer = true
    cell.content = ''
    const maxId = Math.max(0, ...tableAnswerCells.value.map(c => c.answerId || 0))
    cell.answerId = maxId + 1
    cell.correctAnswer = ''
  }
  
  updateQuestion()
}

const getQuestionTypeName = (type) => {
  const names = {
    'multiple-choice': 'Trắc nghiệm',
    'fill-blank': 'Điền vào chỗ trống',
    'table': 'Bảng'
  }
  return names[type] || type
}

const updateQuestion = () => {
  const questionDataToEmit = {
    id: localQuestion.value.id,
    questionNumber: localQuestion.value.questionNumber,
    questionType: localQuestion.value.questionType,
    prompt: localQuestion.value.prompt,
    tableData: null,
    options: [],
    correctAnswers: {}
  }

  switch (localQuestion.value.questionType) {
    case 'multiple-choice': {
      const correctOption = options.value.find(opt => opt.isCorrect)
      questionDataToEmit.correctAnswers = { answer: correctOption ? correctOption.optionLabel : '' }
      questionDataToEmit.options = options.value.map(opt => ({
        optionLabel: opt.optionLabel,
        optionText: opt.optionText,
        displayOrder: opt.displayOrder
      }))
      break
    }
    case 'fill-blank': {
      questionDataToEmit.correctAnswers = { answer: localQuestion.value.correctAnswers || '' }
      break
    }
    case 'table': {
      const answersDict = {}
      tableAnswerCells.value.forEach(cell => {
        if (cell.answerId) {
          answersDict[String(cell.answerId)] = cell.correctAnswer || ''
        }
      })
      questionDataToEmit.correctAnswers = answersDict
      questionDataToEmit.tableData = localQuestion.value.tableData
      break
    }
    default:
      questionDataToEmit.correctAnswers = {}
      break
  }
  emit('update', questionDataToEmit)
}

// Watch for prop changes
watch(() => props.question, (newQuestion) => {
  localQuestion.value = {
    ...newQuestion,
    questionType: newQuestion.questionType || '',
    prompt: newQuestion.prompt || '',
    correctAnswers: parseCorrectAnswers(newQuestion.correctAnswers),
    tableData: newQuestion.tableData || null
  }
  
  // Initialize multiple choice if needed
  if (newQuestion.questionType === 'multiple-choice' && newQuestion.options) {
    options.value = [...newQuestion.options]
  }
  
  // Initialize table dimensions if needed
  if (newQuestion.questionType === 'table' && newQuestion.tableData) {
    tableRows.value = newQuestion.tableData.rows || 3
    tableCols.value = newQuestion.tableData.cols || 3
  }
}, { deep: true })

// Initialize on mount
onMounted(() => {
  if (localQuestion.value.questionType === 'multiple-choice') {
    if (props.question.options && props.question.options.length > 0) {
      options.value = [...props.question.options]
    } else {
      initializeMultipleChoice()
    }
  }
  
  if (localQuestion.value.questionType === 'table' && localQuestion.value.tableData) {
    tableRows.value = localQuestion.value.tableData.rows || 3
    tableCols.value = localQuestion.value.tableData.cols || 3
  }
})
</script>

<style src="@/assets/form.css"></style>
<style src="@/assets/buttons.css"></style>
<style src="../TestManagement.css" scoped></style>
<style scoped>
/* Question Header */
.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 2px solid #0000002c;
}

.question-header h6 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.question-header .btn-remove {
  padding: 0.375rem 0.75rem;
  border: none;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.question-header .btn-remove:hover {
  background: #fecaca;
}

/* Question Type Selection */
.question-type-selection {
  padding: 1.5rem 0;
}

.selection-title {
  margin: 0 0 1.5rem 0;
  color: #2d3748;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.type-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.type-card {
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.type-card:hover {
  border-color: #F6871F;
  background: #fff5e6;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(246, 135, 31, 0.1);
}

.type-icon {
  font-size: 2.5rem;
  color: #F6871F;
  margin-bottom: 1rem;
}

.type-info h6 {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
  font-size: 1rem;
  font-weight: 600;
}

.type-info p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

/* Question Details */
.question-details {
  padding-top: 1rem;
}

.type-badge-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.type-badge.multiple-choice {
  background: #e6f3ff;
  color: #0066cc;
}

.type-badge.fill-blank {
  background: #e6ffe6;
  color: #00a000;
}

.type-badge.table {
  background: #ffe6f0;
  color: #cc0066;
}

.btn-change-type {
  padding: 0.375rem 0.75rem;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transition: all 0.2s ease;
}

.btn-change-type:hover {
  background: #f7fafc;
  border-color: #F6871F;
  color: #F6871F;
}

/* Answer Section */
.answer-section {
  margin-top: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h6,
.section-title {
  margin: 0 0 0.75rem 0;
  color: #2d3748;
  font-size: 0.95rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Multiple Choice Options */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.option-item {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  padding: 0.75rem;
}

.option-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  color: #2d3748;
}

.option-radio {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.option-letter {
  font-weight: 700;
  font-size: 1rem;
  min-width: 24px;
}

.correct-indicator {
  color: #10b981;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.btn-remove-option {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

/* Table Editor */
.table-editor {
  margin-top: 1rem;
}

.help-text {
  display: block;
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #f7fafc;
  border-radius: 0.375rem;
  border-left: 3px solid #F6871F;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

.preview-table td {
  border: 1px solid #e2e8f0;
  padding: 0.5rem;
  text-align: center;
  cursor: pointer;
  min-width: 80px;
  transition: all 0.2s ease;
}

.preview-table td:hover {
  background: #f7fafc;
}

.preview-table td.is-header {
  background: #f7fafc;
  font-weight: 600;
}

.preview-table td.is-answer {
  background: #fff5e6;
  border: 2px solid #F6871F;
  cursor: pointer;
}

.answer-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  color: #F6871F;
  font-weight: 600;
}

.answer-number {
  background: #F6871F;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
}

.cell-input {
  width: 100%;
  border: none;
  background: transparent;
  text-align: center;
  padding: 0.25rem;
}

.cell-input:focus {
  outline: none;
  background: white;
}

/* Table Answers */
.table-answers {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 0.5rem;
}

.answer-input-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.answer-input-group label {
  min-width: 60px;
  font-weight: 600;
  color: #2d3748;
}

.answer-input-group:last-child {
  margin-bottom: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .type-cards {
    grid-template-columns: 1fr;
  }
  
  .type-badge-container {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .answer-input-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .answer-input-group label {
    min-width: auto;
  }
}
</style>
