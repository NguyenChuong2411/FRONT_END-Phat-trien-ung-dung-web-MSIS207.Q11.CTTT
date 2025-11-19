<template>
  <div v-if="isOpen" class="test-detail-modal-overlay" @click="handleOverlayClick">
    <div class="test-detail-modal" @click.stop>
      <!-- Modal Header -->
      <div class="test-detail-header">
        <div class="header-content">
          <h2 class="test-title">{{ testData.title }}</h2>
          <button class="close-btn" @click="closeModal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <!-- Test Type Badges -->
        <div class="test-badges">
          <span class="badge badge-primary">{{ testData.type }}</span>
          <span v-if="skillName" class="badge badge-secondary">{{ skillName }}</span>
        </div>

        <!-- Test Info -->
        <div class="test-info">
          <div class="info-item">
            <span class="info-label">Thời gian làm bài:</span>
            <span class="info-value">{{ testData.duration }} | {{ partCount }} phần thi | {{ testData.questions }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Số người đã luyện tập đề thi này:</span>
            <span class="info-value">{{ testData.attempts }}</span>
          </div>
        </div>

        <!-- Warning Note -->
        <div class="warning-note">
          <p>
            <strong>Chú ý:</strong> để được quy đổi sang scaled score (ví dụ trên thang điểm 990 cho TOEIC hoặc 9.0 cho IELTS), 
            vui lòng chọn chế độ làm FULL TEST.
          </p>
        </div>
      </div>

      <!-- Modal Body -->
      <div class="modal-body">
        <!-- Navigation Tabs -->
        <div class="nav-tabs">
          <button 
            v-for="tab in tabs" 
            :key="tab.value"
            class="nav-tab"
            :class="{ active: activeTab === tab.value }"
            @click="activeTab = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Luyện tập Tab -->
          <div v-if="activeTab === 'practice'" class="tab-panel">
            <div class="practice-info">
              <div class="info-box">
                <h4>Pro tips: Hình thức luyện tập từng phần và chọn mức thời gian phù hợp sẽ giúp bạn tập trung vào giải quyết các câu hỏi thay vì phải chịu áp lực hoàn thành bài thi.</h4>
              </div>
              
              <div class="practice-options" v-if="testSections.length > 0">
                <!-- MultiSelect for Test Sections -->
                <MultiSelect
                  v-model="selectedSections"
                  :options="testSections"
                  :label="`Chọn ${skillName === 'Listening' ? 'part' : 'phần'} thi bạn muốn làm`"
                  :placeholder="`Chọn các ${skillName === 'Listening' ? 'part' : 'phần'} thi...`"
                  item-key="id"
                  item-label="name"
                  :searchable="false"
                  :show-select-all="true"
                  :select-all-text="`Chọn tất cả ${skillName === 'Listening' ? 'part' : 'phần'} thi`"
                  :close-on-select="false"
                  class="sections-multiselect"
                />

                <div class="time-limit-section">
                  <h4>Giới hạn thời gian (Để trống để làm bài không giới hạn)</h4>
                  <input 
                    type="text" 
                    class="time-input" 
                    placeholder="-- Chọn thời gian --"
                    v-model="selectedTime"
                  />
                </div>

                <button class="start-practice-btn" @click="startPractice">
                  Luyện tập
                </button>
              </div>
              
              <!-- No data message -->
              <div v-else class="no-data-message">
                <p>Không có dữ liệu chi tiết cho bài thi này.</p>
              </div>
            </div>
          </div>

          <!-- Làm full test Tab -->
          <div v-if="activeTab === 'fulltest'" class="tab-panel">
            <div class="fulltest-info">
              <h3>Làm bài thi đầy đủ</h3>
              <p>Thực hiện bài thi hoàn chỉnh với thời gian giới hạn như thi thật</p>
              <ul>
                <li>Thời gian: {{ testData.duration }}</li>
                <li>Số câu hỏi: {{ testData.questions }}</li>
                <li>Có thể quy đổi sang scaled score</li>
                <li>Điều kiện thi như thật</li>
              </ul>
              <button class="start-fulltest-btn" @click="startFullTest">
                Bắt đầu thi đầy đủ
              </button>
            </div>
          </div>

          <!-- Thảo luận Tab -->
          <div v-if="activeTab === 'discussion'" class="tab-panel">
            <div class="discussion-info">
              <h3>Thảo luận về bài thi</h3>
              <p>Tham gia thảo luận với các học viên khác về bài thi này</p>
              <div class="discussion-stats">
                <span>📝 {{ discussionCount }} bình luận</span>
                <span>👥 {{ participantCount }} người tham gia</span>
              </div>
              <button class="join-discussion-btn" @click="joinDiscussion">
                Tham gia thảo luận
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, computed } from 'vue'
import { useRouter } from 'vue-router'
import MultiSelect from '../../../components/MultiSelect.vue'
import { useNotification } from '@/composables/useNotification'

