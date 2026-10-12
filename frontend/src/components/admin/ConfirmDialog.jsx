"use client";

/**
 * Hộp thoại xác nhận dùng cho: chuyển vào thùng rác / khôi phục / xóa vĩnh viễn.
 * tone: 'danger' (đỏ) | 'primary' (xanh)
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = 'Đồng ý',
  tone = 'danger',
  loading = false,
  error = null,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  const btn = tone === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700';
  const icon = tone === 'danger' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600';

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="p-6">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${icon}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-slate-600 text-sm">{message}</p>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg border border-red-100 text-sm whitespace-pre-line">
              {error}
            </div>
          )}

          <div className="mt-8 flex justify-end gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`px-5 py-2.5 text-white rounded-lg font-medium transition-colors disabled:opacity-70 ${btn}`}
            >
              {loading ? 'Đang xử lý...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
