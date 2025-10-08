import axios from 'axios';

// Cấu hình một instance axios với URL cơ sở của backend
// Thay đổi port 7123 thành port của backend .NET của bạn nếu cần
const apiClient = axios.create({
  baseURL: 'https://localhost:7088/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

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

// Hàm để lấy chi tiết một bài thi theo ID
export const fetchTestDetails = async (testId) => {
  try {
    const response = await apiClient.get(`/OnlineTest/GetTestDetails/${testId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching details for test ${testId}:`, error);
    throw error;
  }
};