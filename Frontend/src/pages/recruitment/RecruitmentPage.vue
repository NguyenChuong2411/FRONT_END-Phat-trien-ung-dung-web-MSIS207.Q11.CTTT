<template>
  <div class="recruitment-page">
    <!-- Header Section -->
    <section class="page-header">
      <div class="container">
        <h1 class="page-title">Tuyển dụng</h1>
        <p class="page-subtitle">Cơ hội nghề nghiệp tại Enly - Nơi thực hiện ước mơ</p>
      </div>
    </section>

    <!-- Job Opportunities -->
    <section class="job-opportunities">
      <div class="container">
        <div class="content-layout">
          <!-- Job Listings -->
          <div class="job-listings">
            <div class="section-header">
              <h2>Vị trí đang tuyển</h2>
              <div class="job-filters">
                <select v-model="selectedDepartment" class="filter-select">
                  <option value="all">Tất cả phòng ban</option>
                  <option value="teaching">Giảng dạy</option>
                  <option value="marketing">Marketing</option>
                  <option value="tech">Công nghệ</option>
                  <option value="admin">Hành chính</option>
                </select>
                <select v-model="selectedType" class="filter-select">
                  <option value="all">Tất cả loại hình</option>
                  <option value="fulltime">Toàn thời gian</option>
                  <option value="parttime">Bán thời gian</option>
                  <option value="internship">Thực tập</option>
                </select>
              </div>
            </div>

            <div class="jobs-grid">
              <div 
                v-for="job in filteredJobs" 
                :key="job.id"
                class="job-card"
              >
                <div class="job-header">
                  <h3>{{ job.title }}</h3>
                  <span class="job-type" :class="job.type">{{ getJobTypeLabel(job.type) }}</span>
                </div>
                <div class="job-details">
                  <div class="job-meta">
                    <span>📍 {{ job.location }}</span>
                    <span>💰 {{ job.salary }}</span>
                    <span>🏢 {{ job.department }}</span>
                  </div>
                  <p class="job-description">{{ job.description }}</p>
                  <div class="job-requirements">
                    <h4>Yêu cầu:</h4>
                    <ul>
                      <li v-for="req in job.requirements" :key="req">{{ req }}</li>
                    </ul>
                  </div>
                  <div class="job-actions">
                    <button class="btn btn-primary">Ứng tuyển ngay</button>
                    <button class="btn btn-secondary">Lưu tin</button>
                  </div>
                </div>
                <div class="job-footer">
                  <span>Đăng: {{ job.postedDate }}</span>
                  <span>Hạn: {{ job.deadline }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <aside class="sidebar">
            <div class="widget">
              <h3>Tại sao làm việc tại Enly?</h3>
              <ul class="benefits-list">
                <li>💼 Môi trường làm việc chuyên nghiệp</li>
                <li>📈 Cơ hội thăng tiến rõ ràng</li>
                <li>🎓 Đào tạo và phát triển kỹ năng</li>
                <li>💰 Lương thưởng cạnh tranh</li>
                <li>🏥 Bảo hiểm sức khoe toàn diện</li>
                <li>🌴 Chế độ nghỉ phép hấp dẫn</li>
              </ul>
            </div>

            <div class="widget">
              <h3>Liên hệ HR</h3>
              <div class="contact-info">
                <p>📧 hr@enly.vn</p>
                <p>📞 (028) 1234 5678</p>
                <p>📍 123 Nguyễn Văn Cừ, Q.5, TP.HCM</p>
              </div>
              <button class="btn btn-outline">Gửi CV tự do</button>
            </div>

            <div class="widget">
              <h3>Văn hóa công ty</h3>
              <div class="culture-images">
                <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=100&q=80" alt="Company Culture 1" />
                <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=100&q=80" alt="Company Culture 2" />
                <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=100&q=80" alt="Company Culture 3" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Reactive data
const selectedDepartment = ref('all')
const selectedType = ref('all')

const jobs = ref([
  {
    id: 1,
    title: 'Giáo viên tiếng Anh',
    department: 'Giảng dạy',
    type: 'fulltime',
    location: 'TP. Hồ Chí Minh',
    salary: '15-25 triệu',
    description: 'Tìm kiếm giáo viên tiếng Anh nhiệt huyết để tham gia đội ngũ giảng dạy chuyên nghiệp.',
    requirements: [
      'Bằng cử nhân chuyên ngành tiếng Anh hoặc tương đương',
      'Có kinh nghiệm giảng dạy từ 2 năm trở lên',
      'IELTS 7.0+ hoặc TOEIC 850+ hoặc tương đương',
      'Kỹ năng giao tiếp và thuyết trình tốt'
    ],
    postedDate: '15/09/2024',
    deadline: '30/09/2024'
  },
  {
    id: 2,
    title: 'Marketing Executive',
    department: 'Marketing',
    type: 'fulltime',
    location: 'TP. Hồ Chí Minh',
    salary: '12-18 triệu',
    description: 'Tham gia xây dựng và thực hiện các chiến lược marketing để phát triển thương hiệu Enly.',
    requirements: [
      'Bằng cử nhân Marketing, Kinh tế hoặc chuyên ngành liên quan',
      'Kinh nghiệm 1-3 năm trong lĩnh vực marketing',
      'Thành thạo các công cụ digital marketing',
      'Tiếng Anh giao tiếp tốt'
    ],
    postedDate: '12/09/2024',
    deadline: '25/09/2024'
  },
  {
    id: 3,
    title: 'Frontend Developer',
    department: 'Công nghệ',
    type: 'fulltime',
    location: 'TP. Hồ Chí Minh',
    salary: '20-30 triệu',
    description: 'Phát triển và duy trì các ứng dụng web frontend cho hệ thống học trực tuyến.',
    requirements: [
      'Kinh nghiệm 2+ năm với Vue.js, React hoặc Angular',
      'Thành thạo HTML, CSS, JavaScript',
      'Hiểu biết về responsive design và UX/UI',
      'Kinh nghiệm với Git và các công cụ build modern'
    ],
    postedDate: '10/09/2024',
    deadline: '28/09/2024'
  },
  {
    id: 4,
    title: 'Thực tập sinh Content',
    department: 'Marketing',
    type: 'internship',
    location: 'TP. Hồ Chí Minh',
    salary: '3-5 triệu',
    description: 'Cơ hội thực tập tại phòng Marketing, tham gia sản xuất nội dung giáo dục.',
    requirements: [
      'Sinh viên năm 3, 4 hoặc mới tốt nghiệp',
      'Đam mê viết lách và sáng tạo nội dung',
      'Tiếng Anh tốt, ưu tiên IELTS 6.5+',
      'Thành thạo các công cụ Office và Canva'
    ],
    postedDate: '08/09/2024',
    deadline: '22/09/2024'
  }
])

// Computed
const filteredJobs = computed(() => {
  return jobs.value.filter(job => {
    const departmentMatch = selectedDepartment.value === 'all' || 
      job.department.toLowerCase().includes(getDepartmentKey(selectedDepartment.value))
    const typeMatch = selectedType.value === 'all' || job.type === selectedType.value
    
    return departmentMatch && typeMatch
  })
})

// Methods
const getJobTypeLabel = (type) => {
  const labels = {
    fulltime: 'Toàn thời gian',
    parttime: 'Bán thời gian',
    internship: 'Thực tập'
  }
  return labels[type] || type
}

const getDepartmentKey = (department) => {
  const keys = {
    teaching: 'giảng',
    marketing: 'marketing',
    tech: 'công nghệ',
    admin: 'hành chính'
  }
  return keys[department] || department
}

onMounted(() => {
  console.log('Recruitment page loaded')
})
</script>

<style src="./RecruitmentPage.css" scoped></style>