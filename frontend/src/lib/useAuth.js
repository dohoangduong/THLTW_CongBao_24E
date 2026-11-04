"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearToken, getToken } from "./api";
import axiosClient from "@/services/axiosClient";

/**
 * Bắt buộc đăng nhập. Chưa đăng nhập thì chuyển sang /login.
 * Truyền { admin: true } để chỉ cho phép quản trị viên / nhân viên.
 */
export function useAuth({ admin = false } = {}) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    // Đọc ngay từ localStorage để trang hiển thị tức thì, không bị delay
    const savedUserStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (savedUserStr) {
      try {
        const u = JSON.parse(savedUserStr);
        if (admin && !["admin", "manager"].includes(u.role)) {
          router.replace("/trangchu");
          return;
        }
        setUser(u);
        setLoading(false);
      } catch {}
    }

    axiosClient
      .get("/user")
      .then((res) => {
        const u = res?.user || res?.data || res;
        if (admin && !["admin", "manager"].includes(u.role)) {
          router.replace("/trangchu");
          return;
        }
        setUser(u);
      })
      .catch(() => {
        clearToken();
        router.replace("/login");
      })
      .finally(() => setLoading(false));
  }, [router, admin]);

  return { user, setUser, loading };
}

