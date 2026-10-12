/**
 * Đọc cụm 3 chữ số thành chữ tiếng Việt (trăm, chục, đơn vị)
 * @param {string} threeDigitsStr - Chuỗi 1 đến 3 chữ số
 * @param {boolean} isHighestGroup - Có phải là nhóm có giá trị cao nhất trong số không
 * @returns {string}
 */
function readThreeDigits(threeDigitsStr, isHighestGroup) {
  const num = parseInt(threeDigitsStr, 10);
  if (num === 0) return '';

  const DIGITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const str = threeDigitsStr.padStart(3, '0');
  const h = parseInt(str[0], 10);
  const t = parseInt(str[1], 10);
  const u = parseInt(str[2], 10);

  const result = [];

  // 1. Hàng trăm
  if (!isHighestGroup || h > 0) {
    result.push(DIGITS[h] + ' trăm');
  }

  // 2. Hàng chục
  if (t > 1) {
    result.push(DIGITS[t] + ' mươi');
  } else if (t === 1) {
    result.push('mười');
  } else if (t === 0 && u > 0 && (!isHighestGroup || h > 0)) {
    result.push('lẻ');
  }

  // 3. Hàng đơn vị
  if (u > 0) {
    if (u === 1) {
      if (t > 1) {
        result.push('mốt');
      } else {
        result.push('một');
      }
    } else if (u === 5) {
      if (t > 0) {
        result.push('lăm');
      } else {
        result.push('năm');
      }
    } else {
      result.push(DIGITS[u]);
    }
  }

  return result.join(' ');
}

/**
 * Chuyển đổi số tiền thành chữ Tiếng Việt
 * Hỗ trợ các con số lớn lên đến hàng tỷ, nghìn tỷ
 *
 * @param {number|string} value - Số tiền cần đọc
 * @param {object} [options]
 * @param {boolean} [options.capitalize=true] - Viết hoa chữ cái đầu tiên
 * @param {string} [options.suffix=' đồng'] - Đơn vị tiền tệ thêm ở đuôi
 * @returns {string} - Chuỗi văn bản đọc số tiền
 */
export function numberToVietnameseWords(value, options = {}) {
  const { capitalize = true, suffix = ' đồng' } = options;

  if (value === null || value === undefined || value === '') {
    return '';
  }

  // Tách bỏ hoàn toàn phần thập phân (.00) nếu có
  const intPart = String(value).split('.')[0];
  const cleanStr = intPart.replace(/\D/g, '');
  if (!cleanStr) return '';

  // Xóa các số 0 thừa ở đầu
  const trimmedStr = cleanStr.replace(/^0+/, '');
  if (!trimmedStr) {
    const zeroText = 'không' + suffix;
    return capitalize ? zeroText.charAt(0).toUpperCase() + zeroText.slice(1) : zeroText;
  }

  // Các cấp bậc hàng (3 chữ số một nhóm)
  const SCALES = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ', 'tỷ tỷ'];

  // Cắt thành các nhóm 3 chữ số từ phải sang trái
  const chunks = [];
  for (let i = trimmedStr.length; i > 0; i -= 3) {
    chunks.push(trimmedStr.substring(Math.max(0, i - 3), i));
  }

  const words = [];
  for (let i = chunks.length - 1; i >= 0; i--) {
    const chunkStr = chunks[i];
    const isHighestGroup = (i === chunks.length - 1);
    const chunkWord = readThreeDigits(chunkStr, isHighestGroup);

    if (chunkWord) {
      const scale = SCALES[i] ? ' ' + SCALES[i] : '';
      words.push(chunkWord + scale);
    }
  }

  if (words.length === 0) {
    const zeroText = 'không' + suffix;
    return capitalize ? zeroText.charAt(0).toUpperCase() + zeroText.slice(1) : zeroText;
  }

  let finalStr = words.join(' ').replace(/\s+/g, ' ').trim() + suffix;
  if (capitalize) {
    finalStr = finalStr.charAt(0).toUpperCase() + finalStr.slice(1);
  }

  return finalStr;
}

/**
 * Định dạng chuỗi số thành dạng có dấu phẩy phân cách hàng nghìn (ví dụ: 1000000 hoặc "1000000.00" -> "1,000,000")
 * Xóa bỏ hoàn toàn số lẻ thập phân (.00)
 * @param {number|string} val
 * @returns {string}
 */
export function formatVND(val) {
  if (val === null || val === undefined || val === '') return '';
  // Cắt bỏ phần thập phân (.00) nếu có
  const intPart = String(val).split('.')[0];
  const cleanStr = intPart.replace(/\D/g, '');
  if (!cleanStr) return '';
  return new Intl.NumberFormat('en-US').format(Number(cleanStr));
}

/**
 * Lấy số nguyên gốc từ chuỗi nhập hoặc dữ liệu API (ví dụ "1,000,000" hoặc "1000000.00" -> 1000000)
 * @param {number|string} val
 * @returns {number|string}
 */
export function parseVND(val) {
  if (val === null || val === undefined || val === '') return '';
  const intPart = String(val).split('.')[0];
  const cleanDigits = intPart.replace(/\D/g, '');
  return cleanDigits ? parseInt(cleanDigits, 10) : '';
}
