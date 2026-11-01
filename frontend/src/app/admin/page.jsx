"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      const savedUserStr = localStorage.getItem("user");

      if (!token || !savedUserStr) {
        router.replace("/login");
        return;
      }

      try {
        const user = JSON.parse(savedUserStr);
        if (user && user.role === "admin") {
          router.replace("/admin/don-hang");
        } else {
          router.replace("/trangchu");
        }
      } catch {
        router.replace("/login");
      }
    }
  }, [router]);

  return null;
}
