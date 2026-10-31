import axios from 'axios';

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor: Tự động đính kèm Token và Accept header trước khi gửi request
axiosClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      config.headers.Accept = 'application/json';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Xử lý phản hồi và tự động xử lý 401 / 403
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;

      // Xử lý lỗi 401 (Unauthenticated / Hết hạn token) hoặc 403 (Forbidden)
      if (status === 401 || status === 403) {
        if (typeof window !== 'undefined') {
          // Xóa toàn bộ token & thông tin user đồng bộ
          localStorage.removeItem('token');
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');

          const pathname = window.location.pathname;

          // Nếu đang ở bất kỳ trang quản trị /admin/* nào (trừ /admin/login), chuyển hướng ngay về /admin/login
          if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
            window.location.replace('/admin/login');
          } 
          // Nếu đang ở các trang khách hàng yêu cầu xác thực
          else if (['/profile', '/orders', '/checkout'].some((p) => pathname.startsWith(p))) {
            window.location.replace('/login');
          }
        }
      }

      // Xử lý lỗi validation 422
      if (status === 422) {
        const errors = error.response.data?.errors;
        if (errors) {
          const errorMessages = Object.values(errors).flat();
          return Promise.reject(new Error(errorMessages.join('\n')));
        }
      }

      // Thông báo lỗi từ backend nếu có
      const errorMessage =
        error.response.data?.message ||
        (status === 401 ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' : 'Có lỗi xảy ra khi gọi API');
      const customError = new Error(errorMessage);
      customError.status = status;
      customError.response = error.response;
      return Promise.reject(customError);
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