const router = useRouter()
const { warning } = useNotification()

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  testData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'start-practice', 'start-fulltest', 'join-discussion'])

// Tabs data
const tabs = [
  { label: 'Luyện tập', value: 'practice' },
  { label: 'Làm full test', value: 'fulltest' },
  { label: 'Thảo luận', value: 'discussion' }
]

const activeTab = ref('practice')
const selectedTime = ref('')
const selectedSections = ref([])

// Lấy SkillName
const skillName = computed(() => {
  // Kiểm tra nếu có cả listening và reading
  const hasListening = props.testData?.parts && props.testData.parts.length > 0
  const hasReading = props.testData?.passages && props.testData.passages.length > 0
  
  if (hasListening && hasReading) {
    return 'Listening & Reading'
  } else if (hasListening) {
    return 'Listening'
  } else if (hasReading) {
    return 'Reading' 
  }
  
  return props.testData?.skillName || 'Practice';
});

// Lấy SkillTypeId
const skillTypeId = computed(() => {
  return props.testData?.skillTypeId;
});

// Tính toán các phần this
const testSections = computed(() => {
  const sections = [];
  
  // Thêm Listening Parts nếu có
  if (props.testData.parts && props.testData.parts.length > 0) {
    const listeningSection = props.testData.parts.map(part => ({
      id: `listening_${part.id}`,
      name: `Part ${part.partNumber}: ${part.title} (${getTotalQuestionsInPart(part)} câu hỏi)`,
      questions: getTotalQuestionsInPart(part),
      type: 'listening'
    }));
    sections.push(...listeningSection);
  }
  
  // Thêm Reading Passages nếu có  
  if (props.testData.passages && props.testData.passages.length > 0) {
    const readingSection = props.testData.passages.map(passage => ({
      id: `reading_${passage.id}`,
      name: `${passage.title} (${passage.questions?.length || 0} câu hỏi)`,
      questions: passage.questions?.length || 0,
      type: 'reading'
    }));
    sections.push(...readingSection);
  }

  return sections;
});

// Đếm số phần thi
const partCount = computed(() => {
  return testSections.value.length;
});

// --- HÀM HELPER (cho Listening) ---
const getTotalQuestionsInPart = (part) => {
  if (!part.questionGroups) return 0;
  return part.questionGroups.reduce((total, group) => total + (group.questions?.length || 0), 0);
};

// Discussion data (mock)
const discussionCount = computed(() => Math.floor(Math.random() * 50) + 10)
const participantCount = computed(() => Math.floor(Math.random() * 100) + 20)

// Methods
const closeModal = () => {
  emit('close')
}

const handleOverlayClick = (e) => {
  if (e.target === e.currentTarget) {
    closeModal()
  }
}

const startPractice = () => {
  if (selectedSections.value.length === 0) {
    warning('Vui lòng chọn ít nhất một phần thi để luyện tập', 'Chưa chọn phần thi')
    return
  }
  
  // Close modal first
  emit('close')

  // Navigate to practice mode with selected sections
  // Extract actual IDs (remove listening_/reading_ prefix)
  const sectionIds = selectedSections.value.map(section => {
    const id = String(section.id)
    if (id.startsWith('listening_') || id.startsWith('reading_')) {
      return id.split('_')[1]
    }
    return id
  }).join(',')
  
  // Xác định skill type - cho hybrid test, mặc định là listening nếu có audio
  const skillType = (props.testData.audioUrl || props.testData.parts?.length > 0) ? 'listening' : 'reading'
  
  router.push({
    path: `/online-test/full-test/${props.testData.id}`,
    query: {
      mode: 'practice',
      sections: sectionIds,
      timeLimit: selectedTime.value || '',
      title: props.testData.title,
      type: props.testData.type,
      skill: skillType
    }
  })
}

