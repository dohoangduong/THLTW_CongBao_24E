"use client";

import React, { useState } from "react";
import StoreHeader from "@/components/StoreHeader";
import axiosClient from "@/services/axiosClient";
import {
  PhoneIcon,
  MailIcon,
  ShieldCheckIcon,
  RefreshCwIcon,
  ClockIcon,
  HelpCircleIcon,
  CheckIcon,
  MessageSquareIcon,
  AlertCircleIcon,
} from "@/components/Icons";

const FAQS = [
  {
    q: "Bảo Công Mobile cam kết hàng chính hãng 100% không?",
    a: "Tất cả sản phẩm bán tại Bảo Công Mobile (iPhone, Samsung, Xiaomi, OPPO...) đều là hàng chính hãng nguyên seal, có hóa đơn VAT điện tử và được bảo hành chính hãng tại các trung tâm bảo hành ủy quyền tại Việt Nam.",
  },
  {
    q: "Thời gian giao hàng tiêu chuẩn và hỏa tốc là bao lâu?",
    a: "Đơn hàng nội thành TP.HCM được giao hỏa tốc trong vòng 2 giờ. Các tỉnh thành khác trên toàn quốc được vận chuyển thông qua đối tác bưu chính (Viettel Post, GHTK) từ 1 - 3 ngày làm việc.",
  },
  {
    q: "Chính sách đổi mới trong trường hợp máy có lỗi phần cứng?",
    a: "Bảo Công Mobile áp dụng chính sách 1 đổi 1 trong vòng 30 ngày đầu tiên nếu máy phát sinh lỗi phần cứng do nhà sản xuất (được kỹ thuật viên hoặc trung tâm bảo hành hãng xác nhận).",
  },
  {
    q: "Cửa hàng có hỗ trợ chương trình Thu Cũ Đổi Mới (Trade-in) không?",
    a: "Có! Chúng tôi hỗ trợ thu mua lại máy cũ với định giá cao nhất thị trường, trợ giá lên đời đến 2.000.000 VNĐ cho quý khách nâng cấp sang dòng flagship mới.",
  },
];

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    order_code: "",
    subject: "Tư vấn sản phẩm & bảo hành",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // [THUẬT TOÁN GỬI PHIẾU HỖ TRỢ / LIÊN HỆ ĐỒNG BỘ MYSQL]:
  // Kiểm tra dữ liệu hợp lệ (tên, SĐT, nội dung) và gửi lên API POST /api/support-tickets để lưu vào MySQL.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!formData.name.trim()) {
      setErrorMsg("Vui lòng nhập họ và tên của bạn.");
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMsg("Vui lòng cung cấp số điện thoại để shop tiện liên hệ.");
      return;
    }
    if (!formData.message.trim() || formData.message.trim().length < 5) {
      setErrorMsg("Nội dung yêu cầu hỗ trợ phải có ít nhất 5 ký tự.");
      return;
    }

    setLoading(true);
    try {
      const res: any = await axiosClient.post("/support-tickets", formData);
      setSuccessMsg(res.message || "Gửi phiếu yêu cầu hỗ trợ thành công! Shop sẽ liên hệ bạn sớm nhất.");
      setFormData({
        name: "",
        phone: "",
        email: "",
        order_code: "",
        subject: "Tư vấn sản phẩm & bảo hành",
        message: "",
      });
    } catch (err: any) {
      console.error("Lỗi gửi phiếu hỗ trợ:", err);
      setErrorMsg(err.message || "Không thể gửi phiếu hỗ trợ. Vui lòng kiểm tra lại thông tin!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <StoreHeader />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Banner tiêu đề */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold tracking-wide uppercase mb-3 border border-blue-200">
            <HelpCircleIcon className="w-3.5 h-3.5" />
            <span>Trung Tâm Hỗ Trợ Khách Hàng</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-3">
            Bảo Công Mobile Sẵn Sàng Đồng Hành Cùng Bạn
          </h1>
          <p className="text-sm text-slate-600">
            Hỗ trợ giải đáp chính sách bảo hành, kiểm tra đơn hàng, tư vấn trả góp và giải quyết mọi thắc mắc 24/7.
          </p>
        </div>

        {/* 3 Thẻ Cam kết Dịch vụ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheckIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Bảo Hành Chính Hãng</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bảo hành 12 tháng tại các trung tâm ủy quyền toàn quốc. Cam kết linh kiện chính hãng 100%.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <RefreshCwIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">1 Đổi 1 Trong 30 Ngày</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Đổi ngay máy mới nếu phát sinh lỗi phần cứng từ nhà sản xuất trong vòng 30 ngày sử dụng.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <ClockIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Giao Nhanh 2 Giờ</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Giao hỏa tốc nội thành TP.HCM trong 2 tiếng. Miễn phí vận chuyển cho đơn hàng từ 5 triệu.
              </p>
            </div>
          </div>
        </div>

        {/* Khối chính 2 cột: Form gửi phiếu hỗ trợ + Câu hỏi thường gặp */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* CỘT TRÁI (7 cột): Form gửi phiếu hỗ trợ */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <MessageSquareIcon className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Gửi Yêu Cầu Hỗ Trợ Trực Tuyến</h2>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Phiếu hỗ trợ sẽ được lưu trực tiếp vào cơ sở dữ liệu hệ thống để nhân viên phản hồi trong vòng 30 phút.
            </p>

            {successMsg && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2.5">
                <CheckIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2.5">
                <AlertCircleIcon className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Họ và tên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Văn A"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số điện thoại <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ví dụ: 0988888888"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Địa chỉ Email
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mã đơn hàng (nếu có)
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: BC-20261002"
                    value={formData.order_code}
                    onChange={(e) => setFormData({ ...formData, order_code: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chủ đề cần hỗ trợ <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer font-medium"
                >
                  <option value="Tư vấn sản phẩm & bảo hành">Tư vấn sản phẩm & bảo hành</option>
                  <option value="Kiểm tra tình trạng đơn hàng">Kiểm tra tình trạng đơn hàng</option>
                  <option value="Thu cũ đổi mới (Trade-in)">Thu cũ đổi mới (Trade-in)</option>
                  <option value="Yêu cầu bảo hành / đổi trả">Yêu cầu bảo hành / đổi trả</option>
                  <option value="Yêu cầu xuất hóa đơn VAT công ty">Yêu cầu xuất hóa đơn VAT công ty</option>
                  <option value="Góp ý & phản ánh chất lượng dịch vụ">Góp ý & phản ánh chất lượng dịch vụ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nội dung chi tiết <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Vui lòng mô tả chi tiết yêu cầu hoặc tình trạng sản phẩm của bạn..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? "Đang gửi yêu cầu..." : "Gửi phiếu yêu cầu hỗ trợ ngay"}
              </button>
            </form>
          </div>

          {/* CỘT PHẢI (5 cột): Thông tin liên hệ & FAQ */}
          <div className="lg:col-span-5 space-y-6">
            {/* Box Liên hệ trực tiếp */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                Kênh Liên Hệ Trực Tiếp
              </h3>
              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <PhoneIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-slate-400 font-medium">Hotline tư vấn miễn phí:</div>
                    <div className="text-sm font-bold text-slate-900 font-mono">1800 6868 (8:00 - 21:30)</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                    <MailIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-slate-400 font-medium">Email CSKH & Khiếu nại:</div>
                    <div className="text-sm font-bold text-slate-900 font-mono">hotro@baocongmobile.vn</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <ClockIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-slate-400 font-medium">Cửa hàng trải nghiệm:</div>
                    <div className="text-slate-800 font-semibold">123 Đường Ba Tháng Hai, Phường 11, Quận 10, TP.HCM</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Box Câu hỏi thường gặp (FAQ) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
                Câu Hỏi Thường Gặp (FAQ)
              </h3>
              <div className="divide-y divide-slate-100">
                {FAQS.map((faq, index) => (
                  <div key={index} className="py-3">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full text-left font-semibold text-xs text-slate-800 hover:text-blue-600 flex items-center justify-between gap-2"
                    >
                      <span>{faq.q}</span>
                      <span className="text-slate-400 font-mono text-sm">
                        {openFaq === index ? "−" : "+"}
                      </span>
                    </button>
                    {openFaq === index && (
                      <p className="mt-2 text-xs text-slate-500 leading-relaxed pr-2">
                        {faq.a}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
