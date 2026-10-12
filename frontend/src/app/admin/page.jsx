"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axiosClient from '@/services/axiosClient';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    productsCount: 0,
    categoriesCount: 0,
    brandsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [prodRes, catRes, brandRes] = await Promise.allSettled([
          axiosClient.get('/products'),
          axiosClient.get('/categories'),
          axiosClient.get('/brands'),
        ]);

        const prodData = prodRes.status === 'fulfilled' ? (prodRes.value.meta?.total || prodRes.value.data?.length || 0) : 0;
        const catData = catRes.status === 'fulfilled' ? (catRes.value.data?.length || 0) : 0;
        const brandData = brandRes.status === 'fulfilled' ? (brandRes.value.data?.length || 0) : 0;

        setStats({
          productsCount: prodData,
          categoriesCount: catData,
          brandsCount: brandData,
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-800 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-extrabold tracking-tight">Chào mừng đến với Admin Panel 👋</h1>
        <p className="mt-2 text-blue-100 max-w-2xl text-sm leading-relaxed">
          Hệ thống quản trị website bán điện thoại di động Bảo Công. Bạn có thể theo dõi và quản lý nhanh sản phẩm, danh mục và thương hiệu tại đây.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sản phẩm */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Tổng sản phẩm</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">
                {loading ? '...' : stats.productsCount}
              </h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link href="/admin/san-pham" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5">
              Quản lý sản phẩm &rarr;
            </Link>
          </div>
        </div>

        {/* Danh mục */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Tổng danh mục</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">
                {loading ? '...' : stats.categoriesCount}
              </h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link href="/admin/danh-muc" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5">
              Quản lý danh mục &rarr;
            </Link>
          </div>
        </div>

        {/* Thương hiệu */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Tổng thương hiệu</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">
                {loading ? '...' : stats.brandsCount}
              </h3>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link href="/admin/thuong-hieu" className="text-sm font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1.5">
              Quản lý thương hiệu &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Lối tắt thao tác nhanh</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/admin/san-pham"
            className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-blue-50 hover:border-blue-200 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              +
            </div>
            <div>
              <div className="font-semibold text-slate-800 group-hover:text-blue-600">Thêm / Sửa Sản phẩm</div>
              <div className="text-xs text-slate-500">Cập nhật giá, ảnh, kho hàng</div>
            </div>
          </Link>

          <Link
            href="/admin/danh-muc"
            className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-emerald-50 hover:border-emerald-200 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              +
            </div>
            <div>
              <div className="font-semibold text-slate-800 group-hover:text-emerald-600">Thêm / Sửa Danh mục</div>
              <div className="text-xs text-slate-500">Phân loại các dòng điện thoại</div>
            </div>
          </Link>

          <Link
            href="/admin/thuong-hieu"
            className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-purple-50 hover:border-purple-200 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold">
              +
            </div>
            <div>
              <div className="font-semibold text-slate-800 group-hover:text-purple-600">Thêm / Sửa Thương hiệu</div>
              <div className="text-xs text-slate-500">Apple, Samsung, Xiaomi...</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
