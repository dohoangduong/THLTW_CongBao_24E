"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL, clearToken, getToken } from "./api";
import type { Product } from "./shop";

export interface ShopUser {
  name: string;
  role: "admin" | "customer";
}

function authFetch(path: string, token: string, init: RequestInit = {}) {
  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });
}

/**
 * Trạng thái dùng chung cho các trang của khách: đăng nhập, số lượng giỏ hàng, thêm vào giỏ, thông báo.
 * Khách chưa đăng nhập vẫn xem được sản phẩm; bấm "Thêm vào giỏ" sẽ được chuyển tới /login.
 */
export function useShop() {
  const router = useRouter();
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<ShopUser | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);

  const showToast = useCallback((text: string, ok = true) => {
    setToast({ text, ok });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const loadAccount = useCallback(async (t: string) => {
    try {
      const [u, c] = await Promise.all([authFetch("/user", t), authFetch("/cart", t)]);
      if (u.status === 401) {
        clearToken();
        setTokenState(null);
        setUser(null);
        return;
      }
      setUser(await u.json());
      const cart = (await c.json()).cart;
      setCartCount(
        (cart?.items ?? []).reduce((s: number, i: { quantity: number }) => s + i.quantity, 0)
      );
    } catch {
      /* bỏ qua, giao diện vẫn dùng được */
    }
  }, []);

  useEffect(() => {
    const t = getToken();
    if (t) {
      setTokenState(t);
      loadAccount(t);
    }
  }, [loadAccount]);

  const addToCart = async (p: Product, quantity = 1) => {
    if (!token) {
      router.push("/login");
      return;
    }
    setAddingId(p.id);
    try {
      const res = await authFetch("/cart/add", token, {
        method: "POST",
        body: JSON.stringify({ product_id: p.id, quantity }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) {
        router.push("/login");
      } else if (!res.ok) {
        showToast(json.message ?? "Không thêm được vào giỏ", false);
      } else {
        setCartCount((n) => n + quantity);
        showToast(`Đã thêm ${p.name} vào giỏ`);
      }
    } catch {
      showToast("Mất kết nối máy chủ", false);
    } finally {
      setAddingId(null);
    }
  };

  const logout = async () => {
    if (token) await authFetch("/logout", token, { method: "POST" }).catch(() => {});
    clearToken();
    setTokenState(null);
    setUser(null);
    setCartCount(0);
    showToast("Đã đăng xuất");
  };

  return { token, user, cartCount, addingId, toast, addToCart, logout, showToast };
}

export type Shop = ReturnType<typeof useShop>;
