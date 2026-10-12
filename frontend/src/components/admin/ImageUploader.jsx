"use client";

import { useEffect, useRef, useState } from 'react';

const MAX_SIZE_MB = 2;

/**
 * Chọn ảnh + xem trước.
 *  - currentUrl : URL ảnh đang có trên server (khi sửa)
 *  - file       : File mới vừa chọn (chưa upload)
 *  - removed    : người dùng bấm "Xóa ảnh"
 */
export default function ImageUploader({ label = 'Hình ảnh', currentUrl, file, removed, onPick, onRemove }) {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);

  // Tạo URL tạm để xem trước file vừa chọn, nhớ giải phóng khi đổi file / đóng form
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const shownUrl = previewUrl || (removed ? null : currentUrl);

  const handleChange = (e) => {
    const picked = e.target.files?.[0];
    e.target.value = ''; // cho phép chọn lại cùng 1 file
    if (!picked) return;

    if (!picked.type.startsWith('image/')) {
      setError('Vui lòng chọn file hình ảnh (jpg, png, webp, gif).');
      return;
    }
    if (picked.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Ảnh không được vượt quá ${MAX_SIZE_MB}MB.`);
      return;
    }
    setError(null);
    onPick(picked);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <div className="flex items-center gap-4">
        <div className="w-24 h-24 rounded-lg border border-dashed border-gray-300 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
          {shownUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shownUrl} alt="Xem trước" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-slate-400 text-center px-2">Chưa có ảnh</span>
          )}
        </div>

        <div className="space-y-2">
          <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-3.5 py-2 text-sm border border-gray-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {shownUrl ? 'Đổi ảnh' : 'Chọn ảnh'}
            </button>
            {shownUrl && (
              <button
                type="button"
                onClick={onRemove}
                className="px-3.5 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                Xóa ảnh
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400">JPG, PNG, WEBP, GIF — tối đa {MAX_SIZE_MB}MB</p>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
