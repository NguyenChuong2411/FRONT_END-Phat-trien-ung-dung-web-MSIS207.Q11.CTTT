<template>
  <div class="create-test-page">
    <!-- Header Section -->
    <section class="page-header-create">
        <button class="btn primary m-2" @click="goBack">
          <i class="fa-solid fa-circle-left large-icon "></i>
        </button>
    </section>

    <!-- Test Type Selection (Step 1) -->
    <section v-if="!selectedTestType" class="selection-section">
      <div class="content-container">
        <TestTypeSelectionModal
          :test-types="testTypes"
          :is-page-mode="true"
          @proceed="handleTestTypeSelection"
        />
      </div>
    </section>

    <!-- Test Form (Step 2) -->
    <section v-else class="form-section">
      <div class="content-container">
        <!-- IELTS Reading Form -->
        <IELTSReadingModal
          v-if="currentForm === 'ielts-reading'"
          :test-type="selectedTestTypeName"
          :test-type-id="selectedTestTypeId"
          :skill-type-id="selectedSkillTypeId"
          :is-saving="isLoading"
          :is-page-mode="true"
          @save="saveTest"
          @close="goBack"
        />

        <!-- IELTS Listening Form -->
        <IELTSListeningModal
          v-if="currentForm === 'ielts-listening'"
          :test-type="selectedTestTypeName"
          :test-type-id="selectedTestTypeId"
          :skill-type-id="selectedSkillTypeId"
          :is-saving="isLoading"
          :is-page-mode="true"
          @save="saveTest"
          @close="goBack"
        />

        <!-- IELTS Writing Form -->
        <IELTSWritingModal
          v-if="currentForm === 'ielts-writing'"
          :test-type="selectedTestTypeName"
          :test-type-id="selectedTestTypeId"
          :skill-type-id="selectedSkillTypeId"
          :is-saving="isLoading"
          :is-page-mode="true"
          @save="saveTest"
          @close="goBack"
        />

        <!-- TOEIC Form -->
        <TOEICModal
          v-if="currentForm === 'toeic'"
          :test-type-id="selectedTestTypeId"
          :is-saving="isLoading"
          :is-page-mode="true"
          @save="saveTest"
          @close="goBack"
        />

        <!-- TOEIC SW Form -->
        <TOEICSWModal
          v-if="currentForm === 'toeic-sw'"
          :test-type-id="selectedTestTypeId"
          :is-saving="isLoading"
          :is-page-mode="true"
          @save="saveTest"
          @close="goBack"
        />
      </div>
    </section>

    <!-- Confirmation Modal -->
    <ConfirmationModal
      :show="showConfirmModal"
      type="warning"
      title="Xác nhận quay lại"
      message="Bạn có chắc muốn quay lại? Dữ liệu chưa lưu sẽ bị mất."
      confirm-text="Quay lại"
      cancel-text="Ở lại"
      @confirm="confirmGoBack"
      @cancel="showConfirmModal = false"
      @close="showConfirmModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import TestTypeSelectionModal from './TestTypeSelectionModal.vue'
import IELTSReadingModal from './IELTS/IELTSReadingModal.vue'
import IELTSListeningModal from './IELTS/IELTSListeningModal.vue'
import IELTSWritingModal from './IELTS/IELTSWritingModal.vue'
import TOEICModal from './TOEIC/TOEICModal.vue'
import TOEICSWModal from './TOEIC/TOEICSWModal.vue'
import { TestAdminAPI, TestDataHelpers } from '@/services/TestAdminAPI.js'
import { useNotification } from '@/composables/useNotification'
import ConfirmationModal from '@/components/ConfirmationModal.vue'

const router = useRouter()
const { success, error } = useNotification()

// State
const isLoading = ref(false)
const selectedTestType = ref(null)
const selectedTestTypeId = ref(null)
const selectedTestTypeName = ref('')
const selectedSkillTypeId = ref(null) // THÊM MỚI
const currentForm = ref('')
const showConfirmModal = ref(false)

// Test types
const testTypes = ref([
  { id: 1, name: 'IELTS Academic' },
  { id: 2, name: 'IELTS General' },
  { id: 3, name: 'TOEIC' },
  { id: 4, name: 'TOEIC SW' }
])

// TẠO MAP TƯƠNG ỨNG VỚI SQL INSERT
const skillIdMap = {
  'reading': 1,
  'listening': 2,
  'writing': 3,
  'speaking': 4
}

// Methods
const goBack = () => {
  if (selectedTestType.value) {
    // If already selected a form, go back to test type selection
    showConfirmModal.value = true
  } else {
    // Go back to test management page
    router.push({ name: 'test-management' })
  }
}

