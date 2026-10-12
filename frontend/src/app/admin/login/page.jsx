"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosClient from '@/services/axiosClient';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axiosClient.post('/login', formData);

      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token);
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        axiosClient.defaults.headers.common['Authorization'] = `Bearer ${response.access_token}`;
        router.push('/admin/san-pham');
      } else {
        setError('Đăng nhập thất bại: Không nhận được token xác thực.');
      }
    } catch (err) {
      setError(err.message || 'Đã có lỗi xảy ra. Vui lòng kiểm tra lại đường truyền.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-retro min-h-screen bg-[#008080] flex items-center justify-center p-4 font-sans text-xs">
      {/* Retro Window Dialog */}
      <div className="retro-window w-full max-w-md bg-[#d4d0c8]">
        {/* Titlebar */}
        <div className="retro-titlebar">
          <div className="font-bold">
            Đăng nhập hệ thống - Admin Panel
          </div>
        </div>

        {/* Dialog Content */}
        <div className="p-4 bg-[#d4d0c8]">
          <div className="mb-4 pb-3 border-b border-[#808080]">
            <div className="font-bold text-black text-sm">Xác thực quyền quản trị viên</div>
            <p className="text-gray-700 mt-0.5 text-xs">
              Vui lòng điền đúng địa chỉ Email và Mật khẩu hợp lệ để đăng nhập vào cơ sở dữ liệu.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-2 bg-red-100 border-2 border-red-700 text-red-900 text-xs">
              <b>Lỗi:</b> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-3 mb-5">
              <div className="grid grid-cols-3 items-center gap-2">
                <label className="text-right font-bold text-black">Email:</label>
                <div className="col-span-2">
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="retro-input w-full"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-2">
                <label className="text-right font-bold text-black">Mật khẩu:</label>
                <div className="col-span-2">
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="retro-input w-full"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Buttons Row */}
            <div className="pt-3 border-t border-[#ffffff] flex justify-end gap-2">
              <button
                type="submit"
                disabled={loading}
                className="retro-btn font-bold px-5 py-1"
              >
                {loading ? 'Đang xác thực...' : 'Đăng nhập'}
              </button>
              <button
                type="button"
                onClick={() => setFormData({ email: '', password: '' })}
                disabled={loading}
                className="retro-btn px-4 py-1"
              >
                Nhập lại
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
