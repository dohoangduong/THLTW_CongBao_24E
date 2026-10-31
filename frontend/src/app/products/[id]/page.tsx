"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axiosClient from "@/services/axiosClient";
import StoreHeader from "@/components/StoreHeader";
import {
  StarIcon,
  ShoppingBagIcon,
  ShieldCheckIcon,
  RefreshCwIcon,
  ClockIcon,
  CheckIcon,
  AlertCircleIcon,
  MessageSquareIcon,
  TagIcon,
  ChevronRightIcon,
} from "@/components/Icons";

interface Product {
  id: number;
  name: string;
  slug?: string;
  sku?: string;
  price: number | string;
  sale_price?: number | string | null;
  description?: string;
  image?: string;
  stock?: number;
  featured?: boolean;
  category?: { id: number; name: string };
  brand?: { id: number; name: string };
}

interface ReviewItem {
  id: number;
  product_id: number;
  reviewer_name: string;
  reviewer_email?: string;
  rating: number;
  comment: string;
  admin_reply?: string | null;
  created_at: string;
}

interface RatingSummary {
  average: number;
  total: number;
  stars: Record<number, number>;
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [ratingSummary, setRatingSummary] = useState<RatingSummary>({
    average: 5.0,
    total: 0,
    stars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // State cho Form gửi đánh giá
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    reviewer_name: "",
    reviewer_email: "",
    comment: "",
  });
  const [reviewHoverStar, setReviewHoverStar] = useState<number | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [reviewError, setReviewError] = useState("");

  // Điền sẵn thông tin người dùng nếu đã đăng nhập
  useEffect(() => {
    if (typeof window !== "undefined") {
      const uStr = localStorage.getItem("user");
      if (uStr) {
        try {
          const u = JSON.parse(uStr);
          setReviewForm((prev) => ({
            ...prev,
            reviewer_name: u.name || "",
            reviewer_email: u.email || "",
          }));
        } catch {}
      }
    }
  }, []);

