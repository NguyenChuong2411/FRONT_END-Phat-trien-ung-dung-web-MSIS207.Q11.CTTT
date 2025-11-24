<template>
  <div class="test-management-page">
    <!-- Header Section -->
    <section class="page-header">
      <div class="header-container">
        <h1 class="page-title">QUẢN LÝ ĐỀ THI</h1>
        <p class="page-subtitle">Tạo, chỉnh sửa và quản lý các đề thi của bạn</p>
      </div>
    </section>

    <!-- Management Tools -->
    <section class="management-section">
      <div class="content-container">
        <!-- Action Bar -->
        <div class="action-bar">
          <div class="search-tools">
            <div class="search-box">
              <input 
                type="text" 
                v-model="searchQuery"
                placeholder="Tìm kiếm đề thi..."
                class="search-input"
              />
            </div>
            <select v-model="filterType" class="filter-select">
              <option value="all">Tất cả loại</option>
              <option value="IELTS Academic">IELTS Academic</option>
              <option value="IELTS General">IELTS General</option>
              <option value="TOEIC">TOEIC</option>
              <option value="TOEIC SW">TOEIC SW</option>
            </select>
          </div>
          
          <div class="action-buttons">
            <button class="action-btn primary" @click="navigateToCreateTest">
              <i class="fa-solid fa-plus"></i>
              Tạo đề thi mới
            </button>
          </div>
        </div>

        <!-- Tests Table -->
        <div class="tests-table-container">
          <div v-if="isLoading" class="loading-overlay">
            <div class="loading-spinner">
              <span>Đang tải...</span>
            </div>
          </div>
          
          <table class="tests-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên đề thi</th>
                <th>Loại</th>
                <th>Thời gian</th>
                <th>Câu hỏi</th>
                <th>Ngày tạo</th>
                <th>Cập nhật</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(test, index) in paginatedTests" :key="test.id" class="test-row">
                <td class="test-id">
                  {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                </td>
                <td class="test-title">
                  <div class="title-container">
                    <span class="title">{{ test.title }}</span>
                    <span class="description">{{ test.description || 'Không có mô tả' }}</span>
                  </div>
                </td>
                <td>
                  <span class="test-type" :class="getTypeClass(test.testType)">
                    {{ test.testType }}
                  </span>
                </td>
                <td>{{ test.durationMinutes || 0 }} phút</td>
                <td>{{ test.questionCount || 0 }} câu</td>
                <td class="created-date">{{ formatDate(test.createdAt) }}</td>
                <td class="created-date">{{ formatDate(test.updatedAt) }}</td>
                <td class="actions">
                  <div class="action-buttons-group">
                    <button 
                      class="btn-icon view" 
                      @click="viewTest(test)"
                      title="Xem chi tiết"
                    >
                      <i class="fa-solid fa-eye"></i>
                    </button>
                    <button 
                      class="btn-icon edit" 
                      @click="editTest(test)"
                      title="Chỉnh sửa"
                    >
                      <i class="fa-solid fa-edit"></i>
                    </button>
                    <button 
                      class="btn-icon delete" 
                      @click="confirmDelete(test)"
                      title="Xóa"
                    >
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination-info">
          Hiển thị {{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, filteredTests.length) }} 
          trong tổng {{ filteredTests.length }} đề thi
        </div>
        
        <Pagination 
          :current-page="currentPage"
          :total-pages="totalPages"
          @page-change="handlePageChange"
        />
      </div>
    </section>

    <!-- Update Test Modal (for editing) -->
    <UpdateTestModal
      v-if="showEditModal"
      :test-types="testTypes"
      :test-id="editingTestId"
      :is-saving="isLoading"
      @close="closeModal"
      @save="saveTest"
    />

    <!-- View Test Modal (read-only) -->
    <UpdateTestModal
      v-if="showViewModal"
      :test-types="testTypes"
      :test-id="viewingTestId"
      :is-saving="false"
      :view-only="true"
      @close="closeViewModal"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmationModal
      :show="showDeleteModal"
      type="danger"
      title="Xác nhận xóa"
      :message="`Bạn có chắc chắn muốn xóa đề thi '${testToDelete?.title}'?`"
      sub-message="Hành động này không thể hoàn tác!"
      confirm-text="Xóa đề thi"
      cancel-text="Hủy bỏ"
      :loading="isLoading"
      loading-text="Đang xóa..."
      @confirm="deleteTest"
      @cancel="showDeleteModal = false"
      @close="showDeleteModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Pagination from '@/components/Pagination.vue'
import UpdateTestModal from './create-test/UpdateTestModal.vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'
import { TestAdminAPI, TestDataHelpers } from '@/services/TestAdminAPI.js'
import { useNotification } from '@/composables/useNotification'

const router = useRouter()
const { success, error } = useNotification()

// Reactive data
const searchQuery = ref('')
const filterType = ref('all')
const currentPage = ref(1)
const itemsPerPage = 10
const isLoading = ref(false)

