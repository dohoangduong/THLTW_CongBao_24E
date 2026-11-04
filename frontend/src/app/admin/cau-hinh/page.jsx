"use client";
import React, { useState, useEffect } from "react";
import axiosClient from "@/services/axiosClient";
import {
  SettingsIcon,
  UploadIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  XIcon,
  RefreshCwIcon,
} from "@/components/Icons";

export default function AdminSettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  const [formData, setFormData] = useState({
    site_name: "Bảo Công Studio",
    logo: "",
    favicon: "",
    hotline: "1900 8888",
    email: "contact@baocong.vn",
    address: "Tòa nhà Tech Innovation, 123 Đường Công Nghệ, Quận 1, TP. Hồ Chí Minh",
    working_hours: "08:00 - 21:30 (Thứ 2 - Chủ Nhật)",
    facebook_url: "https://facebook.com/baocongstudio",
    youtube_url: "https://youtube.com/@baocongstudio",
    zalo_url: "https://zalo.me/0901234567",
    tiktok_url: "https://tiktok.com/@baocongstudio",
    meta_title: "Bảo Công Studio | Thiết bị công nghệ & Hệ sinh thái di động cao cấp",
    meta_description: "Phân phối chính hãng Flagship Apple iPhone 16 Pro Max, Samsung Galaxy S25 Ultra, phụ kiện cao cấp và dịch vụ bảo hành chuẩn hãng.",
    meta_keywords: "Bảo Công Studio, iPhone 16 Pro Max, Galaxy S25 Ultra, phụ kiện công nghệ",
    copyright_text: "© 2026 Bảo Công Studio. Tất cả các quyền được bảo lưu. Thiết kế theo tiêu chuẩn Swiss Monochrome.",
  });

  const [alertMsg, setAlertMsg] = useState(null);
  const showAlert = (message, type = "success") => {
    setAlertMsg({ message, type });
    setTimeout(() => setAlertMsg(null), 5000);
  };

  useEffect(() => {
    setMounted(true);
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/admin/settings");
      const d = res.data?.data || res.data || res;
      if (d && (d.site_name || d.hotline)) {
        setFormData({
          site_name: d.site_name || "",
          logo: d.logo || "",
          favicon: d.favicon || "",
          hotline: d.hotline || "",
          email: d.email || "",
          address: d.address || "",
          working_hours: d.working_hours || "",
          facebook_url: d.facebook_url || "",
          youtube_url: d.youtube_url || "",
          zalo_url: d.zalo_url || "",
          tiktok_url: d.tiktok_url || "",
          meta_title: d.meta_title || "",
          meta_description: d.meta_description || "",
          meta_keywords: d.meta_keywords || "",
          copyright_text: d.copyright_text || "",
        });
      }
    } catch (err) {
      console.error("Lỗi tải cài đặt:", err);
      showAlert("Lỗi tải thông tin cấu hình website", "error");
    } finally {
      setLoading(false);
    }
  };

  // Upload handler direct from PC (PNG/JPG <= 10MB)
  const handleFileUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/jpg", "image/x-icon", "image/svg+xml"].includes(file.type)) {
      alert("Chỉ chấp nhận file ảnh định dạng PNG hoặc JPG/JPEG (Tối đa 10MB)!");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("Dung lượng ảnh vượt quá 10MB!");
      return;
    }

    if (field === "logo") setUploadingLogo(true);
    if (field === "favicon") setUploadingFavicon(true);

    try {
      const uploadData = new FormData();
      uploadData.append("image", file);
      const res = await axiosClient.post("/admin/upload-image", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.url) {
        setFormData((prev) => ({ ...prev, [field]: res.url }));
        showAlert(`Tải lên ảnh ${field} thành công!`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Tải ảnh thất bại!";
      alert("Lỗi tải file: " + msg);
    } finally {
      if (field === "logo") setUploadingLogo(false);
      if (field === "favicon") setUploadingFavicon(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axiosClient.put("/admin/settings", formData);
      showAlert("Lưu cấu hình hệ thống website thành công!");
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Lỗi lưu cấu hình!";
      showAlert(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-zinc-900" />
            <h1 className="text-xl font-extrabold text-zinc-900 tracking-tight">
              Cấu hình Thông tin Website
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1 font-mono">
            Đồng bộ thông tin thương hiệu, Logo, Hotline, Mạng xã hội và Thẻ Meta SEO ra toàn hệ thống
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSettings}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-700 text-xs font-semibold hover:bg-zinc-50 transition shadow-2xs self-start sm:self-auto"
        >
          <RefreshCwIcon className="w-3.5 h-3.5" />
          <span>Tải lại</span>
        </button>
      </div>

      {/* ALERT NOTIFICATION */}
      {alertMsg && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs animate-in fade-in duration-200 ${
            alertMsg.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {alertMsg.type === "error" ? (
              <AlertCircleIcon className="w-4 h-4 text-rose-600" />
            ) : (
              <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
            )}
            <span className="font-semibold">{alertMsg.message}</span>
          </div>
          <button
            onClick={() => setAlertMsg(null)}
            className="p-1 hover:bg-black/5 rounded-md transition"
          >
            <XIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-zinc-400 font-mono text-xs">
          Đang tải dữ liệu cấu hình hệ thống...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: NHẬN DIỆN THƯƠNG HIỆU */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-2 uppercase tracking-wider font-mono">
              1. Nhận diện thương hiệu & Logo
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">
                  Tên website / Thương hiệu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.site_name}
                  onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Giờ làm việc Showroom</label>
                <input
                  type="text"
                  value={formData.working_hours}
                  onChange={(e) => setFormData({ ...formData, working_hours: e.target.value })}
                  placeholder="VD: 08:00 - 21:30 (Thứ 2 - CN)"
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900"
                />
              </div>
            </div>

            {/* LOGO & FAVICON UPLOAD */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-xs">
              {/* Logo */}
              <div className="space-y-2">
                <label className="block font-bold text-zinc-700">
                  Logo Website (Đầu trang & Chân trang)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="URL ảnh hoặc bấm tải lên..."
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    className="flex-1 px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 font-mono text-[11px]"
                  />
                  <label className="cursor-pointer px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg border border-zinc-300 font-semibold flex items-center gap-1.5 shrink-0 transition">
                    <UploadIcon className="w-3.5 h-3.5" />
                    <span>{uploadingLogo ? "Đang tải..." : "Tải ảnh (≤10MB)"}</span>
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "logo")}
                    />
                  </label>
                </div>
                {formData.logo && (
                  <div className="p-2 border border-zinc-200 rounded-lg bg-zinc-50 inline-block">
                    <img
                      src={formData.logo}
                      alt="Logo Preview"
                      className="h-10 object-contain max-w-[200px]"
                    />
                  </div>
                )}
              </div>

              {/* Favicon */}
              <div className="space-y-2">
                <label className="block font-bold text-zinc-700">
                  Favicon trình duyệt (Icon thanh tab)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="URL favicon hoặc bấm tải lên..."
                    value={formData.favicon}
                    onChange={(e) => setFormData({ ...formData, favicon: e.target.value })}
                    className="flex-1 px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 font-mono text-[11px]"
                  />
                  <label className="cursor-pointer px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg border border-zinc-300 font-semibold flex items-center gap-1.5 shrink-0 transition">
                    <UploadIcon className="w-3.5 h-3.5" />
                    <span>{uploadingFavicon ? "Đang tải..." : "Tải ảnh (≤10MB)"}</span>
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.ico"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "favicon")}
                    />
                  </label>
                </div>
                {formData.favicon && (
                  <div className="p-2 border border-zinc-200 rounded-lg bg-zinc-50 inline-block">
                    <img
                      src={formData.favicon}
                      alt="Favicon Preview"
                      className="w-6 h-6 object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: LIÊN HỆ & SHOWROOM */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-2 uppercase tracking-wider font-mono">
              2. Thông tin liên hệ & Showroom
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">
                  Hotline CSKH <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.hotline}
                  onChange={(e) => setFormData({ ...formData, hotline: e.target.value })}
                  placeholder="VD: 1900 8888"
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">
                  Hòm thư Email hỗ trợ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="VD: contact@baocong.vn"
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 font-mono"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-bold text-zinc-700 mb-1">Địa chỉ trụ sở chính & Showroom</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Địa chỉ văn phòng / showroom"
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900"
              />
            </div>
          </div>

          {/* SECTION 3: MẠNG XÃ HỘI */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-2 uppercase tracking-wider font-mono">
              3. Kênh mạng xã hội & Tương tác
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <label className="block font-bold text-zinc-700 mb-1 font-sans">Facebook Fanpage</label>
                <input
                  type="url"
                  value={formData.facebook_url}
                  onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                  placeholder="https://facebook.com/..."
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1 font-sans">Kênh YouTube</label>
                <input
                  type="url"
                  value={formData.youtube_url}
                  onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                  placeholder="https://youtube.com/@..."
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1 font-sans">Zalo OA / Chat</label>
                <input
                  type="url"
                  value={formData.zalo_url}
                  onChange={(e) => setFormData({ ...formData, zalo_url: e.target.value })}
                  placeholder="https://zalo.me/..."
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1 font-sans">Kênh TikTok</label>
                <input
                  type="url"
                  value={formData.tiktok_url}
                  onChange={(e) => setFormData({ ...formData, tiktok_url: e.target.value })}
                  placeholder="https://tiktok.com/@..."
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: THẺ META SEO & BẢN QUYỀN */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-2 uppercase tracking-wider font-mono">
              4. Cấu hình Meta SEO & Bản quyền chân trang
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Tiêu đề SEO mặc định (Meta Title)</label>
                <input
                  type="text"
                  value={formData.meta_title}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Mô tả SEO mặc định (Meta Description)</label>
                <textarea
                  rows="2"
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Từ khóa SEO (Meta Keywords)</label>
                <input
                  type="text"
                  value={formData.meta_keywords}
                  onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Dòng chữ bản quyền chân trang (Copyright)</label>
                <input
                  type="text"
                  value={formData.copyright_text}
                  onChange={(e) => setFormData({ ...formData, copyright_text: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900"
                />
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-lg bg-zinc-900 text-white font-bold text-xs hover:bg-zinc-800 disabled:opacity-50 transition shadow-sm"
            >
              {saving ? "Đang lưu cấu hình..." : "Lưu tất cả cấu hình"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