const confirmGoBack = () => {
  selectedTestType.value = null
  selectedTestTypeId.value = null
  selectedTestTypeName.value = ''
  selectedSkillTypeId.value = null // Reset skill type
  currentForm.value = ''
  showConfirmModal.value = false
}

const getPageSubtitle = () => {
  if (!selectedTestType.value) {
    return 'Chọn loại đề thi bạn muốn tạo'
  }
  return `${selectedTestTypeName.value} - ${getCurrentFormTitle()}`
}

const getCurrentFormTitle = () => {
  const titles = {
    'ielts-reading': 'Reading',
    'ielts-listening': 'Listening',
    'ielts-writing': 'Writing',
    'toeic': 'Listening & Reading',
    'toeic-sw': 'Speaking & Writing'
  }
  return titles[currentForm.value] || ''
}

const handleTestTypeSelection = (selection) => {
  selectedTestType.value = selection.testType
  selectedTestTypeId.value = selection.testType.id
  selectedTestTypeName.value = selection.testType.name
  
  // Reset skillId
  selectedSkillTypeId.value = null
  
  // Determine which form to show
  if (selection.testType.name === 'IELTS Academic' || selection.testType.name === 'IELTS General') {
    if (selection.skill) {
      // Lấy ID từ map
      selectedSkillTypeId.value = skillIdMap[selection.skill.key]
      
      if (selection.skill.key === 'reading') {
        currentForm.value = 'ielts-reading'
      } else if (selection.skill.key === 'listening') {
        currentForm.value = 'ielts-listening'
      } else if (selection.skill.key === 'writing') {
        currentForm.value = 'ielts-writing'
      }
    }
  } else if (selection.testType.name === 'TOEIC') {
    currentForm.value = 'toeic'
    // TOEIC không cần skill type
  } else if (selection.testType.name === 'TOEIC SW') {
    currentForm.value = 'toeic-sw'
    // TOEIC SW không cần skill type
  }
}

const saveTest = async (savePayload) => {
  // Phân tách payload - handle both direct testData and object with testData
  const testData = savePayload.testData || savePayload // Handle both create and edit emits
  // For create operations, we don't need to handle oldAudioId since it's a new test

  isLoading.value = true
  try {
    // Validate form data
    const validationErrors = TestDataHelpers.validateTestData(testData)
    if (validationErrors.length > 0) {
      error('Dữ liệu không hợp lệ:\n' + validationErrors.join('\n'), 'Lỗi dữ liệu')
      return
    }

    // Create new test
    const newTestId = await TestAdminAPI.createTest(testData)
    console.log('New test created with ID:', newTestId)
    success('Tạo đề thi mới thành công!', 'Thành công')
    
    // Navigate back to test management
    router.push({ name: 'test-management' })
  } catch (err) {
    console.error('Error saving test:', err)
    error('Lỗi khi lưu đề thi', 'Lỗi tạo đề thi')
  } finally {
    isLoading.value = false
  }
}
</script>

<style src="@/assets/modal.css"></style>
<style src="@/assets/form.css"></style>
<style src="@/assets/buttons.css"></style>
<style src="../TestManagement.css" scoped></style>
<style scoped>
.large-icon {
  font-size: large;
}

.create-test-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.page-header-create {
  text-align: center;
  margin-top: 1rem;
}

.m-2{
  margin-left: 2rem;
}

.selection-section,
.form-section {
  padding: 0;
}

.content-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Override modal styles to make them page-friendly */
.content-container :deep(.modal-overlay) {
  position: static;
  background: none;
  display: block;
}

.content-container :deep(.modal-content) {
  position: static;
  max-width: none;
  max-height: none;
  margin: 0;
  transform: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: white;
  border-radius: 0.5rem;
}

.content-container :deep(.modal-header) {
  background: white;
  border-bottom: 2px solid #e2e8f0;
  padding: 1.5rem 2rem;
}

.content-container :deep(.modal-body) {
  padding: 2rem;
  max-height: none;
  overflow: visible;
}

.content-container :deep(.modal-actions) {
  padding: 1.5rem 2rem;
  background: #f8f9fa;
  border-top: 2px solid #e2e8f0;
  position: sticky;
  bottom: 0;
  z-index: 10;
}

/* Responsive */
@media (max-width: 768px) {
  .content-container {
    padding: 0 1rem;
  }
  
  .content-container :deep(.modal-body) {
    padding: 1.5rem;
  }
}
</style>
