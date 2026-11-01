"use client";

import React, { useState } from "react";
import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";
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
  AwardIcon,
  CreditCardIcon,
  TruckIcon,
  FileTextIcon,
} from "@/components/Icons";

const FAQS = [
  {
    q: "Bảo Công Studio cam kết hàng chính hãng 100% không?",
    a: "Tất cả thiết bị bán tại Bảo Công Studio (iPhone, iPad, Samsung Galaxy, Xiaomi, OPPO...) đều là hàng chính hãng phân phối chính thức tại Việt Nam, nguyên seal 100%, có hóa đơn VAT điện tử và được bảo hành tại các trung tâm bảo hành ủy quyền (Apple AASP, Samsung Care, Xiaomi Authorized).",
  },
  {
    q: "Thời gian giao hàng tiêu chuẩn và hỏa tốc là bao lâu?",
    a: "Đơn hàng nội thành TP.HCM được giao hỏa tốc trong vòng 2 giờ kể từ khi xác nhận. Các tỉnh thành khác trên toàn quốc được vận chuyển thông qua đối tác bưu chính chuyên nghiệp (Viettel Post, GHTK) từ 1 - 3 ngày làm việc.",
  },
  {
    q: "Chính sách 1 đổi 1 trong 30 ngày đầu áp dụng như thế nào?",
    a: "Khách hàng được quyền 1 đổi 1 máy mới tương đương trong vòng 30 ngày đầu tiên nếu máy phát sinh bất kỳ lỗi phần cứng nào do nhà sản xuất (được kỹ thuật viên hoặc trung tâm bảo hành hãng thẩm định xác nhận).",
  },
  {
    q: "Cửa hàng có hỗ trợ chương trình Thu Cũ Đổi Mới (Trade-in) không?",
    a: "Có! Chúng tôi hỗ trợ thu mua lại máy cũ với định giá minh bạch và cao nhất thị trường, đồng thời trợ giá trực tiếp lên đời đến 2.000.000 VNĐ cho khách hàng nâng cấp sang các dòng flagship mới.",
  },
  {
    q: "Các hình thức thanh toán và trả góp tại Bảo Công Studio?",
    a: "Chúng tôi hỗ trợ đa dạng phương thức: Tiền mặt khi nhận hàng (COD), Chuyển khoản ngân hàng, Quẹt thẻ POS tại cửa hàng, và Trả góp 0% lãi suất qua thẻ tín dụng hơn 25 ngân hàng hoặc qua công ty tài chính.",
  },
];

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<"about" | "purchase" | "warranty">("about");

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

  // [THUẬT TOÁN GỬI PHIẾU HỖ TRỢ ĐỒNG BỘ CSDL MYSQL]:
  // Kiểm tra dữ liệu đầu vào và gửi POST /api/support-tickets để lưu trữ phiếu hỗ trợ vào bảng support_tickets trong MySQL.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!formData.name.trim()) {
      setErrorMsg("Vui lòng nhập họ và tên của bạn.");
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMsg("Vui lòng cung cấp số điện thoại để trung tâm tiện liên hệ.");
      return;
    }
    if (!formData.message.trim() || formData.message.trim().length < 5) {
      setErrorMsg("Nội dung yêu cầu hỗ trợ phải có ít nhất 5 ký tự.");
      return;
    }

    setLoading(true);
    try {
      const res: any = await axiosClient.post("/support-tickets", formData);
      setSuccessMsg(res.message || "Gửi phiếu yêu cầu hỗ trợ thành công! Chuyên viên CSKH sẽ liên hệ lại bạn trong 30 phút.");
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
        {/* =========================================================================
            1. BANNER TIÊU ĐỀ SWISS MONOCHROME TECH
            ========================================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-100 text-zinc-900 border border-zinc-200 text-xs font-bold tracking-wide uppercase mb-3 shadow-2xs">
            <HelpCircleIcon className="w-3.5 h-3.5 text-zinc-900" />
            <span>Trung Tâm Hỗ Trợ &amp; Dịch Vụ Khách Hàng</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight mb-3">
            Bảo Công Studio — Trung Tâm Hỗ Trợ &amp; Chính Sách Khách Hàng
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
            Tra cứu chính sách bảo hành chính hãng 12 tháng, quy định đổi mới 30 ngày, hướng dẫn trả góp 0%, và gửi yêu cầu giải quyết kỹ thuật trực tuyến 24/7.
          </p>
        </div>

        {/* =========================================================================
            2. 3 THẺ CAM KẾT DỊCH VỤ CỐT LÕI (MONOCHROME ICONS)
            ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 border border-zinc-200/90 shadow-2xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 text-white flex items-center justify-center shrink-0 shadow-xs border border-zinc-800">
              <ShieldCheckIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 mb-1">Bảo Hành 12 Tháng Chính Hãng</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Tiếp nhận bảo hành tại các trung tâm ủy quyền toàn quốc. Cam kết 100% linh kiện chính hãng từ nhà sản xuất.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-zinc-200/90 shadow-2xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 text-white flex items-center justify-center shrink-0 shadow-xs border border-zinc-800">
              <RefreshCwIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 mb-1">1 Đổi 1 Trong 30 Ngày</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Đổi ngay thiết bị mới nguyên hộp nếu phát sinh lỗi phần cứng từ nhà sản xuất trong vòng 30 ngày sử dụng đầu tiên.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-zinc-200/90 shadow-2xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 text-white flex items-center justify-center shrink-0 shadow-xs border border-zinc-800">
              <ClockIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 mb-1">Giao Nhanh Hỏa Tốc 2 Giờ</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Giao hàng siêu tốc nội thành trong 2 giờ. Khách hàng được quyền đồng kiểm tra ngoại quan máy trước khi thanh toán.
              </p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. KHU VỰC THÔNG TIN TRANG ĐƠN (GIỚI THIỆU & CÁC CHÍNH SÁCH MUA HÀNG)
            ========================================================================= */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/90 shadow-2xs mb-12">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-zinc-200 pb-4 mb-6 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab("about")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === "about"
                  ? "bg-zinc-900 text-white shadow-xs"
                  : "bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200"
              }`}
            >
              <AwardIcon className="w-4 h-4" />
              <span>1. Giới Thiệu Bảo Công Studio</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("purchase")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === "purchase"
                  ? "bg-zinc-900 text-white shadow-xs"
                  : "bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200"
              }`}
            >
              <CreditCardIcon className="w-4 h-4" />
              <span>2. Chính Sách Mua Hàng &amp; Thanh Toán</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("warranty")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === "warranty"
                  ? "bg-zinc-900 text-white shadow-xs"
                  : "bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200"
              }`}
            >
              <ShieldCheckIcon className="w-4 h-4" />
              <span>3. Chính Sách Bảo Hành &amp; Đổi Trả</span>
            </button>
          </div>

          {/* Tab 1: Giới thiệu Bảo Công Studio */}
          {activeTab === "about" && (
            <div className="space-y-4 animate-in fade-in duration-200 text-xs sm:text-sm text-zinc-600 leading-relaxed">
              <div className="flex items-center gap-2 text-zinc-900 font-bold text-base">
                <FileTextIcon className="w-5 h-5 text-zinc-900" />
                <span>Giới Thiệu Về Hệ Thống Bảo Công Studio</span>
              </div>
              <p>
                <strong>Bảo Công Studio</strong> được thành lập với mục tiêu trở thành điểm đến mua sắm tin cậy hàng đầu cho các tín đồ công nghệ cao cấp tại Việt Nam. Chúng tôi chuyên phân phối các thiết bị di động thông minh, máy tính bảng và phụ kiện công nghệ chính hãng từ các thương hiệu hàng đầu thế giới: <strong>Apple, Samsung, Xiaomi, OPPO, Vivo, Realme</strong>.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                  <div className="font-bold text-zinc-900 text-xs uppercase tracking-wider">Hàng Chính Hãng 100%</div>
                  <p className="text-xs text-zinc-500">Mọi sản phẩm bán ra đều có nguồn gốc xuất xứ rõ ràng, đầy đủ hóa đơn VAT điện tử và nguyên tem niêm phong.</p>
                </div>
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                  <div className="font-bold text-zinc-900 text-xs uppercase tracking-wider">Giá Cạnh Tranh Nhất</div>
                  <p className="text-xs text-zinc-500">Tối ưu chi phí vận hành trực tuyến để mang đến mức giá ưu đãi nhất cùng quà tặng giá trị cho khách hàng.</p>
                </div>
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                  <div className="font-bold text-zinc-900 text-xs uppercase tracking-wider">Đội Ngũ Chuyên Nghiệp</div>
                  <p className="text-xs text-zinc-500">Đội ngũ kỹ thuật viên am hiểu sâu sắc về sản phẩm, tư vấn tận tâm và giải đáp thắc mắc nhanh chóng.</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Chính sách mua hàng & Thanh toán */}
          {activeTab === "purchase" && (
            <div className="space-y-4 animate-in fade-in duration-200 text-xs sm:text-sm text-zinc-600 leading-relaxed">
              <div className="flex items-center gap-2 text-zinc-900 font-bold text-base">
                <CreditCardIcon className="w-5 h-5 text-zinc-900" />
                <span>Quy Định Đặt Hàng &amp; Phương Thức Thanh Toán</span>
              </div>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Thanh toán trực tiếp khi nhận hàng (COD):</strong> Quý khách được phép mở hộp kiểm tra ngoại quan máy, đúng mẫu mã, màu sắc và dung lượng đã đặt trước khi thanh toán tiền mặt cho nhân viên giao hàng.
                </li>
                <li>
                  <strong>Chuyển khoản qua tài khoản ngân hàng:</strong> Hệ thống cung cấp mã QR chuyển khoản nhanh 24/7 theo từng mã đơn hàng, xác nhận tức thì qua tin nhắn và email.
                </li>
                <li>
                  <strong>Trả góp 0% lãi suất:</strong> Áp dụng cho thẻ tín dụng (Visa, MasterCard, JCB) của hơn 25 ngân hàng liên kết, kỳ hạn linh hoạt 3, 6, 9, 12 tháng không phụ phí phát sinh ẩn.
                </li>
                <li>
                  <strong>Xuất hóa đơn VAT điện tử:</strong> Hỗ trợ xuất hóa đơn công ty hoặc cá nhân theo đúng thông tin đăng ký trong vòng 24 giờ sau khi hoàn tất đơn hàng.
                </li>
              </ul>
            </div>
          )}

          {/* Tab 3: Chính sách bảo hành & Đổi trả */}
          {activeTab === "warranty" && (
            <div className="space-y-4 animate-in fade-in duration-200 text-xs sm:text-sm text-zinc-600 leading-relaxed">
              <div className="flex items-center gap-2 text-zinc-900 font-bold text-base">
                <ShieldCheckIcon className="w-5 h-5 text-zinc-900" />
                <span>Chính Sách Bảo Hành &amp; Điều Kiện 1 Đổi 1 Trong 30 Ngày</span>
              </div>
              <div className="space-y-3">
                <p>
                  Nhằm mang lại sự an tâm tuyệt đối khi mua sắm, Bảo Công Studio áp dụng chính sách hậu mãi vượt trội:
                </p>
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                  <div className="font-bold text-zinc-900 text-xs uppercase tracking-wider text-emerald-700">
                    Quy định 1 Đổi 1 Trong 30 Ngày Đầu:
                  </div>
                  <p className="text-xs text-zinc-600">
                    Nếu thiết bị phát sinh lỗi kỹ thuật phần cứng (màn hình, nguồn, camera, loa, mic, sạc...) do nhà sản xuất trong vòng 30 ngày kể từ ngày nhận hàng, quý khách được đổi ngay 01 máy mới tương đương cùng model, màu sắc và dung lượng.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                  <div className="font-bold text-zinc-900 text-xs uppercase tracking-wider text-zinc-800">
                    Bảo Hành Chính Hãng 12 Tháng:
                  </div>
                  <p className="text-xs text-zinc-600">
                    Sau 30 ngày đầu, máy được bảo hành tiêu chuẩn 12 tháng tại các trung tâm bảo hành ủy quyền của hãng trên toàn quốc. Đội ngũ CSKH của Bảo Công Studio sẵn sàng hỗ trợ gửi máy và nhận máy hộ quý khách hoàn toàn miễn phí.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* =========================================================================
            4. FORM GỬI YÊU CẦU HỖ TRỢ TRỰC TUYẾN & THÔNG TIN LIÊN HỆ
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* CỘT TRÁI (7 cột): Form gửi phiếu hỗ trợ lưu vào MySQL */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/90 shadow-2xs">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center shadow-xs">
                <MessageSquareIcon className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900">Gửi Yêu Cầu Hỗ Trợ Trực Tuyến</h2>
            </div>
            <p className="text-xs text-zinc-500 mb-6">
              Mọi yêu cầu hỗ trợ sẽ được lưu trữ trực tiếp vào cơ sở dữ liệu MySQL và phân bổ cho kỹ thuật viên phản hồi trong vòng 30 phút.
            </p>

            {successMsg && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2.5">
                <CheckIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2.5">
                <AlertCircleIcon className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Họ và tên của bạn <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Hoàng Gia Bảo"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Số điện thoại liên hệ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ví dụ: 0988888888"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Địa chỉ Email (nhận phản hồi)
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Mã đơn hàng liên quan (nếu có)
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: BC-20261001"
                    value={formData.order_code}
                    onChange={(e) => setFormData({ ...formData, order_code: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Chủ đề yêu cầu <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all cursor-pointer font-medium"
                >
                  <option value="Tư vấn sản phẩm & bảo hành">Tư vấn sản phẩm &amp; chính sách bảo hành</option>
                  <option value="Kiểm tra tình trạng đơn hàng">Kiểm tra tình trạng giao vận đơn hàng</option>
                  <option value="Thu cũ đổi mới (Trade-in)">Thu cũ đổi mới trợ giá lên đời (Trade-in)</option>
                  <option value="Yêu cầu bảo hành / đổi trả">Yêu cầu bảo hành / 1 đổi 1 trong 30 ngày</option>
                  <option value="Yêu cầu xuất hóa đơn VAT công ty">Yêu cầu cấp phát hóa đơn VAT điện tử</option>
                  <option value="Góp ý & phản ánh chất lượng dịch vụ">Góp ý &amp; phản ánh chất lượng dịch vụ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Nội dung chi tiết yêu cầu <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Vui lòng mô tả chi tiết yêu cầu kỹ thuật hoặc tình trạng thiết bị cần hỗ trợ..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors shadow-xs disabled:opacity-50"
              >
                {loading ? "Đang gửi yêu cầu vào hệ thống..." : "Gửi Yêu Cầu Hỗ Trợ Ngay"}
              </button>
            </form>
          </div>

          {/* CỘT PHẢI (5 cột): Thông tin liên hệ trực tiếp & FAQ */}
          <div className="lg:col-span-5 space-y-6">
            {/* Box Liên hệ trực tiếp */}
            <div className="bg-white rounded-3xl p-6 border border-zinc-200/90 shadow-2xs">
              <h3 className="text-sm font-bold text-zinc-900 mb-4 pb-2 border-b border-zinc-100 uppercase tracking-wider text-[11px]">
                Kênh Liên Hệ Khách Hàng
              </h3>
              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-200 flex items-center justify-center shrink-0">
                    <PhoneIcon className="w-4 h-4 text-zinc-900" />
                  </div>
                  <div>
                    <div className="text-zinc-500 font-medium">Hotline CSKH miễn cước:</div>
                    <div className="text-sm font-bold text-zinc-900 font-mono">1800 6868 (8:00 - 21:30)</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-200 flex items-center justify-center shrink-0">
                    <MailIcon className="w-4 h-4 text-zinc-900" />
                  </div>
                  <div>
                    <div className="text-zinc-500 font-medium">Email hỗ trợ kỹ thuật:</div>
                    <div className="text-sm font-bold text-zinc-900 font-mono">hotro@baocongstudio.vn</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-200 flex items-center justify-center shrink-0">
                    <ClockIcon className="w-4 h-4 text-zinc-900" />
                  </div>
                  <div>
                    <div className="text-zinc-500 font-medium">Showroom trải nghiệm:</div>
                    <div className="text-zinc-800 font-semibold">123 Đường Ba Tháng Hai, Phường 11, Quận 10, TP.HCM</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Box Câu hỏi thường gặp (FAQ) */}
            <div className="bg-white rounded-3xl p-6 border border-zinc-200/90 shadow-2xs">
              <h3 className="text-sm font-bold text-zinc-900 mb-3 pb-2 border-b border-zinc-100 uppercase tracking-wider text-[11px]">
                Câu Hỏi Thường Gặp (FAQ)
              </h3>
              <div className="divide-y divide-zinc-100">
                {FAQS.map((faq, index) => (
                  <div key={index} className="py-3">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full text-left font-semibold text-xs text-zinc-800 hover:text-zinc-950 flex items-center justify-between gap-2"
                    >
                      <span>{faq.q}</span>
                      <span className="text-zinc-400 font-mono text-sm">
                        {openFaq === index ? "−" : "+"}
                      </span>
                    </button>
                    {openFaq === index && (
                      <p className="mt-2 text-xs text-zinc-500 leading-relaxed pr-2">
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

      {/* FOOTER ĐỒNG BỘ 4 CỘT */}
      <StoreFooter />
    </div>
  );
}