  // [THUẬT TOÁN TẢI CHI TIẾT SẢN PHẨM + SẢN PHẨM LIÊN QUAN + ĐÁNH GIÁ REVIEW]:
  // Gọi API GET /api/products/{id} để nhận đồng thời dữ liệu sản phẩm, mảng related_products và reviews từ MySQL.
  const loadProductData = () => {
    if (!id) return;
    setLoading(true);
    axiosClient
      .get(`/products/${id}`)
      .then((res: any) => {
        const prodData = res?.data || res;
        setProduct(prodData);
        setRelatedProducts(res?.related_products || []);
        setReviews(res?.reviews || []);
        if (res?.rating_summary) {
          setRatingSummary(res.rating_summary);
        }
        setError("");
      })
      .catch((err: any) => {
        console.error("Lỗi khi tải chi tiết sản phẩm:", err);
        setError(err.message || "Không tìm thấy sản phẩm hoặc máy chủ gặp sự cố");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProductData();
  }, [id]);

  const finalPrice = product
    ? product.sale_price && Number(product.sale_price) > 0 && Number(product.sale_price) < Number(product.price)
      ? Number(product.sale_price)
      : Number(product.price)
    : 0;

  const isSale = product && finalPrice < Number(product.price);
  const discountPercent = product && isSale
    ? Math.round(((Number(product.price) - finalPrice) / Number(product.price)) * 100)
    : 0;
  const savedAmount = product && isSale ? Number(product.price) - finalPrice : 0;

  const handleAddToCart = async (redirectCheckout = false) => {
    const token = typeof window !== "undefined"
      ? localStorage.getItem("token") || localStorage.getItem("access_token")
      : null;

    if (!token) {
      router.push("/login");
      return;
    }

    if (!product) return;

    setIsAdding(true);
    try {
      await axiosClient.post("/cart/add", {
        product_id: product.id,
        quantity: qty,
      });

      if (redirectCheckout) {
        router.push("/checkout");
      } else {
        setToastMsg(`Đã thêm ${qty} ${product.name} vào giỏ hàng!`);
        setTimeout(() => setToastMsg(""), 3000);
      }
    } catch (err: any) {
      if (err?.status === 401) {
        router.push("/login");
      } else {
        alert(err.message || "Không thể thêm sản phẩm vào giỏ hàng");
      }
    } finally {
      setIsAdding(false);
    }
  };

  // [THUẬT TOÁN GỬI ĐÁNH GIÁ VÀ CẬP NHẬT TỨC THÌ (INSTANT UI REFRESH)]:
  // Gửi POST /api/products/{id}/reviews và đưa trực tiếp đánh giá mới vào state reviews mà không cần reload trang.
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSuccess("");
    setReviewError("");

    if (!reviewForm.comment.trim() || reviewForm.comment.trim().length < 3) {
      setReviewError("Nội dung nhận xét đánh giá phải có ít nhất 3 ký tự.");
      return;
    }

    setSubmittingReview(true);
    try {
      const res: any = await axiosClient.post(`/products/${id}/reviews`, reviewForm);
      setReviewSuccess(res.message || "Cảm ơn bạn đã gửi đánh giá sản phẩm!");

      // Tự động chèn review mới tạo vào danh sách hiển thị
      if (res?.data) {
        setReviews((prev) => [res.data, ...prev]);
        setRatingSummary((prev) => {
          const newTotal = prev.total + 1;
          const newStars = { ...prev.stars, [reviewForm.rating]: (prev.stars[reviewForm.rating] || 0) + 1 };
          const sumStars = Object.entries(newStars).reduce((sum, [s, c]) => sum + Number(s) * c, 0);
          return {
            total: newTotal,
            average: parseFloat((sumStars / newTotal).toFixed(1)),
            stars: newStars,
          };
        });
      }

      setReviewForm((prev) => ({
        ...prev,
        comment: "",
        rating: 5,
      }));
    } catch (err: any) {
      setReviewError(err.message || "Không thể gửi đánh giá. Vui lòng thử lại!");
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatPrice = (p: number | string) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(p) || 0);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <StoreHeader />

      {/* Toast thông báo giỏ hàng */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm border border-slate-700 animate-in slide-in-from-bottom duration-200">
          <CheckIcon className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link href="/trangchu" className="hover:text-blue-600 transition-colors">
            Trang chủ
          </Link>
          <ChevronRightIcon className="w-3 h-3" />
          <Link href="/products" className="hover:text-blue-600 transition-colors">
            Sản phẩm
          </Link>
          {product?.brand && (
            <>
              <ChevronRightIcon className="w-3 h-3" />
              <Link href={`/products?brand_id=${product.brand.id}`} className="hover:text-blue-600 transition-colors">
                {product.brand.name}
              </Link>
            </>
          )}
          <ChevronRightIcon className="w-3 h-3" />
          <span className="text-slate-700 font-medium truncate max-w-xs">
            {product?.name || "Chi tiết"}
          </span>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircleIcon className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="h-[420px] bg-white rounded-3xl animate-pulse border border-slate-200" />
            <div className="bg-white rounded-3xl p-8 animate-pulse space-y-4 border border-slate-200">
              <div className="h-6 bg-slate-100 rounded w-1/3" />
              <div className="h-10 bg-slate-100 rounded w-3/4" />
              <div className="h-12 bg-slate-100 rounded w-1/2" />
              <div className="h-32 bg-slate-100 rounded" />
            </div>
          </div>
        ) : product ? (
          <>
            {/* KHỐI 1: CHI TIẾT SẢN PHẨM (2 CỘT) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
              {/* Cột trái (5 cột): Ảnh lớn + Badges */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center relative">
                {isSale && (
                  <div className="absolute top-6 left-6 z-10 flex flex-col items-start gap-1">
                    <span className="px-2.5 py-1 text-xs font-black uppercase rounded-lg bg-rose-500 text-white shadow-sm">
                      Giảm {discountPercent}%
                    </span>
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      Tiết kiệm {formatPrice(savedAmount)}
                    </span>
                  </div>
                )}

                <div className="w-full aspect-square max-h-[400px] flex items-center justify-center p-4">
                  {product.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-slate-400 text-sm font-mono">Chưa có ảnh sản phẩm</div>
                  )}
                </div>

                <div className="w-full pt-4 border-t border-slate-100 flex items-center justify-around text-slate-500 text-xs">
                  <span className="flex items-center gap-1">
                    <ShieldCheckIcon className="w-3.5 h-3.5 text-blue-600" /> Chính hãng VN/A
                  </span>
                  <span className="flex items-center gap-1">
                    <RefreshCwIcon className="w-3.5 h-3.5 text-emerald-600" /> 1 đổi 1 30 ngày
                  </span>
                </div>
              </div>

              {/* Cột phải (7 cột): Thông tin, Giá, Chọn số lượng & Mua */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    <span className="text-blue-600 font-bold">{product.brand?.name || "Bảo Công Mobile"}</span>
                    <span>•</span>
                    <span>{product.category?.name || "Điện thoại"}</span>
                    {product.sku && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-slate-400">SKU: {product.sku}</span>
                      </>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-3">
                    {product.name}
                  </h1>

                  {/* Rating sao tóm tắt */}
                  <div className="flex items-center gap-2 mb-5">
                    <div className="flex items-center text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon
                          key={i}
                          filled={i < Math.round(ratingSummary.average)}
                          className="w-4 h-4 text-amber-400"
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-700">
                      {ratingSummary.average} / 5.0
                    </span>
                    <span className="text-xs text-slate-400">
                      ({ratingSummary.total} đánh giá)
                    </span>
                  </div>

                  {/* Giá sản phẩm */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-6 flex items-baseline gap-3">
                    <span className="text-3xl sm:text-4xl font-black text-blue-600 tracking-tight">
                      {formatPrice(finalPrice)}
                    </span>
                    {isSale && (
                      <span className="text-base text-slate-400 line-through font-medium">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>

                  {/* Tình trạng kho hàng */}
                  <div className="text-xs mb-6 flex items-center gap-2">
                    <span className="font-medium text-slate-500">Tình trạng:</span>
                    {(product.stock ?? 1) > 0 ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                        Còn hàng ({product.stock} máy sẵn sàng giao)
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
                        Tạm hết hàng
                      </span>
                    )}
                  </div>

                  {/* Mô tả sản phẩm */}
                  <div className="border-t border-slate-100 pt-5 mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Đặc điểm nổi bật
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                      {product.description || "Sản phẩm chính hãng phân phối tại Bảo Công Mobile, bảo hành 12 tháng toàn quốc."}
                    </p>
                  </div>
                </div>

                {/* Chọn số lượng & Nút Mua */}
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Số lượng:</span>
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        className="px-3.5 py-2 text-slate-600 hover:bg-slate-200/80 font-bold transition-colors text-sm"
                      >
                        −
                      </button>
                      <span className="w-10 text-center font-bold text-sm text-slate-800">{qty}</span>
                      <button
                        type="button"
                        onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}
                        className="px-3.5 py-2 text-slate-600 hover:bg-slate-200/80 font-bold transition-colors text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleAddToCart(false)}
                      disabled={(product.stock ?? 1) <= 0 || isAdding}
                      className="py-3 px-4 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <ShoppingBagIcon className="w-4 h-4" />
                      <span>{isAdding ? "Đang thêm..." : "Thêm vào giỏ"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddToCart(true)}
                      disabled={(product.stock ?? 1) <= 0 || isAdding}
                      className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50"
                    >
                      Mua ngay
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* KHỐI 2: SẢN PHẨM LIÊN QUAN (RELATED PRODUCTS) */}
            {relatedProducts.length > 0 && (
              <div className="mb-14">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      Sản Phẩm Tương Tự Cùng Phân Khúc
                    </h2>
                    <p className="text-xs text-slate-500">
                      Gợi ý các dòng điện thoại cùng thương hiệu hoặc phân khúc tương đương
                    </p>
                  </div>
                  <Link
                    href={`/products?brand_id=${product.brand?.id || ""}`}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>Xem thêm</span>
                    <ChevronRightIcon className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {relatedProducts.map((rel) => {
                    const rPrice =
                      rel.sale_price && Number(rel.sale_price) > 0 ? Number(rel.sale_price) : Number(rel.price);
                    const rSale =
                      rel.sale_price && Number(rel.sale_price) > 0 && Number(rel.sale_price) < Number(rel.price);

                    return (
                      <Link
                        key={rel.id}
                        href={`/products/${rel.id}`}
                        className="group bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="relative aspect-square w-full rounded-xl bg-slate-50 p-4 mb-3 flex items-center justify-center overflow-hidden">
                            {rel.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={rel.image}
                                alt={rel.name}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                              />
                            ) : (
                              <span className="text-xs text-slate-400 font-mono">Chưa có ảnh</span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 mb-1">{rel.brand?.name}</div>
                          <h3 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                            {rel.name}
                          </h3>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                          <span className="text-sm font-bold text-blue-600">{formatPrice(rPrice)}</span>
                          {rSale && (
                            <span className="text-[11px] text-slate-400 line-through">
                              {formatPrice(rel.price)}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* KHỐI 3: HỆ THỐNG REVIEW & ĐÁNH GIÁ ĐỒNG BỘ ADMIN */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs mb-12">
              <div className="flex items-center gap-2.5 mb-8 pb-4 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                  <StarIcon className="w-4 h-4 text-white" filled />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Đánh Giá & Nhận Xét Từ Khách Hàng</h2>
                  <p className="text-xs text-slate-400">
                    Nhận xét thực tế từ người dùng đã trải nghiệm sản phẩm tại Bảo Công Mobile
                  </p>
                </div>
              </div>

              {/* Bảng tổng kết điểm và Biểu đồ sao */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10 pb-8 border-b border-slate-100">
                {/* Điểm trung bình */}
                <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <span className="text-5xl font-black text-slate-900 tracking-tight mb-2">
                    {ratingSummary.average}
                  </span>
                  <div className="flex items-center text-amber-400 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon
                        key={i}
                        filled={i < Math.round(ratingSummary.average)}
                        className="w-5 h-5 text-amber-400"
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500">
                    Dựa trên <strong>{ratingSummary.total}</strong> đánh giá
                  </span>
                </div>

                {/* Phân bố sao (5 sao -> 1 sao) */}
                <div className="md:col-span-8 flex flex-col justify-center space-y-2">
                  {[5, 4, 3, 2, 1].map((starNum) => {
                    const count = ratingSummary.stars[starNum] || 0;
                    const percent = ratingSummary.total > 0 ? (count / ratingSummary.total) * 100 : 0;

                    return (
                      <div key={starNum} className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1 w-14 font-semibold text-slate-700">
                          <span>{starNum}</span>
                          <StarIcon className="w-3.5 h-3.5 text-amber-400" filled />
                        </div>
                        <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="w-12 text-right text-slate-400 font-mono">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Form Gửi đánh giá mới */}
              <div className="p-6 bg-slate-50/70 rounded-2xl border border-slate-200/80 mb-10">
                <h3 className="text-sm font-bold text-slate-900 mb-1">Gửi đánh giá của bạn</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Chia sẻ cảm nhận chân thực để giúp cộng đồng khách hàng có thêm thông tin hữu ích
                </p>

                {reviewSuccess && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{reviewSuccess}</span>
                  </div>
                )}

                {reviewError && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                    <AlertCircleIcon className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{reviewError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitReview} className="space-y-4">
                  {/* Chọn số sao tương tác */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Bạn chấm sản phẩm này mấy sao?
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((s) => {
                        const isFilled = reviewHoverStar !== null ? s <= reviewHoverStar : s <= reviewForm.rating;
                        return (
                          <button
                            key={s}
                            type="button"
                            onMouseEnter={() => setReviewHoverStar(s)}
                            onMouseLeave={() => setReviewHoverStar(null)}
                            onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                            className="p-1 focus:outline-none transition-transform hover:scale-125"
                          >
                            <StarIcon
                              className={`w-6 h-6 ${
                                isFilled ? "text-amber-400" : "text-slate-300"
                              }`}
                              filled={isFilled}
                            />
                          </button>
                        );
                      })}
                      <span className="text-xs font-bold text-amber-600 ml-2">
                        {reviewForm.rating} sao
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Họ và tên của bạn
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Hoàng Nam"
                        value={reviewForm.reviewer_name}
                        onChange={(e) => setReviewForm({ ...reviewForm, reviewer_name: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Địa chỉ Email (tùy chọn)
                      </label>
                      <input
                        type="email"
                        placeholder="name@gmail.com"
                        value={reviewForm.reviewer_email}
                        onChange={(e) => setReviewForm({ ...reviewForm, reviewer_email: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nội dung nhận xét <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Mô tả trải nghiệm về hiệu năng, camera, thời lượng pin, độ hoàn thiện..."
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="py-2.5 px-5 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs disabled:opacity-50"
                  >
                    {submittingReview ? "Đang gửi nhận xét..." : "Gửi đánh giá ngay"}
                  </button>
                </form>
              </div>

              {/* Danh sách các đánh giá đã duyệt */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 mb-3">
                  Tất cả nhận xét ({reviews.length})
                </h3>

                {reviews.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên để lại nhận xét!
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center uppercase">
                            {rev.reviewer_name?.slice(0, 1) || "K"}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">
                              {rev.reviewer_name || "Khách hàng ẩn danh"}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                              <div className="flex items-center text-amber-400">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <StarIcon
                                    key={i}
                                    filled={i < rev.rating}
                                    className="w-3 h-3 text-amber-400"
                                  />
                                ))}
                              </div>
                              <span>•</span>
                              <span>{new Date(rev.created_at).toLocaleDateString("vi-VN")}</span>
                            </div>
                          </div>
                        </div>

                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Đã mua hàng chính hãng
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {rev.comment}
                      </p>

                      {/* Phản hồi chính thức từ Quản trị viên (nếu có) */}
                      {rev.admin_reply && (
                        <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 mt-2 space-y-1">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-800">
                            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                            <span>Bảo Công Mobile - Phản hồi từ Quản trị viên</span>
                          </div>
                          <p className="text-xs text-blue-900/90 leading-relaxed pl-3.5">
                            {rev.admin_reply}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
