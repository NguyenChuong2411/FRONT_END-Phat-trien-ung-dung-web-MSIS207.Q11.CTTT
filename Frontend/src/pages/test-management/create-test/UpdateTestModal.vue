<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" :class="{ 'view-only-mode': viewOnly }" @click.stop>
      <div class="modal-header" :class="viewOnly ? 'info' : 'success'">
        <h3>
          <i :class="viewOnly ? 'fa-solid fa-eye' : 'fa-solid fa-edit'"></i>
          {{ viewOnly ? 'Xem chi tiết đề thi' : 'Chỉnh sửa đề thi' }}
        </h3>
        <button class="close-btn" @click="$emit('close')">
          <i class="fa-solid fa-circle-xmark"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner">
            <p>Đang tải dữ liệu đề thi...</p>
          </div>
        </div>

        <form v-else @submit.prevent="handleSubmit" class="test-form">
          <!-- Basic Information -->
          <div class="form-section">
            <h4 class="section-title">Thông tin cơ bản</h4>
            
            <div class="form-row">
              <div class="form-group">
                <label>ID đề thi</label>
                <input 
                  type="text" 
                  :value="formData.id" 
                  disabled
                  class="form-input disabled"
                />
              </div>
              <div class="form-group">
                <label>Ngày tạo</label>
                <input 
                  type="text" 
                  :value="formatDate(formData.createdAt)" 
                  disabled
                  class="form-input disabled"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Tên đề thi *</label>
                <input 
                  type="text" 
                  v-model="formData.title" 
                  required 
                  placeholder="Nhập tên đề thi..."
                  class="form-input"
                  :disabled="viewOnly"
                  :class="{ 'disabled': viewOnly }"
                />
              </div>
              <div class="form-group">
                <label>Loại đề thi *</label>
                <select v-model="formData.testTypeId" required class="form-select" :disabled="viewOnly" :class="{ 'disabled': viewOnly }">
                  <option value="">Chọn loại đề thi</option>
                  <option :value="type.id" v-for="type in testTypes" :key="type.id">
                    {{ type.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Thời gian (phút) *</label>
                <input 
                  type="number" 
                  v-model="formData.durationMinutes" 
                  required 
                  min="1" 
                  placeholder="60"
                  class="form-input"
                  :disabled="viewOnly"
                  :class="{ 'disabled': viewOnly }"
                />
              </div>
            </div>

          </div>

          <!-- Audio File Section -->
          <div v-if="shouldShowListeningSection" class="form-section">
            <h4 class="section-title">File âm thanh</h4>

            <!-- Display current audio if exists -->
            <div v-if="currentAudioPath" class="audio-preview current-audio">
              <p><strong>{{ viewOnly ? 'File âm thanh:' : 'File hiện tại:' }}</strong></p>
              <audio controls :src="currentAudioPath" class="audio-player"></audio>
              <div class="audio-actions" v-if="!viewOnly">
                <button type="button" class="btn danger small" @click="removeCurrentAudio">
                  Xóa file hiện tại
                </button>
              </div>
            </div>

            <!-- File Upload Input -->
            <div v-if="!viewOnly" class="form-group">
              <label>{{ currentAudioPath ? 'Thay thế bằng file mới:' : 'Tải file âm thanh:' }}</label>
              <input
                type="file"
                accept="audio/*"
                @change="handleAudioUpload"
                class="form-input"
                ref="audioFileInput"
              />
              <small v-if="uploadStatus" :class="uploadError ? 'error-text' : 'success-text'">
                {{ uploadStatus }}
              </small>
            </div>

            <!-- New Audio File Preview -->
            <div v-if="selectedAudioFile && !viewOnly" class="audio-preview new-audio">
              <p><strong>File mới được chọn:</strong></p>
              <audio v-if="audioPreviewUrl" controls :src="audioPreviewUrl" class="audio-player"></audio>
              <div class="audio-info">
                <i class="fa-solid fa-file-audio"></i>
                <span>{{ selectedFileName }}</span>
                <small class="file-note">File sẽ được tải lên khi bấm "Cập nhật đề thi"</small>
              </div>
              <div class="audio-actions">
                <button type="button" class="btn secondary small" @click="clearSelectedAudio">
                  Hủy chọn file
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>Mô tả</label>
              <textarea 
                v-model="formData.description" 
                placeholder="Mô tả chi tiết về đề thi..."
                rows="3"
                class="form-textarea"
                :disabled="viewOnly"
                :class="{ 'disabled': viewOnly }"
              ></textarea>
            </div>
          </div>

          <!-- Reading Section -->
          <div v-if="shouldShowReadingSection" class="form-section">
            <div class="section-header">
              <h4 class="section-title">
                <i class="fa-solid fa-file-text"></i>
                Đoạn văn Reading
              </h4>
              <button v-if="!viewOnly" type="button" class="btn-add" @click="addPassage">
                <i class="fa-solid fa-plus"></i>
                Thêm đoạn văn
              </button>
            </div>

            <div v-if="formData.passages.length === 0" class="empty-state">
              <p>Chưa có đoạn văn nào.</p>
            </div>

            <div v-for="(passage, pIndex) in formData.passages" :key="'passage-' + pIndex" class="passage-item">
              <div class="item-header">
                <h5>
                  <i class="fa-solid fa-file-text"></i>
                  Đoạn văn {{ pIndex + 1 }}
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
                    placeholder="Tiêu đề của đoạn văn..."
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
                <label>Nội dung đoạn văn</label>
                <textarea 
                  v-model="passage.content" 
                  placeholder="Nội dung đoạn văn..."
                  rows="4"
                  required
                  class="form-textarea"
                ></textarea>
              </div>

              <!-- Questions for this passage -->
              <div class="questions-subsection">
                <div class="subsection-header">
                  <h6>
                    Câu hỏi ({{ passage.questions.length }})
                  </h6>
                  <button type="button" class="btn-add small" @click="addQuestionToPassage(pIndex)">
                    <i class="fa-solid fa-plus"></i>
                    Thêm câu hỏi
                  </button>
                </div>

                <div v-if="passage.questions.length === 0" class="empty-state small">
                  <p>Chưa có câu hỏi nào</p>
                </div>

                <div v-for="(question, qIndex) in passage.questions" :key="'passage-question-' + qIndex" class="question-item">
                  <QuestionForm 
                    :question="question"
                    :question-number="qIndex + 1"
                    :show-id="true"
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

          <!-- Listening Section -->
          <div v-if="shouldShowListeningSection" class="form-section">
            <div class="section-header">
              <h4 class="section-title">
                <i class="fa-solid fa-headphones"></i>
                Listening Parts
              </h4>
              <button v-if="!viewOnly" type="button" class="btn-add" @click="addListeningPart">
                <i class="fa-solid fa-plus"></i>
                Thêm Part
              </button>
            </div>

            <div v-if="formData.listeningParts.length === 0" class="empty-state">
              <p>Chưa có Listening Part nào.</p>
            </div>

            <div v-for="(part, partIndex) in formData.listeningParts" :key="'part-' + partIndex" class="listening-part-item">
              <div class="item-header">
                <h5>
                  Part {{ partIndex + 1 }}
                  <!-- <span v-if="part.id" class="id-badge">ID: {{ part.id }}</span> -->
                </h5>
                <button type="button" class="btn-remove" @click="removeListeningPart(partIndex)">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Số Part</label>
                  <input 
                    type="number" 
                    v-model="part.partNumber" 
                    min="1"
                    class="form-input"
                  />
                </div>
                <div class="form-group">
                  <label>Tiêu đề Part</label>
                  <input 
                    type="text" 
                    v-model="part.title" 
                    placeholder="Tiêu đề của Part..."
                    class="form-input"
                  />
                </div>
              </div>

              <!-- Question Groups -->
              <div class="question-groups-subsection">
                <div class="subsection-header">
                  <h6>
                    Nhóm câu hỏi ({{ part.questionGroups.length }})
                  </h6>
                  <button type="button" class="btn-add small" @click="addQuestionGroup(partIndex)">
                    <i class="fa-solid fa-plus"></i>
                    Thêm nhóm
                  </button>
                </div>

                <div v-if="part.questionGroups.length === 0" class="empty-state small">
                  <i class="fa-solid fa-layer-group"></i>
                  <p>Chưa có nhóm câu hỏi nào</p>
                </div>

                <div v-for="(group, groupIndex) in part.questionGroups" :key="'group-' + groupIndex" class="question-group-item">
                  <div class="group-header">
                    <h6>
                      <i class="fa-solid fa-folder"></i>
                      Nhóm {{ groupIndex + 1 }}
                      <!-- <span v-if="group.id" class="id-badge">ID: {{ group.id }}</span> -->
                    </h6>
                    <button type="button" class="btn-remove small" @click="removeQuestionGroup(partIndex, groupIndex)">
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label>Hướng dẫn</label>
                      <textarea 
                        v-model="group.instructionText" 
                        placeholder="Hướng dẫn cho nhóm câu hỏi này..."
                        rows="2"
                        class="form-textarea"
                      ></textarea>
                    </div>
                    <div class="form-group">
                      <label>Thứ tự hiển thị</label>
                      <input 
                        type="number" 
                        v-model="group.displayOrder" 
                        min="1"
                        class="form-input"
                      />
                    </div>
                  </div>

                  <!-- Questions in group -->
                  <div class="questions-subsection">
                    <div class="subsection-header">
                      <h6>
                        <i class="fa-solid fa-question-circle"></i>
                        Câu hỏi ({{ group.questions.length }})
                      </h6>
                      <button type="button" class="btn-add small" @click="addQuestionToGroup(partIndex, groupIndex)">
                        <i class="fa-solid fa-plus"></i>
                        Thêm câu hỏi
                      </button>
                    </div>

                    <div v-if="group.questions.length === 0" class="empty-state small">
                      <i class="fa-solid fa-question-circle"></i>
                      <p>Chưa có câu hỏi nào</p>
                    </div>

                    <div v-for="(question, qIndex) in group.questions" :key="'group-question-' + qIndex" class="question-item">
                      <QuestionForm 
                        :question="question"
                        :question-number="qIndex + 1"
                        :show-id="true"
                        @update="updateGroupQuestion(partIndex, groupIndex, qIndex, $event)"
                        @remove="removeGroupQuestion(partIndex, groupIndex, qIndex)"
                      />
                    </div>

                    <!-- Bottom Add Question Button -->
                    <div v-if="group.questions.length > 0" class="bottom-add-button">
                      <button type="button" class="btn-add" @click="addQuestionToGroup(partIndex, groupIndex)">
                        <i class="fa-solid fa-plus"></i>
                        Thêm câu hỏi
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn secondary" @click="$emit('close')">
          {{ viewOnly ? 'Đóng' : 'Hủy bỏ' }}
        </button>
        <button v-if="!viewOnly" type="button" class="btn primary" @click="handleSubmit" :disabled="isSaving || isLoading || isUploading">
          {{ isSaving ? 'Đang cập nhật...' : (isUploading ? 'Đang tải file âm thanh...' : 'Cập nhật đề thi') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import QuestionForm from './QuestionFormNew.vue'
import { TestDataHelpers, TestAdminAPI } from '@/services/TestAdminAPI.js'
import { useNotification } from '@/composables/useNotification'

const { error: showError } = useNotification()

const props = defineProps({
  testTypes: {
    type: Array,
    default: () => []
  },
  isSaving: {
    type: Boolean,
    default: false
  },
  testId: {
    type: [Number, String],
    required: true
  },
  viewOnly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'save'])

// State
const isLoading = ref(false)
const formData = ref(TestDataHelpers.createEmptyTest())

// Audio handling state
const audioFileInput = ref(null) // Ref for file input
const currentAudioPath = ref(null) // Store the path of the existing audio
const oldAudioFileIdToDelete = ref(null) // Store ID of audio to delete AFTER saving
const isUploading = ref(false)
const uploadStatus = ref('')
const uploadError = ref(false)
// New states for deferred upload
const selectedAudioFile = ref(null) // Store selected file temporarily
const audioPreviewUrl = ref('') // For new audio preview
const selectedFileName = ref('') // Store selected file name for display
const isTOEIC = computed(() => {
  // Giả sử ID 3 là TOEIC. Cần đảm bảo ID này khớp với DB của bạn
  return formData.value.testTypeId === 3; 
});

const hasPassages = computed(() => {
  return formData.value.passages && formData.value.passages.length > 0;
});

const hasListeningData = computed(() => {
  return (formData.value.listeningParts && formData.value.listeningParts.length > 0) || 
         !!formData.value.audioFileId || 
         !!formData.value.audioFilePath ||
         !!currentAudioPath.value;
});

// Logic hiển thị phần Reading
const shouldShowReadingSection = computed(() => {
  // Nếu là TOEIC thì luôn hiện
  if (isTOEIC.value) return true;
  // Nếu có dữ liệu Passages thì chắc chắn là đề Reading
  if (hasPassages.value) return true;
  // Nếu KHÔNG có dữ liệu Listening và cũng KHÔNG phải TOEIC -> Mặc định hiện Reading (cho trường hợp đề mới tạo hoặc lỗi)
  if (!hasListeningData.value && !isTOEIC.value) return true;
  return false;
});

// Logic hiển thị phần Listening và Audio
const shouldShowListeningSection = computed(() => {
  if (isTOEIC.value) return true;
  if (hasListeningData.value) return true;
  return false;
});

// Load test data
const loadTestData = async () => {
  if (!props.testId) return
  
  isLoading.value = true
  try {
    // API now returns AudioFilePath
    const testData = await TestAdminAPI.getTestById(props.testId)
    formData.value = { ...testData }
    currentAudioPath.value = testData.audioFilePath || null // Store current audio path
    oldAudioFileIdToDelete.value = null // Reset deletion flag on load
  } catch (error) {
    console.error('Error loading test data:', error)
    showError('Không thể tải dữ liệu đề thi', 'Lỗi tải dữ liệu')
    emit('close')
  } finally {
    isLoading.value = false
  }
}

// Utility function
const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

// Audio handling methods
const handleAudioUpload = (event) => {
  const file = event.target.files[0]
  if (!file) {
    // If user cancels, clear selected file
    clearSelectedAudio()
    return
  }

  // Store the ID of the file we are about to replace (if any)
  if (formData.value.audioFileId && !oldAudioFileIdToDelete.value) {
    oldAudioFileIdToDelete.value = formData.value.audioFileId
  }

  // Store file temporarily for later upload
  selectedAudioFile.value = file
  selectedFileName.value = file.name
  
  // Clean up previous preview URL to avoid memory leaks
  if (audioPreviewUrl.value) {
    URL.revokeObjectURL(audioPreviewUrl.value)
  }
  
  // Create preview URL for audio player
  audioPreviewUrl.value = URL.createObjectURL(file)
  
  uploadStatus.value = `Đã chọn file: ${file.name} (sẽ được tải lên khi lưu)`
  uploadError.value = false
  
  console.log('Audio file selected:', file.name)
}

const clearSelectedAudio = () => {
  selectedAudioFile.value = null
  selectedFileName.value = ''
  
  // Clean up preview URL to avoid memory leaks
  if (audioPreviewUrl.value) {
    URL.revokeObjectURL(audioPreviewUrl.value)
    audioPreviewUrl.value = ''
  }
  
  // Clear the file input visually
  if (audioFileInput.value) {
    audioFileInput.value.value = ''
  }
  
  uploadStatus.value = ''
  uploadError.value = false
}

const removeCurrentAudio = () => {
  if (confirm('Bạn có chắc chắn muốn xóa file âm thanh hiện tại không?')) {
    // Store the ID of the file to delete after saving
    if (formData.value.audioFileId && !oldAudioFileIdToDelete.value) {
      oldAudioFileIdToDelete.value = formData.value.audioFileId
    }
    
    // Clear current audio display
    currentAudioPath.value = null
    formData.value.audioFileId = null
    formData.value.audioFilePath = null
    
    uploadStatus.value = 'File âm thanh sẽ được xóa khi lưu đề thi'
    uploadError.value = false
  }
}

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

// Listening part management
const addListeningPart = () => {
  const newPart = TestDataHelpers.createEmptyListeningPart(formData.value.listeningParts.length + 1)
  formData.value.listeningParts.push(newPart)
}

const removeListeningPart = (index) => {
  if (confirm('Bạn có chắc chắn muốn xóa Listening Part này không?')) {
    formData.value.listeningParts.splice(index, 1)
    // Update part numbers
    formData.value.listeningParts.forEach((part, i) => {
      part.partNumber = i + 1
    })
  }
}

const addQuestionGroup = (partIndex) => {
  const part = formData.value.listeningParts[partIndex]
  const newGroup = TestDataHelpers.createEmptyQuestionGroup(part.questionGroups.length + 1)
  part.questionGroups.push(newGroup)
}

const removeQuestionGroup = (partIndex, groupIndex) => {
  if (confirm('Bạn có chắc chắn muốn xóa nhóm câu hỏi này không?')) {
    formData.value.listeningParts[partIndex].questionGroups.splice(groupIndex, 1)
    // Update display orders
    formData.value.listeningParts[partIndex].questionGroups.forEach((group, i) => {
      group.displayOrder = i + 1
    })
  }
}

const addQuestionToGroup = (partIndex, groupIndex) => {
  const group = formData.value.listeningParts[partIndex].questionGroups[groupIndex]
  const questionNumber = group.questions.length + 1
  const newQuestion = TestDataHelpers.createEmptyQuestion(questionNumber)
  group.questions.push(newQuestion)
}

const removeGroupQuestion = (partIndex, groupIndex, questionIndex) => {
  if (confirm('Bạn có chắc chắn muốn xóa câu hỏi này không?')) {
    formData.value.listeningParts[partIndex].questionGroups[groupIndex].questions.splice(questionIndex, 1)
    // Update question numbers
    formData.value.listeningParts[partIndex].questionGroups[groupIndex].questions.forEach((question, i) => {
      question.questionNumber = i + 1
    })
  }
}

const updateGroupQuestion = (partIndex, groupIndex, questionIndex, questionData) => {
  formData.value.listeningParts[partIndex].questionGroups[groupIndex].questions[questionIndex] = questionData
}

const handleSubmit = async () => {
  // Add validation checks here if needed

  // If there's a new audio file selected, upload it first
  if (selectedAudioFile.value) {
    uploadStatus.value = `Đang tải lên ${selectedFileName.value}...`
    uploadError.value = false
    isUploading.value = true

    try {
      const result = await TestAdminAPI.uploadAudioFile(selectedAudioFile.value)
      if (result && result.audioFileId) {
        formData.value.audioFileId = result.audioFileId // Update formData with NEW ID
        uploadStatus.value = `Tải lên thành công: ${selectedFileName.value} (ID: ${result.audioFileId})`
        uploadError.value = false
        
        // Clear selected file state since it's now uploaded
        clearSelectedAudio()
      } else {
        throw new Error('API did not return a valid audioFileId.')
      }
    } catch (error) {
      console.error('Audio upload failed:', error)
      uploadStatus.value = `Lỗi tải lên: ${error.message || 'Không thể tải file lên.'}`
      uploadError.value = true
      isUploading.value = false
      return // Don't proceed with saving if upload failed
    } finally {
      isUploading.value = false
    }
  }

  // Emit 'save', passing the formData and the oldAudioFileIdToDelete
  emit('save', {
    testData: formData.value,
    oldAudioId: oldAudioFileIdToDelete.value // Pass the ID to delete
  })
}

// Watch for testId changes
watch(() => props.testId, (newTestId) => {
  if (newTestId) {
    loadTestData()
  }
}, { immediate: true })

onMounted(() => {
  if (props.testId) {
    loadTestData()
  }
})

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
<style src="../TestManagement.css" scoped></style>
<style scoped>
/* Component-specific styles */

.id-badge {
  background: rgba(255, 255, 255, 0.2);
  color: #6b7280;
  padding: 0.125rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: normal;
  margin-left: 0.5rem;
}

.form-input.disabled {
  background: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
}

.passage-item,
.listening-part-item {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border: 1px solid #e2e8f0;
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

.group-header h6 {
  margin: 0;
  color: #4a5568;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.questions-subsection,
.question-groups-subsection {
  margin-top: 1rem;
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

/* View-only mode styles */
.view-only-mode .btn-add,
.view-only-mode .btn-remove,
.view-only-mode .btn-remove-option {
  display: none !important;
}

.view-only-mode .form-input:disabled,
.view-only-mode .form-select:disabled,
.view-only-mode .form-textarea:disabled {
  background-color: #f7fafc;
  cursor: not-allowed;
  opacity: 0.7;
}

.view-only-mode .question-form {
  pointer-events: none;
}

/* Section disabled styles */
.section-disabled {
  background: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  color: #6c757d;
}

.section-disabled p {
  margin: 0;
  font-style: italic;
}

.section-disabled i {
  margin-right: 0.5rem;
  color: #007bff;
}

/* Audio preview styles */
.current-audio {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 0.5rem;
}

.current-audio p { 
  margin: 0 0 0.5rem 0; 
  color: #0369a1; 
}

.current-audio .audio-player { 
  margin-bottom: 0.5rem;
  width: 100%;
}

.new-audio {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 0.5rem;
}

.new-audio p {
  margin: 0 0 0.5rem 0;
  color: #15803d;
}

.new-audio .audio-player {
  margin-bottom: 0.5rem;
  width: 100%;
}

.audio-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.file-note {
  display: block;
  color: #6b7280;
  font-style: italic;
  margin-top: 0.25rem;
}

.audio-actions {
  display: flex;
  gap: 0.5rem;
}

.error-text {
  color: #dc2626;
  font-size: 0.875rem;
}

.success-text {
  color: #16a34a;
  font-size: 0.875rem;
}

/* Loading state styles */
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  min-height: 200px;
}

.loading-spinner {
  text-align: center;
  color: #6b7280;
}

.loading-spinner p {
  margin: 0;
  font-size: 1rem;
}
</style>