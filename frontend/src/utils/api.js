export const API_URL = 'http://localhost:8000/api';

export const apiFetch = async (endpoint, options = {}) => {
  // Lấy token từ localStorage (chỉ chạy ở client)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {}),
  };

  // Đính kèm Token vào header
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Xử lý lỗi tự động
  if (!response.ok) {
    // Nếu lỗi 401 Unauthorized, có thể redirect về trang login hoặc xoá token
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        // window.location.href = '/login'; // Bỏ comment nếu có trang đăng nhập
      }
    }
    
    // Cố gắng đọc message lỗi từ backend trả về
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Có lỗi xảy ra khi gọi API');
  }

  // Nếu request thành công (204 No Content cho DELETE, hoặc 2xx khác)
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
};
