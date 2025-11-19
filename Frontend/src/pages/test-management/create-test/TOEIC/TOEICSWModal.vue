<template>
  <div class="modal-overlay" @click="!isPageMode && $emit('close')">
    <div class="modal-content large" @click.stop>
      <div class="modal-header purple">
        <h3>
          Tạo đề thi TOEIC Speaking & Writing
        </h3>
        <button v-if="!isPageMode" class="close-btn" @click="$emit('close')">
          <i class="fa-solid fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="handleSubmit" class="test-form">
          <div class="form-section">
            <h4 class="section-title">Thông tin cơ bản</h4>
            <div class="form-row">
              <div class="form-group">
                <label>Tên đề thi *</label>
                <input type="text" v-model="formData.title" required placeholder="VD: TOEIC SW Test 1" class="form-input" />
              </div>
              <div class="form-group">
                <label>Thời gian tổng (phút) *</label>
                <input type="number" v-model="formData.durationMinutes" required min="1" placeholder="80" class="form-input" />
              </div>
            </div>
            <div class="form-group">
              <label>Mô tả</label>
              <textarea v-model="formData.description" rows="3" class="form-textarea"></textarea>
            </div>
          </div>

          <div class="form-section">
            <div class="section-header">
              <h4 class="section-title">
                Speaking Section ({{ speakingQuestions.length }} câu hỏi)
              </h4>
              <button type="button" class="btn-add" @click="addSpeakingQuestion">
                <i class="fa-solid fa-plus"></i> Thêm câu hỏi
              </button>
            </div>
            
            <div class="form-group">
              <label>Hướng dẫn chung cho Speaking</label>
              <textarea v-model="formData.speakingInstructions" placeholder="Hướng dẫn chung..." rows="3" class="form-textarea"></textarea>
            </div>

            <div v-if="speakingQuestions.length === 0" class="empty-state">
              <p>Chưa có câu hỏi Speaking nào.</p>
            </div>

            <div v-for="(question, index) in speakingQuestions" :key="'speaking-' + index" class="sw-item">
               <div class="item-header">
                 <h5>Question {{ index + 1 }}</h5>
                 <button type="button" class="btn-remove" @click="removeSpeakingQuestion(index)"><i class="fa-solid fa-trash-can"></i></button>
               </div>
               
               <div class="form-row">
                 <div class="form-group">
                   <label>Loại câu hỏi (Part Name)</label>
                   <select v-model="question.partName" class="form-select">
                     <option value="Read a text aloud">Read a text aloud</option>
                     <option value="Describe a picture">Describe a picture</option>
                     <option value="Respond to questions">Respond to questions</option>
                     <option value="Respond to questions using information provided">Respond using info</option>
                     <option value="Propose a solution">Propose a solution</option>
                     <option value="Express an opinion">Express an opinion</option>
                   </select>
                 </div>
                 <div class="form-group">
                   <label>Thứ tự</label>
                   <input type="number" v-model="question.displayOrder" class="form-input" />
                 </div>
               </div>

               <div class="form-row">
                 <div class="form-group">
                   <label>Thời gian chuẩn bị (giây)</label>
                   <input type="number" v-model="question.preparationTime" class="form-input" placeholder="45" />
                 </div>
                 <div class="form-group">
                   <label>Thời gian trả lời (giây)</label>
                   <input type="number" v-model="question.responseTime" class="form-input" placeholder="45" />
                 </div>
               </div>

               <div class="form-group">
                 <label>Nội dung câu hỏi / Văn bản cần đọc *</label>
                 <textarea v-model="question.questionText" required rows="4" class="form-textarea" placeholder="Nhập nội dung câu hỏi..."></textarea>
               </div>
            </div>
          </div>

          <div class="form-section">
            <div class="section-header">
              <h4 class="section-title">
                Writing Section ({{ writingTasks.length }} tasks)
              </h4>
              <button type="button" class="btn-add" @click="addWritingTask">
                <i class="fa-solid fa-plus"></i> Thêm Task
              </button>
            </div>

            <div class="form-group">
              <label>Hướng dẫn chung cho Writing</label>
              <textarea v-model="formData.writingInstructions" placeholder="Hướng dẫn chung..." rows="3" class="form-textarea"></textarea>
            </div>

            <div v-if="writingTasks.length === 0" class="empty-state">
              <p>Chưa có Writing Task nào.</p>
            </div>

            <div v-for="(task, index) in writingTasks" :key="'writing-' + index" class="sw-item">
               <div class="item-header">
                 <h5>Task {{ index + 1 }}</h5>
                 <button type="button" class="btn-remove" @click="removeWritingTask(index)"><i class="fa-solid fa-trash-can"></i></button>
               </div>

               <div class="form-row">
                 <div class="form-group">
                   <label>Loại Task</label>
                   <select v-model="task.taskType" class="form-select">
                     <option value="Write a sentence based on a picture">Write sentence based on picture</option>
                     <option value="Respond to a written request">Respond to written request</option>
                     <option value="Write an opinion essay">Write an opinion essay</option>
                   </select>
                 </div>
                 <div class="form-group">
                   <label>Thứ tự</label>
                   <input type="number" v-model="task.displayOrder" class="form-input" />
                 </div>
               </div>

               <div class="form-row">
                 <div class="form-group">
                   <label>Thời gian gợi ý (phút)</label>
                   <input type="number" v-model="task.durationMinutes" class="form-input" placeholder="10" />
                 </div>
                 <div class="form-group">
                   <label>Số từ tối thiểu</label>
                   <input type="number" v-model="task.minWords" class="form-input" placeholder="0" />
                 </div>
                 <div class="form-group">
                   <label>Điểm tối đa</label>
                   <input type="number" v-model="task.maxScore" class="form-input" placeholder="5" />
                 </div>
               </div>

               <div class="form-group">
                 <label>Đề bài (Prompt) *</label>
                 <textarea v-model="task.prompt" required rows="5" class="form-textarea" placeholder="Nhập đề bài..."></textarea>
               </div>
            </div>
          </div>

        </form>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn secondary" @click="$emit('close')">Hủy bỏ</button>
        <button type="button" class="btn primary" @click="handleSubmit" :disabled="isSaving">
          {{ isSaving ? 'Đang tạo...' : 'Tạo đề thi TOEIC SW' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  testTypeId: { type: Number, required: true },
  isSaving: { type: Boolean, default: false },
  isPageMode: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'save'])

