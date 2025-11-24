<template>
  <div class="modal-overlay" @click="!isPageMode && $emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header info">
        <h3>
          Tạo đề thi {{ testType }} - Writing
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
                  placeholder="VD: IELTS Academic Writing Test 1"
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
                placeholder="Mô tả chi tiết về đề thi Writing..."
                rows="3"
                class="form-textarea"
              ></textarea>
            </div>
          </div>

          <!-- Writing Tasks Section -->
          <div class="form-section">
            <div class="section-header">
              <h4 class="section-title">
                Writing Tasks ({{ writingTasks.length }})
              </h4>
              <button type="button" class="btn-add" @click="addWritingTask">
                <i class="fa-solid fa-plus"></i>
                Thêm Task
              </button>
            </div>

            <div v-if="writingTasks.length === 0" class="empty-state">
              <p>Chưa có Writing Task nào. Hãy thêm Task đầu tiên.</p>
            </div>

            <div v-for="(task, taskIndex) in writingTasks" :key="'task-' + taskIndex" class="writing-task-item">
              <div class="item-header">
                <h5>
                  <i class="fa-solid fa-edit"></i>
                  Task {{ taskIndex + 1 }}
                  <!-- <span class="task-info">({{ task.taskType }})</span> -->
                </h5>
                <button type="button" class="btn-remove" @click="removeWritingTask(taskIndex)">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Loại Task *</label>
                  <select v-model="task.taskType" required class="form-select">
                    <option value="">Chọn loại Task</option>
                    <option value="Task 1">Task 1 (Report/Letter)</option>
                    <option value="Task 2">Task 2 (Essay)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Số từ tối thiểu</label>
                  <input 
                    type="number" 
                    v-model="task.minWords" 
                    min="0"
                    placeholder="150"
                    class="form-input"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Thời gian đề xuất (phút)</label>
                  <input 
                    type="number" 
                    v-model="task.suggestedTime" 
                    min="0"
                    placeholder="20"
                    class="form-input"
                  />
                </div>
                <div class="form-group">
                  <label>Điểm số</label>
                  <input 
                    type="number" 
                    v-model="task.maxScore" 
                    min="0" 
                    step="0.5"
                    placeholder="9.0"
                    class="form-input"
                  />
                </div>
              </div>

              <div class="form-group">
                <label>Đề bài *</label>
                <textarea 
                  v-model="task.prompt" 
                  placeholder="Nhập đề bài Writing Task..."
                  rows="6"
                  required
                  class="form-textarea"
                ></textarea>
                <div class="word-count">
                  Số từ đề bài: {{ getWordCount(task.prompt) }}
                </div>
              </div>

              <!-- Task 1 specific fields -->
              <div v-if="task.taskType === 'Task 1'" class="task-specific">
                <h6 class="sub-title">
                  <i class="fa-solid fa-chart-bar"></i>
                  Thông tin bổ sung cho Task 1
                </h6>
                
                <div class="form-group">
                  <label>Loại biểu đồ/tài liệu</label>
                  <select v-model="task.chartType" class="form-select">
                    <option value="">Chọn loại</option>
                    <option value="Bar Chart">Bar Chart</option>
                    <option value="Line Graph">Line Graph</option>
                    <option value="Pie Chart">Pie Chart</option>
                    <option value="Table">Table</option>
                    <option value="Process Diagram">Process Diagram</option>
                    <option value="Map">Map</option>
                    <option value="Letter">Letter</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Hình ảnh/Biểu đồ</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    @change="handleImageUpload(taskIndex, $event)"
                    class="form-input"
                  />
                  <div v-if="task.imagePreview" class="image-preview">
                    <img :src="task.imagePreview" alt="Task image" class="preview-image">
                    <button type="button" class="btn-remove-image" @click="removeImage(taskIndex)">
                      <i class="fa-solid fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Task 2 specific fields -->
              <div v-if="task.taskType === 'Task 2'" class="task-specific">
                <h6 class="sub-title">
                  <i class="fa-solid fa-lightbulb"></i>
                  Thông tin bổ sung cho Task 2
                </h6>
                
                <div class="form-group">
                  <label>Loại Essay</label>
                  <select v-model="task.essayType" class="form-select">
                    <option value="">Chọn loại</option>
                    <option value="Opinion">Opinion Essay</option>
                    <option value="Discussion">Discussion Essay</option>
                    <option value="Problem Solution">Problem Solution</option>
                    <option value="Advantages Disadvantages">Advantages & Disadvantages</option>
                    <option value="Direct Questions">Direct Questions</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Từ khóa chính</label>
                  <input 
                    type="text" 
                    v-model="task.keywords" 
                    placeholder="VD: education, technology, environment"
                    class="form-input"
                  />
                </div>
              </div>

              <!-- Scoring Criteria -->
              <div class="scoring-section">
                <h6 class="sub-title">
                  <i class="fa-solid fa-star"></i>
                  Tiêu chí chấm điểm
                </h6>
                
                <div class="form-group">
                  <label>Hướng dẫn chấm điểm</label>
                  <textarea 
                    v-model="task.scoringGuidelines" 
                    placeholder="Nhập hướng dẫn chi tiết về cách chấm điểm..."
                    rows="4"
                    class="form-textarea"
                  ></textarea>
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
          <i v-if="isSaving"></i>
          <i v-else ></i>
          {{ isSaving ? 'Đang tạo...' : 'Tạo đề thi Writing' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

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

// Writing tasks
const writingTasks = ref([])

// Create empty writing task
const createEmptyTask = () => ({
  taskType: '',
  prompt: '',
  minWords: 150,
  suggestedTime: 20,
  maxScore: 9.0,
  chartType: '',
  essayType: '',
  keywords: '',
  scoringGuidelines: '',
  imageFile: null,
  imagePreview: ''
})

// Task management
const addWritingTask = () => {
  writingTasks.value.push(createEmptyTask())
}

const removeWritingTask = (index) => {
  if (confirm('Bạn có chắc chắn muốn xóa Writing Task này không?')) {
    writingTasks.value.splice(index, 1)
  }
}

// Image handling
const handleImageUpload = (taskIndex, event) => {
  const file = event.target.files[0]
  if (file) {
    const task = writingTasks.value[taskIndex]
    task.imageFile = file
    task.imagePreview = URL.createObjectURL(file)
  }
}

const removeImage = (taskIndex) => {
  const task = writingTasks.value[taskIndex]
  task.imageFile = null
  task.imagePreview = ''
  
  // Clear the file input
  const fileInputs = document.querySelectorAll('input[type="file"]')
  if (fileInputs[taskIndex + 1]) fileInputs[taskIndex + 1].value = ''
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

  if (writingTasks.value.length === 0) {
    alert('Vui lòng thêm ít nhất 1 Writing Task')
    return
  }

  // Check if all tasks have required fields
  for (let i = 0; i < writingTasks.value.length; i++) {
    const task = writingTasks.value[i]
    if (!task.taskType) {
      alert(`Vui lòng chọn loại Task cho Task ${i + 1}`)
      return
    }
    if (!task.prompt.trim()) {
      alert(`Vui lòng nhập đề bài cho Task ${i + 1}`)
      return
    }
  }

  // Prepare data for submission
  const submitData = {
    ...formData.value,
    writingTasks: writingTasks.value.map(task => ({
      ...task,
      // Remove preview URL and keep only the file reference
      imagePreview: undefined
    }))
  }

  emit('save', submitData)
}
</script>

<style src="@/assets/modal.css"></style>
<style src="@/assets/form.css"></style>
<style src="@/assets/buttons.css"></style>
<style src="../../TestManagement.css" scoped></style>
<style scoped>
/* Component-specific styles */
.writing-task-item {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border: 1px solid #e2e8f0;
}

.task-info {
  background: #e2e8f0;
  color: #6b7280;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: normal;
}

.task-specific,
.scoring-section {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.sub-title {
  margin: 0 0 1rem 0;
  color: #4a5568;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.image-preview {
  position: relative;
  margin-top: 0.5rem;
  display: inline-block;
}

.preview-image {
  max-width: 300px;
  max-height: 200px;
  border-radius: 0.375rem;
  border: 1px solid #e2e8f0;
}

.btn-remove-image {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: #f56565;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
}

.word-count {
  text-align: right;
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.5rem;
}
</style>