const startFullTest = () => {
  // Close modal first
  emit('close')
  
  // Xác định skill type - cho hybrid test, mặc định là listening nếu có audio
  const skillType = (props.testData.audioUrl || props.testData.parts?.length > 0) ? 'listening' : 'reading'
  
  // Navigate to full test page
  router.push({
    path: `/online-test/full-test/${props.testData.id}`,
    query: {
      mode: 'fulltest',
      title: props.testData.title,
      type: props.testData.type,
      skill: skillType
    }
  })
}

const joinDiscussion = () => {
  emit('join-discussion', {
    testId: props.testData.id
  })
}
</script>

<style scoped>
/* Modal Overlay */
.test-detail-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

/* Modal Container */
.test-detail-modal {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

/* Modal Header */
.test-detail-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 1rem 1rem 0 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.test-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
  margin-right: 1rem;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Badges */
.test-badges {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-primary {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.badge-secondary {
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
}

/* Test Info */
.test-info {
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.5rem;
}

.info-label {
  font-size: 0.875rem;
  opacity: 0.9;
}

.info-value {
  font-weight: 600;
}

/* Warning Note */
.warning-note {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.5rem;
  padding: 1rem;
  color: #fee2e2;
}

.warning-note strong {
  color: #fecaca;
}

/* Modal Body */
.modal-body {
  background: #f8fafc;
}

/* Navigation Tabs */
.nav-tabs {
  display: flex;
  background: white;
  border-bottom: 1px solid #e2e8f0;
}

.nav-tab {
  flex: 1;
  padding: 1rem;
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
}

.nav-tab:hover {
  background-color: #f1f5f9;
  color: #475569;
}

.nav-tab.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  background-color: #f8fafc;
}

/* Tab Content */
.tab-content {
  padding: 2rem;
}

.tab-panel {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Practice Tab */
.info-box {
  background: linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%);
  border: 1px solid #bfdbfe;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.info-box h4 {
  color: #1e40af;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
}

.practice-options h4 {
  color: #1f2937;
  margin-bottom: 1rem;
}

.practice-sections {
  margin-bottom: 1.5rem;
}

.section-item {
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  background: #f9fafb;
}

.section-info {
  color: #374151;
  font-size: 0.875rem;
}

.time-limit-section {
  margin-bottom: 1.5rem;
}

.time-limit-section h4 {
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.time-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.time-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* MultiSelect Styling in Modal */
.sections-multiselect {
  margin-bottom: 1.5rem;
}

.sections-multiselect :deep(.multi-select-input) {
  min-height: 2.75rem;
}

.sections-multiselect :deep(.selected-tag) {
  background: linear-gradient(135deg, #dbeafe, #e0f2fe);
  color: #1e40af;
  border: 1px solid #bfdbfe;
}

/* Action Buttons */
.start-practice-btn,
.start-fulltest-btn,
.join-discussion-btn {
  width: 100%;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.start-practice-btn:hover,
.start-fulltest-btn:hover,
.join-discussion-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
}

/* Full Test Tab */
.fulltest-info h3,
.discussion-info h3 {
  color: #1f2937;
  margin-bottom: 1rem;
}

.fulltest-info ul {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.fulltest-info li {
  margin-bottom: 0.5rem;
  color: #6b7280;
}

/* Discussion Tab */
.discussion-stats {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
  font-size: 0.875rem;
  color: #6b7280;
}

/* No Data Message */
.no-data-message {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  background: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.no-data-message p {
  margin: 0;
  font-style: italic;
}

/* Responsive Design */
@media (max-width: 640px) {
  .test-detail-modal-overlay {
    padding: 0;
    align-items: flex-end;
  }
  
  .test-detail-modal {
    max-width: none;
    width: 100%;
    max-height: 95vh;
    border-radius: 1rem 1rem 0 0;
  }
  
  .test-detail-header {
    padding: 1.5rem;
    border-radius: 1rem 1rem 0 0;
  }
  
  .test-title {
    font-size: 1.25rem;
  }
  
  .nav-tabs {
    flex-direction: column;
  }
  
  .nav-tab {
    text-align: center;
  }
  
  .tab-content {
    padding: 1rem;
  }
}
</style>