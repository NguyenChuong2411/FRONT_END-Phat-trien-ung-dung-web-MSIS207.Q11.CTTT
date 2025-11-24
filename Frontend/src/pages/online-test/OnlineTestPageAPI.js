import axios from 'axios';

// Cấu hình một instance axios với URL cơ sở của backend
// Thay đổi port 7123 thành port của backend .NET của bạn nếu cần
const apiClient = axios.create({
  baseURL: 'https://localhost:7088/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor để tự động thêm JWT token vào headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
);

// Interceptor để xử lý response và errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem('authToken')
      localStorage.removeItem('userInfo')
      // Redirect về login page
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
);

// Hàm để lấy danh sách tất cả bài thi
export const fetchAllTests = async () => {
  try {
    const response = await apiClient.get('/OnlineTest/GetAllTests');
    return response.data;
  } catch (error) {
    console.error('Error fetching all tests:', error);
    // Ném lỗi ra ngoài để component có thể xử lý
    throw error;
  }
};

// Hàm để lấy chi tiết một bài thi theo ID (Reading)
export const fetchReadingTestDetails = async (testId) => {
  try {
    const response = await apiClient.get(`/OnlineTest/GetTestDetails/${testId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching reading test details for test ${testId}:`, error);
    throw error;
  }
};

// Hàm để lấy chi tiết bài thi Listening theo ID
export const fetchListeningTestDetails = async (testId) => {
  try {
    const response = await apiClient.get(`/OnlineTest/GetListeningTestDetails/${testId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching listening test details for test ${testId}:`, error);
    throw error;
  }
};

// Hàm để lấy chi tiết một bài thi theo ID (deprecated - dùng fetchReadingTestDetails thay thế)
export const fetchTestDetails = async (testId) => {
  return await fetchReadingTestDetails(testId);
};

// Hàm để nộp bài thi
export const submitTest = async (submissionData) => {
  try {
    console.log('API: Sending submission data:', submissionData);
    
    // Backend expects TestSubmissionDto with specific format
    const payload = {
      TestId: submissionData.testId,
      Answers: submissionData.answers // This should be Dictionary<string, JsonElement>
    };
    
    console.log('API: Final payload:', JSON.stringify(payload, null, 2));
    
    const response = await apiClient.post('/OnlineTest/Submit', payload);
    console.log('API: Response received:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error submitting test:', error);
    console.error('Error details:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Full error object:', error);
    throw error;
  }
};

// Hàm để lấy kết quả bài thi
export const fetchTestResult = async (attemptId) => {
  try {
    const response = await apiClient.get(`/OnlineTest/Result/${attemptId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching test result for attempt ${attemptId}:`, error);
    throw error;
  }
};

// Hàm để lấy lịch sử làm bài của người dùng
export const fetchTestHistory = async () => {
  try {
    // Backend endpoint: GET /api/OnlineTest/GetMyTestHistory
    // AuthAPI interceptor sẽ tự động đính kèm Token
    const response = await apiClient.get('/OnlineTest/GetMyTestHistory');
    return response.data;
  } catch (error) {
    console.error('Error fetching test history:', error);
    throw error;
  }
};