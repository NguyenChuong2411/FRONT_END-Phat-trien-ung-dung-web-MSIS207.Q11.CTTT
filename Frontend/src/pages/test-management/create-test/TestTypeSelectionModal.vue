<template>
  <div class="modal-overlay" @click="!isPageMode && $emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header primary">
        <h3>
          <i class="fa-solid fa-plus"></i>
          Chọn loại đề thi muốn tạo
        </h3>
        <button v-if="!isPageMode" class="close-btn" @click="$emit('close')">
          <i class="fa-solid fa-circle-xmark"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <!-- Step 1: Choose Test Type -->
        <div v-if="currentStep == 1" class="step-content">
          <h4 class="step-title">Bước 1: Chọn loại đề thi</h4>
          <div class="test-type-grid">
            <div 
              v-for="testType in testTypes" 
              :key="testType.id"
              class="test-type-card"
              :class="{ active: selectedTestType?.id === testType.id }"
              @click="selectTestType(testType)"
            >
              <div class="card-content">
                <h5>{{ testType.name }}</h5>
                <p>{{ getTestTypeDescription(testType.name) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Choose Skill (for IELTS Academic/General) -->
        <div v-if="currentStep == 2 && isIELTS" class="step-content">
          <h4 class="step-title">Bước 2: Chọn kỹ năng</h4>
          <div class="skill-grid">
            <div 
              v-for="skill in availableSkills" 
              :key="skill.key"
              class="skill-card"
              :class="{ active: selectedSkill?.key === skill.key }"
              @click="selectSkill(skill)"
            >
              <div class="card-content">
                <h5>{{ skill.name }}</h5>
                <p>{{ skill.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div v-if="selectedTestType" class="selection-summary">
          <h6>Lựa chọn của bạn:</h6>
          <div class="summary-item">
            <strong>Loại đề thi:</strong> {{ selectedTestType.name }}
          </div>
          <div v-if="selectedSkill" class="summary-item">
            <strong>Kỹ năng:</strong> {{ selectedSkill.name }}
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button 
          v-if="currentStep > 1" 
          type="button" 
          class="btn secondary" 
          @click="goBack"
        >
          Quay lại
        </button>
        <button v-if="!isPageMode" type="button" class="btn secondary" @click="$emit('close')">
          Hủy bỏ
        </button>
        <button 
          type="button" 
          class="btn primary" 
          @click="proceedToNext"
          :disabled="!canProceed"
        >
          {{ isLastStep ? 'Bắt đầu tạo' : 'Tiếp theo' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  testTypes: {
    type: Array,
    default: () => []
  },
  isPageMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'proceed'])

// State
const currentStep = ref(1)
const selectedTestType = ref(null)
const selectedSkill = ref(null)

// Available skills for IELTS
const ieltsSkills = [
  {
    key: 'reading',
    name: 'Reading',
    description: 'Tạo đề thi đọc hiểu với đoạn văn và câu hỏi',
  },
  {
    key: 'listening',
    name: 'Listening',
    description: 'Tạo đề thi nghe với file audio và câu hỏi',
  },
  {
    key: 'writing',
    name: 'Writing',
    description: 'Tạo đề thi viết với task và yêu cầu',
  }
]

// Computed properties
const isIELTS = computed(() => {
  return selectedTestType.value && 
    (selectedTestType.value.name === 'IELTS Academic' || selectedTestType.value.name === 'IELTS General')
})

const isTOEIC = computed(() => {
  return selectedTestType.value && selectedTestType.value.name === 'TOEIC'
})

const isTOEICSW = computed(() => {
  return selectedTestType.value && selectedTestType.value.name === 'TOEIC SW'
})

const availableSkills = computed(() => {
  if (isIELTS.value) return ieltsSkills
  return []
})

const canProceed = computed(() => {
  if (currentStep.value === 1) return !!selectedTestType.value
  if (currentStep.value === 2 && isIELTS.value) return !!selectedSkill.value
  return false
})

const isLastStep = computed(() => {
  if (isIELTS.value) return currentStep.value === 2 && !!selectedSkill.value
  return currentStep.value === 1 && (isTOEIC.value || isTOEICSW.value)
})

// Methods
const selectTestType = (testType) => {
  selectedTestType.value = testType
  selectedSkill.value = null // Reset skill selection
}

const selectSkill = (skill) => {
  selectedSkill.value = skill
}

const goBack = () => {
  if (currentStep.value > 1) {
    currentStep.value--
    if (currentStep.value === 1) {
      selectedSkill.value = null
    }
  }
}

const proceedToNext = () => {
  if (!canProceed.value) return

  if (isLastStep.value) {
    // Emit the final selection
    const selection = {
      testType: selectedTestType.value,
      skill: selectedSkill.value,
      mode: getCreationMode()
    }
    emit('proceed', selection)
  } else if (currentStep.value === 1 && isIELTS.value) {
    // Go to skill selection for IELTS
    currentStep.value = 2
  }
}

const getCreationMode = () => {
  if (isIELTS.value && selectedSkill.value) {
    return `ielts-${selectedSkill.value.key}`
  } else if (isTOEIC.value) {
    return 'toeic-full'
  } else if (isTOEICSW.value) {
    return 'toeic-sw'
  }
  return 'default'
}

const getTestTypeDescription = (typeName) => {
  const descriptions = {
    'IELTS Academic': 'Đề thi IELTS học thuật cho du học và nghiên cứu',
    'IELTS General': 'Đề thi IELTS tổng quát cho định cư và làm việc',
    'TOEIC': 'Đề thi TOEIC Listening & Reading đầy đủ',
    'TOEIC SW': 'Đề thi TOEIC Speaking & Writing'
  }
  return descriptions[typeName] || ''
}
</script>

<style src="@/assets/modal.css"></style>
<style src="@/assets/form.css"></style>  
<style src="@/assets/buttons.css"></style>
<style src="../TestManagement.css" scoped></style>