<template>
  <div class="modal-overlay" @click="!isPageMode && $emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header info">
        <h3>
          Tạo đề thi {{ testType }} - Reading
        </h3>
        <button v-if="!isPageMode" class="close-btn" @click="$emit('close')">
          <i class="fa-solid fa-circle-xmark"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="handleSubmit" class="test-form">
          <!-- Basic Information -->
          <div class="form-section">
            <h4 class="section-title">Thông tin cơ bản</h4>
            
            <div class="form-row">
              <div class="form-group">
                <label>Tên đề thi *</label>
                <input 
                  type="text" 
                  v-model="formData.title" 
                  required 
                  placeholder="VD: IELTS Academic Reading Test 1"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label>Thời gian (phút) *</label>
                <input 
                  type="number" 
                  v-model="formData.durationMinutes" 
                  required 
                  min="1" 
                  placeholder="60"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label>Mô tả</label>
              <textarea 
                v-model="formData.description" 
                placeholder="Mô tả chi tiết về đề thi Reading..."
                rows="3"
                class="form-textarea"
              ></textarea>
            </div>
          </div>

          <!-- Reading Passages Section -->
          <div class="form-section">
            <div class="section-header">
              <h4 class="section-title">
                <i class="fa-solid fa-file-text"></i>
                Đoạn văn Reading ({{ formData.passages.length }})
              </h4>
              <button type="button" class="btn-add" @click="addPassage">
                <i class="fa-solid fa-plus"></i>
                Thêm đoạn văn
              </button>
            </div>

            <div v-if="formData.passages.length === 0" class="empty-state">
              <p>Chưa có đoạn văn nào. Hãy thêm đoạn văn đầu tiên.</p>
            </div>

            <div v-for="(passage, pIndex) in formData.passages" :key="'passage-' + pIndex" class="passage-item">
              <div class="item-header">
                <h5>
                  <i class="fa-solid fa-file-text"></i>
                  Passage {{ pIndex + 1 }}
                  <span class="passage-info">({{ passage.questions.length }} câu hỏi)</span>
                </h5>
                <button type="button" class="btn-remove" @click="removePassage(pIndex)">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Tiêu đề đoạn văn</label>
                  <input 
                    type="text" 
                    v-model="passage.title" 
                    placeholder="VD: The History of Coffee"
                    class="form-input"
                  />
                </div>
                <div class="form-group">
                  <label>Thứ tự hiển thị</label>
                  <input 
                    type="number" 
                    v-model="passage.displayOrder" 
                    min="1"
                    class="form-input"
                  />
                </div>
              </div>

              <div class="form-group">
                <label>Nội dung đoạn văn *</label>
                <textarea 
                  v-model="passage.content" 
                  placeholder="Nhập nội dung đoạn văn Reading..."
                  rows="8"
                  required
                  class="form-textarea"
                ></textarea>
                <div class="word-count">
                  Số từ: {{ getWordCount(passage.content) }}
                </div>
              </div>

              <!-- Questions for this passage -->
              <div class="questions-subsection">
                <div class="subsection-header">
                  <h6>
                    Câu hỏi cho Passage {{ pIndex + 1 }}
                  </h6>
                  <button type="button" class="btn-add small" @click="addQuestionToPassage(pIndex)">
                    <i class="fa-solid fa-plus"></i>
                    Thêm câu hỏi
                  </button>
                </div>

                <div v-if="passage.questions.length === 0" class="empty-state small">
                  <i class="fa-solid fa-question-circle"></i>
                  <p>Chưa có câu hỏi nào cho đoạn văn này</p>
                </div>

                <div v-for="(question, qIndex) in passage.questions" :key="'passage-question-' + qIndex" class="question-item">
                  <QuestionForm 
                    :question="question"
                    :question-number="qIndex + 1"
                    @update="updatePassageQuestion(pIndex, qIndex, $event)"
                    @remove="removePassageQuestion(pIndex, qIndex)"
                  />
                </div>

                <!-- Bottom Add Question Button -->
                <div v-if="passage.questions.length > 0" class="bottom-add-button">
                  <button type="button" class="btn-add" @click="addQuestionToPassage(pIndex)">
                    <i class="fa-solid fa-plus"></i>
                    Thêm câu hỏi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn secondary" @click="$emit('close')">
          Hủy bỏ
        </button>
        <button type="button" class="btn primary" @click="handleSubmit" :disabled="isSaving">
          {{ isSaving ? 'Đang tạo...' : 'Tạo đề thi Reading' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import QuestionForm from '../QuestionFormNew.vue'
import { TestDataHelpers } from '@/services/TestAdminAPI.js'

const props = defineProps({
  testType: {
    type: String,
    required: true
  },
  testTypeId: {
    type: Number,
    required: true
  },
  skillTypeId: {
    type: Number,
    default: null
  },
  isSaving: {
    type: Boolean,
    default: false
  },
  isPageMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'save'])

// Form data
const formData = ref({
  title: '',
  description: '',
  durationMinutes: 60,
  testTypeId: props.testTypeId,
  skillTypeId: props.skillTypeId, // Gán prop vào formData
  audioFileId: null,
  passages: [],
  listeningParts: []
})

// Passage management
const addPassage = () => {
  const newPassage = TestDataHelpers.createEmptyPassage(formData.value.passages.length + 1)
  formData.value.passages.push(newPassage)
}

const removePassage = (index) => {
  if (confirm('Bạn có chắc chắn muốn xóa đoạn văn này không?')) {
    formData.value.passages.splice(index, 1)
    // Update display orders
    formData.value.passages.forEach((passage, i) => {
      passage.displayOrder = i + 1
    })
  }
}

const addQuestionToPassage = (passageIndex) => {
  const passage = formData.value.passages[passageIndex]
  const questionNumber = passage.questions.length + 1
  const newQuestion = TestDataHelpers.createEmptyQuestion(questionNumber)
  passage.questions.push(newQuestion)
}

const removePassageQuestion = (passageIndex, questionIndex) => {
  if (confirm('Bạn có chắc chắn muốn xóa câu hỏi này không?')) {
    formData.value.passages[passageIndex].questions.splice(questionIndex, 1)
    // Update question numbers
    formData.value.passages[passageIndex].questions.forEach((question, i) => {
      question.questionNumber = i + 1
    })
  }
}

const updatePassageQuestion = (passageIndex, questionIndex, questionData) => {
  formData.value.passages[passageIndex].questions[questionIndex] = questionData
}

// Utility functions
const getWordCount = (text) => {
  if (!text) return 0
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

const handleSubmit = () => {
  // Basic validation
  if (!formData.value.title.trim()) {
    alert('Vui lòng nhập tên đề thi')
    return
  }

  if (formData.value.passages.length === 0) {
    alert('Vui lòng thêm ít nhất 1 đoạn văn')
    return
  }

  // Check if all passages have content and questions
  for (let i = 0; i < formData.value.passages.length; i++) {
    const passage = formData.value.passages[i]
    if (!passage.content.trim()) {
      alert(`Vui lòng nhập nội dung cho Passage ${i + 1}`)
      return
    }
    if (passage.questions.length === 0) {
      alert(`Vui lòng thêm ít nhất 1 câu hỏi cho Passage ${i + 1}`)
      return
    }
  }

  emit('save', formData.value)
}
</script>

<style src="@/assets/modal.css"></style>
<style src="@/assets/form.css"></style>  
<style src="@/assets/buttons.css"></style>
<style src="../../TestManagement.css" scoped></style>
<style scoped>
/* Bottom Add Button */
.bottom-add-button {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 2px dashed #e2e8f0;
  display: flex;
  justify-content: center;
}

.bottom-add-button .btn-add {
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
}

/* Word Count */
.word-count {
  text-align: right;
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.5rem;
}
</style>