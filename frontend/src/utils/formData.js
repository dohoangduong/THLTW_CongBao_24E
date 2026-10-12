/**
 * Khi form có upload ảnh, phải gửi bằng FormData (multipart/form-data) chứ không phải JSON.
 *
 * LƯU Ý QUAN TRỌNG:
 *  - axiosClient đặt sẵn 'Content-Type: application/json'. Nếu gửi FormData mà không ghi đè,
 *    axios sẽ chuyển FormData thành JSON và MẤT file ảnh -> luôn truyền kèm MULTIPART.
 *  - PHP/Laravel không đọc được body multipart của request PUT, nên khi SỬA ta gửi POST
 *    kèm trường _method=PUT (Laravel tự hiểu là PUT).
 */
export const MULTIPART = { headers: { 'Content-Type': 'multipart/form-data' } };

export function toFormData(values, { method } = {}) {
  const fd = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined) return;                 // bỏ qua: không gửi
    if (value === null) fd.append(key, '');          // rỗng -> Laravel đổi thành null
    else if (typeof value === 'boolean') fd.append(key, value ? '1' : '0');
    else if (value instanceof File) fd.append(key, value);
    else fd.append(key, String(value));
  });

  if (method) fd.append('_method', method);
  return fd;
}
