import axios from 'axios'

// Cấu hình axios instance
const apiClient = axios.create({
  baseURL: 'https://localhost:7263/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor để tự động thêm token vào headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor để xử lý response và errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem('authToken')
      localStorage.removeItem('userInfo')
      // Có thể redirect về login page
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Hàm helper để xử lý token và thông tin user (tái sử dụng cho cả login thường và Google login)
const processTokenAndUserInfo = (token, fallbackEmail = '') => {
  localStorage.setItem('authToken', token)
  
  try {
    const tokenPayload = JSON.parse(atob(token.split('.')[1]))
    const userInfo = {
      id: tokenPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
      email: tokenPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || fallbackEmail,
      fullName: tokenPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
      roleId: parseInt(tokenPayload['role_id'] || 2),
      exp: tokenPayload.exp
    }
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
    return userInfo
  } catch (decodeError) {
    // Fallback nếu decode thất bại
    const userInfo = {
      email: fallbackEmail
    }
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
    return userInfo
  }
}

// API functions
export const authAPI = {
  // Đăng ký
  register: async (registerData) => {
    try {
      const response = await apiClient.post('/Auth/register', {
        fullName: registerData.fullName,
        email: registerData.email,
        password: registerData.password
      })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Register error:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Đăng ký thất bại' 
      }
    }
  },

  // Đăng nhập
  login: async (loginData) => {
    try {
      const response = await apiClient.post('/Auth/login', {
        email: loginData.email,
        password: loginData.password
      })
      
      if (response.data.token) {
        // Sử dụng hàm helper để xử lý token
        processTokenAndUserInfo(response.data.token, loginData.email)
        return { success: true, data: response.data }
      }
      
      return { success: false, error: 'Không nhận được token' }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Đăng nhập thất bại' 
      }
    }
  },

  // Đăng nhập bằng Google
  loginWithGoogle: async (idToken) => {
    try {
      const response = await apiClient.post('/Auth/googlelogin', {
        idToken: idToken
      })
      
      if (response.data.token) {
        // Sử dụng hàm helper để xử lý token
        processTokenAndUserInfo(response.data.token)
        return { success: true, data: response.data }
      }
      
      return { success: false, error: 'Không nhận được token' }
    } catch (error) {
      console.error('Google login error:', error)
      return { 
        success: false, 
        error: error.response?.data || 'Đăng nhập Google thất bại' 
      }
    }
  },

  // Đăng xuất
  logout: () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userInfo')
    return { success: true }
  },

  // Kiểm tra trạng thái đăng nhập
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken')
  },

  // Lấy thông tin user từ localStorage
  getUserInfo: () => {
    const userInfo = localStorage.getItem('userInfo')
    return userInfo ? JSON.parse(userInfo) : null
  },

  // Lấy thông tin user profile từ server
  getUserProfile: async () => {
    try {
      const response = await apiClient.get('/User/GetUserProfile')
      
      // Cập nhật thông tin user vào localStorage
      const userInfo = {
        id: response.data.id,
        fullName: response.data.fullName,
        email: response.data.email
      }
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
      
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Get user profile error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể lấy thông tin người dùng'
      }
    }
  }
}

export default authAPI