const formData = ref({
  title: '',
  description: '',
  durationMinutes: 80,
  testTypeId: props.testTypeId,
  speakingInstructions: '',
  writingInstructions: '',
})

// --- Dữ liệu cho danh sách động ---
const speakingQuestions = ref([]);
const writingTasks = ref([]);

// --- Helper Methods tạo object rỗng ---
const createEmptySpeakingQuestion = (index) => ({
  questionText: '',
  partName: 'Read a text aloud',
  preparationTime: 45,
  responseTime: 45,
  displayOrder: index + 1
});

const createEmptyWritingTask = (index) => ({
  taskType: 'Write a sentence based on a picture',
  prompt: '',
  minWords: 0,
  maxScore: 3,
  durationMinutes: 8,
  displayOrder: index + 1
});

// --- Add/Remove Methods ---
const addSpeakingQuestion = () => {
  speakingQuestions.value.push(createEmptySpeakingQuestion(speakingQuestions.value.length));
};

const removeSpeakingQuestion = (index) => {
  speakingQuestions.value.splice(index, 1);
};

const addWritingTask = () => {
  writingTasks.value.push(createEmptyWritingTask(writingTasks.value.length));
};

const removeWritingTask = (index) => {
  writingTasks.value.splice(index, 1);
};

// --- Handle Submit ---
const handleSubmit = () => {
  // Validate basic info
  if (!formData.value.title.trim()) {
    alert('Vui lòng nhập tên đề thi'); return;
  }
  if (speakingQuestions.value.length === 0 && writingTasks.value.length === 0) {
    alert('Vui lòng thêm ít nhất một câu hỏi Speaking hoặc Writing'); return;
  }

  // Chuẩn bị dữ liệu gửi đi (Mapping trực tiếp với Backend DTO)
  const submitData = {
    ...formData.value,
    // Gán trực tiếp danh sách vào DTO (tên property phải khớp với Backend DTO)
    speakingQuestions: speakingQuestions.value,
    writingTasks: writingTasks.value
  };

  emit('save', submitData);
}
</script>

<style src="@/assets/modal.css"></style>
<style src="@/assets/form.css"></style>  
<style src="@/assets/buttons.css"></style>
<style src="../../TestManagement.css" scoped></style>
<style scoped>
/* Component-specific styles */
.modal-content.large {
  max-width: 900px;
  width: 90%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.btn-add {
  background: #10b981;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-add:hover {
  background: #059669;
  transform: translateY(-1px);
}

.btn-remove {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.375rem 0.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-remove:hover {
  background: #dc2626;
}

.sw-item {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.item-header h5 {
  margin: 0;
  font-weight: 600;
  color: #334155;
  font-size: 1.1rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  background: #f9fafb;
  border-radius: 0.5rem;
  border: 2px dashed #d1d5db;
  margin: 1rem 0;
}

.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>