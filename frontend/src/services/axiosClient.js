import axios from 'axios';

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor: Tự động đính kèm Token trước khi gửi request
axiosClient.interceptors.request.use(
  (config) => {
    // Chỉ lấy token nếu đang chạy ở môi trường trình duyệt
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Xử lý lỗi trả về chung (ví dụ 401)
axiosClient.interceptors.response.use(
  (response) => {
    // Axios bọc dữ liệu API trả về trong thuộc tính "data"
    // Nếu API Laravel trả về dạng { data: [...] }, ta có thể lấy response.data
    return response.data;
  },
  (error) => {
    if (error.response) {
      // Bắt lỗi 401 Unauthenticated
      if (error.response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('access_token');
          // Có thể redirect về trang đăng nhập nếu muốn:
          // window.location.href = '/admin/login'; 
        }
      }
      
      // Xử lý lỗi validation 422
      if (error.response.status === 422) {
        const errors = error.response.data.errors;
        if (errors) {
          const errorMessages = Object.values(errors).flat();
          return Promise.reject(new Error(errorMessages.join('\n')));
        }
      }
      
      // Xử lý thông báo lỗi chi tiết từ backend nếu có
      const errorMessage = error.response.data?.message || 'Có lỗi xảy ra khi gọi API';
      const customError = new Error(errorMessage);
      customError.status = error.response.status;
      customError.response = error.response;
      return Promise.reject(customError);
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
