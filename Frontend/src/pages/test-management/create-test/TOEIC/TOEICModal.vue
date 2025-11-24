<template>
  <div class="modal-overlay" @click="!isPageMode && $emit('close')">
    <div class="modal-content large" @click.stop>
      <div class="modal-header primary">
        <h3>
          Tạo đề thi TOEIC - Listening & Reading
        </h3>
        <button v-if="!isPageMode" class="close-btn" @click="$emit('close')">
          <i class="fa-solid fa-times"></i>
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
                  placeholder="VD: TOEIC Practice Test 1"
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
                  placeholder="120"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-row">
              <!-- <div class="form-group">
                <label>File âm thanh Listening (ID)</label>
                <input 
                  type="number" 
                  v-model="formData.audioFileId" 
                  placeholder="ID file âm thanh cho phần Listening"
                  class="form-input"
                />
              </div> -->
              <div class="form-group full-width">
                <label>Chọn file âm thanh Listening *</label>
                <input 
                  type="file" 
                  accept="audio/*"
                  @change="handleAudioUpload"
                  class="form-input"
                  ref="audioFileInput"
                />
              </div>
            </div>

            <div class="form-group">
              <label>Mô tả</label>
              <textarea 
                v-model="formData.description" 
                placeholder="Mô tả chi tiết về đề thi TOEIC..."
                rows="3"
                class="form-textarea"
              ></textarea>
            </div>
          </div>

          <!-- Audio Preview -->
          <div v-if="audioFile" class="form-section">
            <h4 class="section-title">
              File âm thanh đã chọn
            </h4>
            
            <div class="audio-preview">
              <!-- Audio Player Preview -->
              <audio v-if="audioPreviewUrl" controls class="audio-player">
                <source :src="audioPreviewUrl" type="audio/mpeg">
                Trình duyệt không hỗ trợ phát âm thanh.
              </audio>
              
              <div class="audio-info">
                <i class="fa-solid fa-file-audio"></i>
                <span>{{ selectedFileName }}</span>
                <small class="file-note">File sẽ được tải lên khi tạo đề thi thành công</small>
              </div>
              
              <div class="audio-actions">
                <button type="button" class="btn secondary small" @click="clearAudio">
                  Xóa file đã chọn
                </button>
              </div>
            </div>
          </div>

          <!-- Tab Navigation -->
          <div class="tab-navigation">
            <button 
              type="button"
              class="tab-btn"
              :class="{ active: activeTab === 'listening' }"
              @click="activeTab = 'listening'"
            >
              Listening ({{ getTotalListeningQuestions() }} câu hỏi)
            </button>
            <button 
              type="button"
              class="tab-btn"
              :class="{ active: activeTab === 'reading' }"
              @click="activeTab = 'reading'"
            >
              Reading ({{ getTotalReadingQuestions() }} câu hỏi)
            </button>
          </div>

          <!-- Listening Section -->
          <div v-if="activeTab === 'listening'" class="form-section">
            <div class="section-header">
              <h4 class="section-title">
                TOEIC Listening (Parts 1-4)
              </h4>
              <button type="button" class="btn-add" @click="addListeningPart">
                <i class="fa-solid fa-plus"></i>
                Thêm Part
              </button>
            </div>

            <div v-if="formData.listeningParts.length === 0" class="empty-state">
              <p>Chưa có Listening Part nào. Hãy thêm Part đầu tiên.</p>
            </div>

            <div v-for="(part, partIndex) in formData.listeningParts" :key="'listening-part-' + partIndex" class="listening-part-item">
              <div class="item-header">
                <h5>
                  Listening Part {{ partIndex + 1 }}
                  <span class="part-info">({{ getTotalQuestionsInPart(part) }} câu hỏi)</span>
                </h5>
                <button type="button" class="btn-remove" @click="removeListeningPart(partIndex)">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Số Part (1-4)</label>
                  <select v-model="part.partNumber" class="form-select">
                    <option value="1">Part 1 - Photographs</option>
                    <option value="2">Part 2 - Question-Response</option>
                    <option value="3">Part 3 - Conversations</option>
                    <option value="4">Part 4 - Short Talks</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Tiêu đề Part</label>
                  <input 
                    type="text" 
                    v-model="part.title" 
                    :placeholder="getListeningPartPlaceholder(part.partNumber)"
                    class="form-input"
                  />
                </div>
              </div>

              <!-- Question Groups for Listening -->
              <div class="question-groups-subsection">
                <div class="subsection-header">
                  <h6>
                    Nhóm câu hỏi ({{ part.questionGroups.length }})
                  </h6>
                  <button type="button" class="btn-add small" @click="addQuestionGroup(partIndex, 'listening')">
                    <i class="fa-solid fa-plus"></i>
                    Thêm nhóm
                  </button>
                </div>

                <div v-for="(group, groupIndex) in part.questionGroups" :key="'listening-group-' + groupIndex" class="question-group-item">
                  <div class="group-header">
                    <h6>
                      <i class="fa-solid fa-folder"></i>
                      Nhóm {{ groupIndex + 1 }}
                      <span class="group-info">({{ group.questions.length }} câu hỏi)</span>
                    </h6>
                    <button type="button" class="btn-remove small" @click="removeQuestionGroup(partIndex, groupIndex, 'listening')">
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </div>

                  <div class="form-group">
                    <label>Hướng dẫn</label>
                    <textarea 
                      v-model="group.instructionText" 
                      :placeholder="getInstructionPlaceholder(part.partNumber)"
                      rows="2"
                      class="form-textarea"
                    ></textarea>
                  </div>

                  <!-- Questions in group -->
                  <div class="questions-subsection">
                    <div class="subsection-header">
                      <h6>
                        <i class="fa-solid fa-question-circle"></i>
                        Câu hỏi ({{ group.questions.length }})
                      </h6>
                      <button type="button" class="btn-add small" @click="addQuestionToGroup(partIndex, groupIndex, 'listening')">
                        <i class="fa-solid fa-plus"></i>
                        Thêm câu hỏi
                      </button>
                    </div>

                    <div v-for="(question, qIndex) in group.questions" :key="'listening-question-' + qIndex" class="question-item">
                      <QuestionForm 
                        :question="question"
                        :question-number="qIndex + 1"
                        @update="updateGroupQuestion(partIndex, groupIndex, qIndex, $event, 'listening')"
                        @remove="removeGroupQuestion(partIndex, groupIndex, qIndex, 'listening')"
                      />
                    </div>

                    <!-- Bottom Add Question Button -->
                    <div v-if="group.questions.length > 0" class="bottom-add-button">
                      <button type="button" class="btn-add" @click="addQuestionToGroup(partIndex, groupIndex, 'listening')">
                        <i class="fa-solid fa-plus"></i>
                        Thêm câu hỏi
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Reading Section -->
          <div v-if="activeTab === 'reading'" class="form-section">
            <div class="section-header">
              <h4 class="section-title">
                TOEIC Reading (Parts 5-7)
              </h4>
              <button type="button" class="btn-add" @click="addPassage">
                <i class="fa-solid fa-plus"></i>
                Thêm Passage
              </button>
            </div>

            <div v-if="formData.passages.length === 0" class="empty-state">
              <p>Chưa có Reading Passage nào. Hãy thêm Passage đầu tiên.</p>
            </div>

            <div v-for="(passage, pIndex) in formData.passages" :key="'reading-passage-' + pIndex" class="passage-item">
              <div class="item-header">
                <h5>
                  <i class="fa-solid fa-file-text"></i>
                  Reading Passage {{ pIndex + 1 }}
                  <span class="passage-info">({{ passage.questions.length }} câu hỏi)</span>
                </h5>
                <button type="button" class="btn-remove" @click="removePassage(pIndex)">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Part (5-7)</label>
                  <select v-model="passage.partType" class="form-select">
                    <option value="5">Part 5 - Incomplete Sentences</option>
                    <option value="6">Part 6 - Text Completion</option>
                    <option value="7">Part 7 - Reading Comprehension</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Tiêu đề Passage</label>
                  <input 
                    type="text" 
                    v-model="passage.title" 
                    :placeholder="getReadingPartPlaceholder(passage.partType)"
                    class="form-input"
                  />
                </div>
              </div>

              <div class="form-group">
                <label>Nội dung Passage *</label>
                <textarea 
                  v-model="passage.content" 
                  :placeholder="getContentPlaceholder(passage.partType)"
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
                    <i class="fa-solid fa-question-circle"></i>
                    Câu hỏi cho Passage {{ pIndex + 1 }}
                  </h6>
                  <button type="button" class="btn-add small" @click="addQuestionToPassage(pIndex)">
                    <i class="fa-solid fa-plus"></i>
                    Thêm câu hỏi
                  </button>
                </div>

                <div v-for="(question, qIndex) in passage.questions" :key="'reading-question-' + qIndex" class="question-item">
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
        <button type="button" class="btn primary" @click="handleSubmit" :disabled="isSaving || isUploading || !audioFile">
          {{ isSaving ? 'Đang lưu...' : (isUploading ? 'Đang tải file âm thanh...' : 'Tạo đề thi TOEIC') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import QuestionForm from '../QuestionFormNew.vue'
import { TestDataHelpers, TestAdminAPI } from '@/services/TestAdminAPI.js'

const props = defineProps({
  testTypeId: {
    type: Number,
    required: true
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

// Active tab
const activeTab = ref('listening')

// Form data
const formData = ref({
  title: '',
  description: '',
  durationMinutes: 120,
  testTypeId: props.testTypeId,
  audioFileId: null,
  passages: [],
  listeningParts: []
})

// Audio handling state
const audioFile = ref(null) // Keep track of the selected File object
const audioFileInput = ref(null) // Ref for the file input element
const isUploading = ref(false)
const selectedFileName = ref('') // Store selected file name for display
const audioPreviewUrl = ref('') // For audio preview

const handleAudioUpload = (event) => {
  const file = event.target.files[0]
  if (!file) {
    clearAudio() // Clear if user cancels file selection
    return
  }

  // Store file temporarily for later upload
  audioFile.value = file
  selectedFileName.value = file.name
  // Create preview URL for audio player
  audioPreviewUrl.value = URL.createObjectURL(file)
  console.log('Audio file selected:', file.name)
}

const clearAudio = () => {
  audioFile.value = null
  selectedFileName.value = ''
  formData.value.audioFileId = null
  
  // Clean up preview URL to avoid memory leaks
  if (audioPreviewUrl.value) {
    URL.revokeObjectURL(audioPreviewUrl.value)
    audioPreviewUrl.value = ''
  }
  
  // Clear the file input visually
  if (audioFileInput.value) {
    audioFileInput.value.value = ''
  }
}

// Listening part management
const addListeningPart = () => {
  const newPart = TestDataHelpers.createEmptyListeningPart(formData.value.listeningParts.length + 1)
  formData.value.listeningParts.push(newPart)
}

const removeListeningPart = (index) => {
  if (confirm('Bạn có chắc chắn muốn xóa Listening Part này không?')) {
    formData.value.listeningParts.splice(index, 1)
  }
}

// Reading passage management  
const addPassage = () => {
  const newPassage = TestDataHelpers.createEmptyPassage(formData.value.passages.length + 1)
  newPassage.partType = '7' // Default to Part 7
  formData.value.passages.push(newPassage)
}

const removePassage = (index) => {
  if (confirm('Bạn có chắc chắn muốn xóa Reading Passage này không?')) {
    formData.value.passages.splice(index, 1)
  }
}

// Question group management
const addQuestionGroup = (partIndex, type) => {
  if (type === 'listening') {
    const part = formData.value.listeningParts[partIndex]
    const newGroup = TestDataHelpers.createEmptyQuestionGroup(part.questionGroups.length + 1)
    part.questionGroups.push(newGroup)
  }
}

const removeQuestionGroup = (partIndex, groupIndex, type) => {
  if (confirm('Bạn có chắc chắn muốn xóa nhóm câu hỏi này không?')) {
    if (type === 'listening') {
      formData.value.listeningParts[partIndex].questionGroups.splice(groupIndex, 1)
    }
  }
}

// Question management
const addQuestionToGroup = (partIndex, groupIndex, type) => {
  if (type === 'listening') {
    const group = formData.value.listeningParts[partIndex].questionGroups[groupIndex]
    const questionNumber = group.questions.length + 1
    const newQuestion = TestDataHelpers.createEmptyQuestion(questionNumber)
    group.questions.push(newQuestion)
  }
}

const addQuestionToPassage = (passageIndex) => {
  const passage = formData.value.passages[passageIndex]
  const questionNumber = passage.questions.length + 1
  const newQuestion = TestDataHelpers.createEmptyQuestion(questionNumber)
  passage.questions.push(newQuestion)
}

const removeGroupQuestion = (partIndex, groupIndex, questionIndex, type) => {
  if (confirm('Bạn có chắc chắn muốn xóa câu hỏi này không?')) {
    if (type === 'listening') {
      formData.value.listeningParts[partIndex].questionGroups[groupIndex].questions.splice(questionIndex, 1)
    }
  }
}

const removePassageQuestion = (passageIndex, questionIndex) => {
  if (confirm('Bạn có chắc chắn muốn xóa câu hỏi này không?')) {
    formData.value.passages[passageIndex].questions.splice(questionIndex, 1)
  }
}

const updateGroupQuestion = (partIndex, groupIndex, questionIndex, questionData, type) => {
  if (type === 'listening') {
    formData.value.listeningParts[partIndex].questionGroups[groupIndex].questions[questionIndex] = questionData
  }
}

const updatePassageQuestion = (passageIndex, questionIndex, questionData) => {
  formData.value.passages[passageIndex].questions[questionIndex] = questionData
}

// Utility functions
const getTotalQuestionsInPart = (part) => {
  return part.questionGroups.reduce((total, group) => total + group.questions.length, 0)
}

const getTotalListeningQuestions = () => {
  return formData.value.listeningParts.reduce((total, part) => total + getTotalQuestionsInPart(part), 0)
}

const getTotalReadingQuestions = () => {
  return formData.value.passages.reduce((total, passage) => total + passage.questions.length, 0)
}

const getWordCount = (text) => {
  if (!text) return 0
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

const getListeningPartPlaceholder = (partNumber) => {
  const placeholders = {
    '1': 'Photographs',
    '2': 'Question-Response', 
    '3': 'Conversations',
    '4': 'Short Talks'
  }
  return placeholders[partNumber] || 'Nhập tiêu đề Part'
}

const getReadingPartPlaceholder = (partType) => {
  const placeholders = {
    '5': 'Incomplete Sentences',
    '6': 'Text Completion',
    '7': 'Reading Comprehension'
  }
  return placeholders[partType] || 'Nhập tiêu đề Passage'
}

const getInstructionPlaceholder = (partNumber) => {
  const placeholders = {
    '1': 'Look at the picture and listen to the four statements...',
    '2': 'You will hear a question or statement and three responses...',
    '3': 'You will hear some conversations between two or more people...',
    '4': 'You will hear some talks given by a single speaker...'
  }
  return placeholders[partNumber] || 'Nhập hướng dẫn cho nhóm câu hỏi này'
}

const getContentPlaceholder = (partType) => {
  const placeholders = {
    '5': 'Nhập các câu không hoàn chỉnh cần điền từ...',
    '6': 'Nhập đoạn văn ngắn với các chỗ trống...',
    '7': 'Nhập đoạn văn đọc hiểu (email, thông báo, bài báo...)...'
  }
  return placeholders[partType] || 'Nhập nội dung passage'
}

const handleSubmit = async () => {
  // Basic validation
  if (!formData.value.title.trim()) {
    alert('Vui lòng nhập tên đề thi')
    return
  }

  // Check if audio file is selected (required for TOEIC Listening)
  if (!audioFile.value) {
    alert('Vui lòng chọn file âm thanh cho phần Listening của đề thi TOEIC.')
    return
  }

  // Check listening parts
  if (formData.value.listeningParts.length === 0) {
    alert('Vui lòng thêm ít nhất 1 Listening Part')
    return
  }

  // Check reading passages
  if (formData.value.passages.length === 0) {
    alert('Vui lòng thêm ít nhất 1 Reading Passage')
    return
  }

  // Validate listening parts
  for (let i = 0; i < formData.value.listeningParts.length; i++) {
    const part = formData.value.listeningParts[i]
    if (part.questionGroups.length === 0) {
      alert(`Vui lòng thêm ít nhất 1 nhóm câu hỏi cho Listening Part ${i + 1}`)
      return
    }
    
    for (let j = 0; j < part.questionGroups.length; j++) {
      const group = part.questionGroups[j]
      if (group.questions.length === 0) {
        alert(`Vui lòng thêm ít nhất 1 câu hỏi cho Nhóm ${j + 1} của Listening Part ${i + 1}`)
        return
      }
    }
  }

  // Validate reading passages
  for (let i = 0; i < formData.value.passages.length; i++) {
    const passage = formData.value.passages[i]
    if (!passage.content.trim()) {
      alert(`Vui lòng nhập nội dung cho Reading Passage ${i + 1}`)
      return
    }
    if (passage.questions.length === 0) {
      alert(`Vui lòng thêm ít nhất 1 câu hỏi cho Reading Passage ${i + 1}`)
      return
    }
  }

  // Upload audio file first, then create test if successful
  try {
    isUploading.value = true
    
    // Upload audio file and get ID
    const uploadResult = await TestAdminAPI.uploadAudioFile(audioFile.value)
    if (uploadResult && uploadResult.audioFileId) {
      formData.value.audioFileId = uploadResult.audioFileId
      console.log('Audio uploaded successfully, ID:', uploadResult.audioFileId)
      
      // Now emit save with the audioFileId
      emit('save', { ...formData.value })
    } else {
      throw new Error('API did not return a valid audioFileId.')
    }
  } catch (error) {
    console.error('Audio upload failed:', error)
    alert(`Lỗi tải file âm thanh: ${error.message || 'Không thể tải file lên.'}`)
    isUploading.value = false
    return
  }
}

// Cleanup on component unmount
onUnmounted(() => {
  if (audioPreviewUrl.value) {
    URL.revokeObjectURL(audioPreviewUrl.value)
  }
})
</script>

<style src="@/assets/modal.css"></style>
<style src="@/assets/form.css"></style>
<style src="@/assets/buttons.css"></style>
<style src="../../TestManagement.css" scoped></style>
<style scoped>
/* Component-specific styles */
.modal-content.large {
  max-width: 1200px;
}
.form-group.full-width {
  grid-column: 1 / -1;
}
.tab-navigation {
  display: flex;
  margin-bottom: 2rem;
  background: #f7fafc;
  border-radius: 0.5rem;
  padding: 0.25rem;
  gap: 0.25rem;
}

.tab-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: #4a5568;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;
}

.tab-btn.active {
  background: white;
  color: #ed8936;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tab-btn:hover:not(.active) {
  background: rgba(255, 255, 255, 0.5);
}

.listening-part-item,
.passage-item {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border: 1px solid #e2e8f0;
}

.part-info,
.passage-info,
.group-info {
  background: #e2e8f0;
  color: #6b7280;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: normal;
}

.question-group-item {
  background: #f7fafc;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #e2e8f0;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.audio-preview {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.audio-player {
  width: 100%;
  height: 40px;
}

.audio-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4a5568;
}

.audio-actions {
  display: flex;
  gap: 0.5rem;
}

.file-note {
  display: block;
  color: #6b7280;
  font-style: italic;
  margin-top: 0.25rem;
}

.word-count {
  text-align: right;
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

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

/* Responsive */
@media (max-width: 768px) {
  .tab-navigation {
    flex-direction: column;
  }
}
</style>