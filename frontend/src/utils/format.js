/**
 * Các hàm tiện ích định dạng dữ liệu dùng chung cho trang Admin.
 */

// Hiển thị tiền Việt Nam: 21990000 -> "21.990.000 ₫"
const vndFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

export const formatVND = (value) => {
  if (value === null || value === undefined || value === '') return '';
  const n = Number(value);
  return Number.isNaN(n) ? '' : vndFormatter.format(n);
};

// Chỉ giữ lại chữ số: "21.990.000 ₫" -> "21990000"
export const onlyDigits = (value) => String(value ?? '').replace(/\D/g, '');

// Dùng cho ô nhập tiền: gõ 21990000 -> hiện "21.990.000" (tối đa 12 chữ số)
export const formatMoneyInput = (value) => {
  const digits = onlyDigits(value).slice(0, 12);
  return digits ? Number(digits).toLocaleString('vi-VN') : '';
};

// Tạo slug từ tên (bỏ dấu tiếng Việt): "Điện thoại iPhone" -> "dien-thoai-iphone"
export const slugify = (text) =>
  String(text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