// Modal states - Chỉ giữ lại modal cho edit và view
const showEditModal = ref(false)
const showViewModal = ref(false)
const showDeleteModal = ref(false)
const testToDelete = ref(null)
const editingTestId = ref(null)
const viewingTestId = ref(null)

// Thay thế sample data bằng dữ liệu thực từ API
const allTests = ref([])

// Test types - có thể lấy từ API riêng
const testTypes = ref([
  { id: 1, name: 'IELTS Academic' },
  { id: 2, name: 'IELTS General' },
  { id: 3, name: 'TOEIC' },
  { id: 4, name: 'TOEIC SW' }
])

// Computed properties
const filteredTests = computed(() => {
  let filtered = allTests.value

  // Filter by type - sử dụng testType thay vì type cũ
  if (filterType.value !== 'all') {
    filtered = filtered.filter(test => test.testType === filterType.value)
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(test => 
      test.title.toLowerCase().includes(query) ||
      (test.description && test.description.toLowerCase().includes(query)) ||
      test.testType.toLowerCase().includes(query)
    )
  }

  return filtered
})

const totalPages = computed(() => {
  return Math.ceil(filteredTests.value.length / itemsPerPage)
})

const paginatedTests = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredTests.value.slice(start, end)
})

const getTypeClass = (testType) => {
  const typeMap = {
    'IELTS Academic': 'ielts-academic',
    'IELTS General': 'ielts-general',
    'TOEIC': 'toeic',
    'TOEIC SW': 'toeic-sw'
  }
  return typeMap[testType] || ''
}

const formatDate = (date) => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(date))
}

// API functions
const loadAllTests = async () => {
  isLoading.value = true
  try {
    const tests = await TestAdminAPI.getAllTestsForAdmin()
    allTests.value = tests
  } catch (err) {
    console.error('Error loading tests:', err)
    error('Không thể tải danh sách đề thi', 'Lỗi tải dữ liệu')
  } finally {
    isLoading.value = false
  }
}

// CRUD operations
const viewTest = async (test) => {
  viewingTestId.value = test.id
  showViewModal.value = true
}

const editTest = async (test) => {
  editingTestId.value = test.id
  showEditModal.value = true
}

const navigateToCreateTest = () => {
  router.push({ name: 'create-test' })
}

const confirmDelete = (test) => {
  testToDelete.value = test
  showDeleteModal.value = true
}

const deleteTest = async () => {
  if (testToDelete.value) {
    isLoading.value = true
    try {
      await TestAdminAPI.deleteTest(testToDelete.value.id)
      // Remove from local array
      const index = allTests.value.findIndex(t => t.id === testToDelete.value.id)
      if (index > -1) {
        allTests.value.splice(index, 1)
      }
      showDeleteModal.value = false
      testToDelete.value = null
      console.log('Test deleted successfully')
      success('Xóa đề thi thành công!', 'Thành công')
    } catch (err) {
      console.error('Error deleting test:', err)
      error('Không thể xóa đề thi', 'Lỗi xóa dữ liệu')
    } finally {
      isLoading.value = false
    }
  }
}

const saveTest = async (savePayload) => {
  // Phân tách payload từ modal edit
  const testData = savePayload.testData || savePayload // Handle both create and edit emits
  const oldAudioIdToDelete = savePayload.oldAudioId || null

  isLoading.value = true
  try {
    // Validate form data
    const validationErrors = TestDataHelpers.validateTestData(testData)
    if (validationErrors.length > 0) {
      error('Dữ liệu không hợp lệ:\n' + validationErrors.join('\n'), 'Lỗi dữ liệu')
      return
    }

    // Only update operation is supported in TestManagement page
    // Create operation is handled in CreateTestPage
    if (showEditModal.value) {
      // Update existing test
      await TestAdminAPI.updateTest(testData.id, testData)

      // SAU KHI UPDATE THÀNH CÔNG, XÓA FILE CŨ NẾU CÓ
      if (oldAudioIdToDelete) {
        console.log(`Update successful, now deleting old audio ID: ${oldAudioIdToDelete}`)
        await TestAdminAPI.deleteAudioFile(oldAudioIdToDelete)
      }

      console.log('Test updated successfully')
      success('Cập nhật đề thi thành công!', 'Thành công')
      
      // Reload the test list
      await loadAllTests()
      closeModal()
    }
  } catch (err) {
    console.error('Error saving test:', err)
    error('Lỗi khi lưu đề thi', 'Lỗi lưu dữ liệu')
  } finally {
    isLoading.value = false
  }
}

const closeModal = () => {
  showEditModal.value = false
  editingTestId.value = null
}

const closeViewModal = () => {
  showViewModal.value = false
  viewingTestId.value = null
}

const handlePageChange = (page) => {
  currentPage.value = page
}

onMounted(async () => {
  console.log('Test Management page loaded')
  await loadAllTests()
})
</script>

<style src="@/assets/modal.css"></style>
<style src="@/assets/form.css"></style>  
<style src="@/assets/buttons.css"></style>
<style src="./TestManagement.css" scoped></style>