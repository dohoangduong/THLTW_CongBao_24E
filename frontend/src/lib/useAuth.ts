"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, clearToken, getToken, UserInfo } from "./api";

/**
 * Bắt buộc đăng nhập. Chưa đăng nhập thì chuyển sang /login.
 * Truyền { admin: true } để chỉ cho phép quản trị viên / nhân viên.
 */
export function useAuth({ admin = false }: { admin?: boolean } = {}) {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }

    api<any>("/user")
      .then((res) => {
        const u: UserInfo = res?.user || res?.data || res;
        if (admin && !["admin", "manager"].includes(u.role)) {
          router.replace("/");
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
