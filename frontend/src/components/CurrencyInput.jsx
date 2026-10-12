"use client";

import React, { useRef } from 'react';
import { numberToVietnameseWords, formatVND } from '@/utils/numberToWords';

/**
 * Custom Component: CurrencyInput (Ô nhập tiền tệ phong cách Retro 2000s)
 * 
 * - Tự động format dấu phẩy hàng nghìn (1,000,000)
 * - Chặn toàn bộ ký tự chữ và số lẻ
 * - Chuyển đổi và hiển thị giá trị bằng chữ tiếng Việt bên dưới
 * - Trả về giá trị số nguyên gốc (chuỗi số không dấu phẩy) qua onChange
 */
export default function CurrencyInput({
  id,
  name,
  value,
  onChange,
  label,
  placeholder = 'VD: 1,000,000',
  required = false,
  disabled = false,
  className = '',
  containerClassName = '',
  showWords = true,
  ...restProps
}) {
  const inputRef = useRef(null);

  // Chuỗi hiển thị đã định dạng dấu phẩy
  const displayValue = formatVND(value);

  // Đọc thành chữ tiếng Việt
  const words = showWords ? numberToVietnameseWords(value) : '';

  // Chặn phím không hợp lệ (chỉ cho phép số và phím điều hướng / thao tác)
  const handleKeyDown = (e) => {
    // Cho phép các tổ hợp phím tắt như Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
    if (e.ctrlKey || e.metaKey) {
      return;
    }

    // Các phím điều hướng và chức năng hợp lệ
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
    ];

    if (allowedKeys.includes(e.key)) {
      return;
    }

    // Nếu không phải là chữ số 0-9 thì chặn sự kiện
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  // Xử lý khi người dùng gõ nội dung
  const handleChange = (e) => {
    // Tách bỏ phần thập phân (.00) nếu có và loại bỏ mọi ký tự không phải chữ số
    const rawDigits = e.target.value.split('.')[0].replace(/\D/g, '');
    
    // Chuyển thành số nguyên (integer) hoặc '' nếu để trống
    const intValue = rawDigits === '' ? '' : parseInt(rawDigits, 10);

    // Tạo đối tượng sự kiện giả lập chuẩn HTML input để Form dễ dàng xử lý e.target.value
    const syntheticEvent = {
      target: {
        id: id || name,
        name: name || '',
        value: intValue,
      },
      currentTarget: {
        id: id || name,
        name: name || '',
        value: intValue,
      },
      preventDefault: () => {},
      stopPropagation: () => {},
    };

    if (onChange) {
      // Truyền cả syntheticEvent và integer value
      onChange(syntheticEvent, intValue);
    }
  };

  // Xử lý dán (Paste) để lọc sạch chữ cái nếu có
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData ? e.clipboardData.getData('text') : '';
    const cleanDigits = pasteData.split('.')[0].replace(/\D/g, '');
    const intValue = cleanDigits === '' ? '' : parseInt(cleanDigits, 10);
    
    const syntheticEvent = {
      target: {
        id: id || name,
        name: name || '',
        value: intValue,
      },
      currentTarget: {
        id: id || name,
        name: name || '',
        value: intValue,
      },
      preventDefault: () => {},
      stopPropagation: () => {},
    };

    if (onChange) {
      onChange(syntheticEvent, intValue);
    }
  };

  return (
    <div className={`w-full ${containerClassName}`}>
      {/* Label nếu được cung cấp */}
      {label && (
        <label htmlFor={id || name} className="block font-bold text-black mb-1 select-none">
          {label} {required && <span className="text-red-700">*</span>}
        </label>
      )}

      {/* Input retro viền chìm */}
      <input
        ref={inputRef}
        id={id || name}
        name={name}
        type="text"
        inputMode="numeric"
        required={required}
        disabled={disabled}
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder={placeholder}
        autoComplete="off"
        className={`retro-input w-full text-right font-mono font-bold tracking-wider ${className}`}
        {...restProps}
      />

      {/* Dòng chữ đọc số tiền bằng tiếng Việt */}
      {showWords && (
        <div className="min-h-[18px] mt-1">
          {words ? (
            <p className="text-[11px] text-gray-700 italic font-sans leading-tight">
              Bằng chữ: <span className="text-[#0a246a] font-bold not-italic">{words}</span>
            </p>
          ) : (
            <p className="text-[10px] text-gray-400 italic font-sans leading-tight select-none">
              (Chưa nhập giá)
            </p>
          )}
        </div>
      )}
    </div>
  );
}
