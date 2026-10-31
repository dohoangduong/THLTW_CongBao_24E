"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const savedUserStr = localStorage.getItem('user');

      if (!token || !savedUserStr) {
        router.replace('/admin/login');
        return;
      }

      try {
        const user = JSON.parse(savedUserStr);
        if (user && user.role === 'admin') {
          router.replace('/admin/don-hang');
        } else {
          router.replace('/admin/login');
        }
      } catch {
        router.replace('/admin/login');
      }
    }
  }, [router]);

  return null;
}
