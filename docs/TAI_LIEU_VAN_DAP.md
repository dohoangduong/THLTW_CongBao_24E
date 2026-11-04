# CẨM NANG VẤN ĐÁP ĐỒ ÁN THỰC HÀNH LẬP TRÌNH WEB (THLTW)
## DỰ ÁN: WEBSITE BÁN HÀNG ĐIỆN THOẠI BẢO CÔNG MOBILE
**Sinh viên thực hiện:** Đỗ Gia Bảo  
**Công nghệ sử dụng:** Backend Laravel 11 (PHP 8.2+, MySQL `bao_cong`, Sanctum) + Frontend Next.js 16 (React 19, Tailwind CSS, Turbopack)  
**Nhánh Git:** `DOGIABAO`  
**Quy chuẩn thiết kế:** 100% Vector SVG từ `@/components/Icons.tsx` (Nghiêm cấm Emoji), Bento Tech Grid, Không dùng Mock Data (100% Dynamic MySQL Database).

---

## MỤC LỤC TRA CỨU NHANH (5 GIÂY)
1. [Sơ Đồ Cây Thư Mục & Vai Trò Từng File](#1-sơ-đồ-cây-thư-mục--vai-trò-từng-file)
2. [Chi Tiết 10 Thuật Toán Cốt Lõi (Có File & Dòng Code)](#2-chi-tiết-10-thuật-toán-cốt-lõi)
   - [Thuật toán 1: Tìm kiếm thật & Luân phiên nhảy từ khóa](#thuật-toán-1-tìm-kiếm-thời-gian-thực-debounce--sql-like--luân-phiên-nhảy-gợi-ý)
   - [Thuật toán 2: Lọc đa tiêu chí kết hợp Phân trang](#thuật-toán-2-lọc-đa-tiêu-chí-kết-hợp-phân-trang-pagination)
   - [Thuật toán 3: Gợi ý sản phẩm liên quan](#thuật-toán-3-gợi-ý-sản-phẩm-liên-quan-cùng-hãng--danh-mục)
   - [Thuật toán 4: Đánh giá sao, Thống kê & Phản hồi Admin](#thuật-toán-4-đánh-giá-sao-thống-kê-phân-bố-và-đồng-bộ-kiểm-duyệt-admin)
   - [Thuật toán 5: Quản lý User (Khóa tài khoản & Gom Đơn hàng vào 1 trang)](#thuật-toán-5-quản-lý-người-dùng-blockunblock-và-gom-toàn-bộ-đơn-hàng-vào-cùng-1-trang)
   - [Thuật toán 6: Cơ chế Đồng bộ dữ liệu 100% Khách hàng ⇄ Quản trị](#thuật-toán-6-cơ-chế-đồng-bộ-hai-chiều-user--admin)
   - [Thuật toán 7: Hệ thống Bài viết Công nghệ & Thảo luận 2 chiều (User ⇄ Admin)](#thuật-toán-7-hệ-thống-bài-viết-công-nghệ--thảo-luận-cộng-đồng-đồng-bộ-2-chiều)
   - [Thuật toán 8: Kiểm tra & Áp dụng Mã khuyến mãi (FUNC-ORDER-02)](#thuật-toán-8-kiểm-tra--áp-dụng-mã-khuyến-mãi-coupons-func-order-02)
   - [Thuật toán 9: Đồng bộ Tồn kho 4 Chiều (Inventory Sync Engine)](#thuật-toán-9-đồng-bộ-tồn-kho-4-chiều-inventory-sync-engine)
   - [Thuật toán 10: Ràng buộc Khóa ngoại & Toàn vẹn Dữ liệu Kế toán khi Xóa](#thuật-toán-10-ràng-buộc-khóa-ngoại--toàn-vẹn-dữ-liệu-kế-toán-khi-xóa)
   - [Thuật toán 11: Upload File Ảnh (PNG/JPG <= 10MB) từ Client lên Laravel Server](#211-thuật-toán-kiểm-tra--upload-file-ảnh-pngjpg--10mb-từ-client-lên-laravel-server)
3. [Mẹo Thay Đổi Thông Số Tại Chỗ Cho Giảng Viên](#3-mẹo-thay-đổi-thông-số-tại-chỗ-khi-giảng-viên-yêu-cầu)
4. [Tài Khoản Đăng Nhập Mẫu & Kiểm Thử](#4-tài-khoản-đăng-nhập-mẫu)

---

## 1. SƠ ĐỒ CÂY THƯ MỤC & VAI TRÒ TỪNG FILE

### A. Phân Hệ Backend (Laravel 11 RESTful API)
```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   ├── Admin/
│   │   │   │   ├── ProductController.php          # Quản lý sản phẩm, lọc đa tiêu chí, phân trang, gợi ý liên quan & tiếp nhận review
│   │   │   │   ├── AdminUserController.php        # Quản lý User, khóa tài khoản (toggle-status), gom chi tiết user & đơn hàng
│   │   │   │   ├── AdminReviewController.php      # Quản lý đánh giá: kiểm duyệt ẩn/hiện, phản hồi của Admin, xóa đánh giá
│   │   │   │   ├── AdminSupportTicketController.php # Tiếp nhận & xử lý phiếu hỗ trợ từ trang /ho-tro, cập nhật tiến độ
│   │   │   │   ├── AdminOrderController.php       # Quản lý đơn hàng, đổi trạng thái đơn, lọc theo ngày, tự động hoàn kho khi hủy đơn
│   │   │   │   ├── AdminStockController.php       # Quản lý Kho: 4 KPI, Tồn kho thực tế, Lịch sử biến động, Nhập kho, Xuất kho chặn vượt tồn
│   │   │   │   ├── AdminPromotionController.php   # Quản lý Mã khuyến mãi: CRUD voucher theo % hoặc tiền mặt, áp dụng tính giảm giá động
│   │   │   │   ├── AdminBannerController.php      # Quản lý Banner: Hero lớn và banner phụ, sắp xếp thứ tự, tải ảnh máy tính
│   │   │   │   ├── AdminMenuController.php        # Quản lý Menu điều hướng Header & Footer
│   │   │   │   ├── AdminPageController.php        # Quản lý Trang đơn / tĩnh (/trang/[slug]): Giới thiệu, Bảo hành, Đổi trả...
│   │   │   │   ├── AdminPostCategoryController.php # Quản lý Chủ đề bài viết: CRUD, kiểm tra ràng buộc không cho xóa nếu có bài
│   │   │   │   ├── AdminSettingController.php     # Cấu hình website: Logo, Favicon, Hotline, Email, Địa chỉ, Meta SEO, Copyright
│   │   │   │   ├── AdminPostController.php        # Quản lý bài viết công nghệ: thêm/sửa/xóa, toggle Ẩn/Hiện, Ghim Bento, Đóng/Mở thảo luận
│   │   │   │   ├── AdminPostCommentController.php # Quản lý thảo luận bài viết: duyệt ẩn/hiện, phản hồi chính thức (admin_reply), xóa
│   │   │   │   ├── CategoryController.php         # Danh mục sản phẩm kèm đếm số lượng máy (chặn xóa nếu có sản phẩm)
│   │   │   │   └── BrandController.php            # Thương hiệu (Apple, Samsung...) kèm đếm số lượng máy (chặn xóa nếu có sản phẩm)
│   │   │   ├── AuthController.php                 # Đăng ký, Đăng nhập (chặn đăng nhập nếu status = 0), Quên/Đặt lại mật khẩu, Đăng xuất
│   │   │   ├── OrderController.php                # Đặt hàng từ giỏ (áp dụng coupon, trừ tồn kho, ghi lịch sử), Hủy đơn (hoàn tồn kho)
│   │   │   ├── CartController.php                 # Giỏ hàng cá nhân (thêm, sửa số lượng kiểm tra tồn kho, xóa)
│   │   │   ├── PostController.php                 # Danh sách bài viết công nghệ, chi tiết bài, tăng views tự động, tiếp nhận thảo luận
│   │   │   ├── SupportTicketController.php        # Tiếp nhận form yêu cầu hỗ trợ từ khách hàng vãng lai & thành viên
│   │   │   └── UploadController.php               # Tải ảnh trực tiếp từ máy tính lên Server (PNG, JPG/JPEG <= 10MB)
│   ├── Models/
│   │   ├── Setting.php                            # Model cấu hình thông tin website toàn hệ thống
│   │   ├── Banner.php                             # Model banner trang chủ: main_hero, sub_banner
│   │   ├── Menu.php                               # Model menu điều hướng: header, footer
│   │   ├── Page.php                               # Model trang đơn: slug, summary, content
│   │   ├── PostCategory.php                       # Model chủ đề bài viết công nghệ: quan hệ posts()
│   │   ├── Promotion.php                          # Model mã khuyến mãi: isValidForAmount(), calculateDiscount()
│   │   ├── StockMovement.php                      # Model biến động kho: import, export, stock_before, stock_after
│   │   ├── OrderStatusHistory.php                 # Model lịch sử các mốc chuyển trạng thái đơn hàng
│   │   ├── Post.php                               # Model bài viết: category, summary, content, views, is_featured, is_visible, allow_comments
│   │   ├── PostComment.php                        # Model thảo luận: post_id, author_name, content, admin_reply, is_visible
│   │   ├── Product.php                            # Quan hệ category(), brand(), reviews(), cartItems(), stockMovements()
│   │   ├── User.php                               # Quan hệ orders(), reviews(), supportTickets()
│   │   ├── Review.php                             # Bảng đánh giá sao: product_id, reviewer_name, rating, comment, admin_reply
│   │   ├── SupportTicket.php                      # Bảng phiếu hỗ trợ: name, phone, email, order_code, subject, message, status
│   │   ├── Order.php & OrderDetail.php            # Bảng đơn hàng (coupon_code, status_history) và chi tiết sản phẩm đơn hàng
│   │   └── Category.php & Brand.php               # Bảng danh mục và thương hiệu
├── database/
│   ├── migrations/                                # 7 migrations kiến trúc toàn bộ cơ sở dữ liệu
│   └── seeders/
│       └── DatabaseSeeder.php                     # Nạp dữ liệu mẫu 100% chuẩn: settings, banners, menus, pages, promos, stocks, v.v.
└── routes/
    └── api.php                                    # Định nghĩa toàn bộ RESTful API Public, Staff và Super Admin
```

### B. Phân Hệ Frontend (Next.js 16 App Router)
```
frontend/src/
├── app/
│   ├── trangchu/page.jsx                          # Trang chủ: 5 khối dữ liệu MySQL (Banner động, Danh mục nổi bật, Tab Mới/Bán chạy, Lọc nhanh, Tin công nghệ)
│   ├── bai-viet/page.jsx                          # Chuyên trang Bài viết: Bento Hero (8 cột tâm điểm + 4 cột trending), chip danh mục động, tìm kiếm, phân trang
│   ├── bai-viet/[id]/page.jsx                     # Chi tiết bài viết: Tự tăng views, bài cùng chuyên mục, thảo luận 2 chiều & phản hồi admin
│   ├── products/page.tsx                          # Trang Tất cả sản phẩm: 2 cột (Sidebar Danh mục, Hãng, Giá + Lưới sản phẩm & Phân trang)
│   ├── products/[id]/page.tsx                     # Chi tiết sản phẩm: Ảnh nét, Giá sale, Sản phẩm liên quan, Reviews & Form gửi đánh giá
│   ├── ho-tro/page.tsx                            # Trang Hỗ trợ: Giới thiệu shop, Chính sách 1 đổi 1, FAQ & Form gửi phiếu hỗ trợ
│   ├── trang/[slug]/page.jsx                      # Trang đơn tĩnh động: Giới thiệu, Chính sách bảo hành, Đổi trả... (chuẩn 404 nếu ẩn/không tồn tại)
│   ├── cart/page.jsx                              # Giỏ hàng: Kiểm tra tồn kho trước khi tăng, Khung nhập Coupon & Danh sách voucher áp dụng nhanh
│   ├── checkout/page.jsx                          # Thanh toán & Đặt hàng: Tính toán tạm tính, giảm giá voucher, phí ship, tạo đơn vào MySQL
│   ├── orders/page.jsx                            # Lịch sử đơn hàng của khách hàng
│   ├── orders/[id]/page.jsx                       # Chi tiết đơn hàng: Tiến trình trạng thái (Timeline), Nút [Hủy đơn hàng] tự động hoàn kho
│   ├── profile/page.jsx                           # Cập nhật thông tin cá nhân & Form Đổi mật khẩu
│   ├── forgot-password/page.jsx                   # Quên / Đặt lại mật khẩu qua xác minh Email + SĐT
│   ├── login/page.jsx & register/page.jsx         # Đăng nhập & Đăng ký tài khoản (gắn link Quên mật khẩu)
│   ├── admin/
│   │   ├── layout.jsx                             # Admin Layout: Auth Guard chống bypass, Sidebar điều hướng 4 nhóm gọn gàng
│   │   ├── kho-hang/page.jsx                      # Quản lý Kho: 4 thẻ KPI, Tồn kho thực tế (cảnh báo tồn <=5), Lịch sử xuất nhập, Modal Nhập/Xuất
│   │   ├── khuyen-mai/page.jsx                    # Quản lý Mã khuyến mãi: CRUD voucher theo % hoặc tiền mặt, đơn tối thiểu, giới hạn lượt dùng
│   │   ├── don-hang/page.jsx                      # Quản lý Đơn hàng: Lọc theo khoảng ngày (from_date - to_date), Tiến trình trạng thái, Hoàn kho khi hủy
│   │   ├── nguoi-dung/page.jsx                    # Quản lý User: Khóa/Mở khóa (Block), Xem chi tiết User + Toàn bộ đơn hàng trên 1 trang
│   │   ├── san-pham/page.jsx                      # Quản lý Sản phẩm: Sửa giá gốc, giá sale, tồn kho, tải ảnh máy tính (<=10MB), chặn xóa nếu có đơn
│   │   ├── danh-muc/page.jsx                      # Quản lý Danh mục sản phẩm (chặn xóa nếu đang có sản phẩm con)
│   │   ├── thuong-hieu/page.jsx                   # Quản lý Thương hiệu điện thoại (chặn xóa nếu đang có sản phẩm con)
│   │   ├── danh-gia/page.jsx                      # Quản lý Đánh giá: Duyệt/Ẩn, Trả lời câu hỏi khách (Admin Reply), Xóa
│   │   ├── bai-viet/page.jsx                      # Quản lý Bài viết: Thống kê, thêm/sửa/xóa, 3 micro-controls, tải ảnh máy tính
│   │   ├── chu-de-bai-viet/page.jsx               # Quản lý Chủ đề bài viết: CRUD, chặn xóa nếu đang có bài viết thuộc chủ đề
│   │   ├── thao-luan/page.jsx                     # Quản lý Thảo luận: Phản hồi chính thức (admin_reply), duyệt ẩn/hiện, xóa vĩnh viễn
│   │   ├── banner/page.jsx                        # Quản lý Banner trang chủ: Hero lớn và banner phụ, tải ảnh máy tính (<=10MB)
│   │   ├── menu/page.jsx                          # Quản lý Menu điều hướng: Header & Footer
│   │   ├── trang-don/page.jsx                     # Quản lý Trang đơn / Trang tĩnh: CRUD nội dung Markdown/HTML
│   │   ├── cau-hinh/page.jsx                      # Cấu hình website: Logo, Favicon, Hotline, Email, Địa chỉ, Meta SEO, Copyright
│   │   ├── ho-tro/page.jsx                        # Quản lý Phiếu hỗ trợ: Cập nhật tiến độ xử lý, ghi chú CSKH
│   │   └── thung-rac/page.jsx                     # Thùng rác phục hồi / xóa vĩnh viễn
├── components/
│   ├── StoreHeader.jsx                            # Header động đồng bộ 100% từ bảng settings & menus trong MySQL
│   ├── StoreFooter.jsx                            # Footer động đồng bộ 100% từ bảng settings & menus trong MySQL
│   ├── SmartSearchBar.jsx                         # Thanh tìm kiếm thời gian thực với debounce 300ms
│   └── Icons.jsx                                  # Thư viện 100% SVG Vector độc quyền Swiss Monochrome Tech
└── services/
    └── axiosClient.js                             # Axios cấu hình baseURL: http://localhost:8000/api, tự động gán Bearer Token & bắt lỗi 401/403/422
```

---

## 2. CHI TIẾT 6 THUẬT TOÁN CỐT LÕI

### Thuật toán 1: Tìm kiếm thời gian thực (Debounce + SQL LIKE) & Luân phiên nhảy gợi ý
- **Vị trí code:** 
  - Frontend: `frontend/src/components/SmartSearchBar.tsx`
  - Backend: `backend/app/Http/Controllers/Api/Admin/ProductController.php` (hàm `index`)
- **Nguyên lý hoạt động:**
  1. **Hiệu ứng nhảy gợi ý luân phiên:** Dùng Hook `useEffect` kết hợp `setInterval` chu kỳ **2500ms (2.5 giây)** để tăng biến `suggestionIndex`. Mảng gợi ý luân phiên xoay vòng: `"Tìm điện thoại: iPhone 16 Pro Max..."` ➔ `"Tìm điện thoại: Samsung Galaxy S24 Ultra..."` ➔ `"Tìm điện thoại: Xiaomi 14 Ultra..."` ➔ `"Tìm điện thoại: OPPO Find X7..."`.
  2. **Kỹ thuật Debounce 300ms:** Khi người dùng nhập ký tự vào ô input, hàm `setTimeout` sẽ trì hoãn 300ms. Nếu người dùng tiếp tục gõ trong khoảng 300ms thì bộ đếm cũ bị hủy (`clearTimeout`). Chỉ khi người dùng ngừng gõ đủ 300ms, ứng dụng mới phát request tới `/api/products?search=...&per_page=5`.
  3. **Truy vấn SQL Backend:** Sử dụng mệnh đề `LIKE %search%` đồng thời trên 3 cột: Tên máy (`name`), Mã sản phẩm (`sku`) và Mô tả (`description`):
     ```php
     $query->where(function ($q) use ($search) {
         $q->where('name', 'like', "%{$search}%")
           ->orWhere('sku', 'like', "%{$search}%")
           ->orWhere('description', 'like', "%{$search}%");
     });
     ```
  4. **Dải nút Nhảy nhanh theo Hãng (Brand Jump):** Bấm trực tiếp vào các chip `iPhone`, `Samsung`, `Xiaomi`, `OPPO`, `Realme` sẽ chuyển trang ngay sang `/products?brand_id=...` mà không cần nhập bàn phím.

---

### Thuật toán 2: Lọc đa tiêu chí kết hợp Phân trang (Pagination)
- **Vị trí code:**
  - Backend: `backend/app/Http/Controllers/Api/Admin/ProductController.php` (hàm `index`)
  - Frontend: `frontend/src/app/products/page.tsx`
- **Nguyên lý hoạt động:**
  1. **Lọc Giá thực tế thông minh (COALESCE):** Sản phẩm có thể có `price` (giá niêm yết) và `sale_price` (giá khuyến mãi). Thuật toán sử dụng hàm SQL `COALESCE(NULLIF(sale_price, 0), price)`: nếu có giá sale hợp lệ thì lấy giá sale để so sánh khoảng giá, ngược lại lấy giá gốc:
     ```php
     $query->whereRaw('COALESCE(NULLIF(sale_price, 0), price) BETWEEN ? AND ?', [$minVal, $maxVal]);
     ```
     Nếu người dùng nhập giá min lớn hơn max (`min > max`), thuật toán tự động đảo ngược vị trí `[$minVal, $maxVal] = [$maxVal, $minVal]` để không bao giờ bị lỗi truy vấn.
  2. **Lọc Sản phẩm Khuyến mãi (Sale):** Điều kiện `sale_price IS NOT NULL AND sale_price > 0 AND sale_price < price`.
  3. **Lọc Danh mục & Hãng:** Áp dụng `category_id` và `brand_id`.
  4. **Phân trang chuẩn 9 sản phẩm/trang:** Gọi `$query->paginate(9)`. Trả về dữ liệu chuẩn JSON kèm `current_page`, `last_page`, `total`. Frontend giữ nguyên toàn bộ query params (hãng, giá, tìm kiếm) khi bấm sang trang khác.

---

### Thuật toán 3: Gợi ý sản phẩm liên quan (Cùng hãng / Danh mục)
- **Vị trí code:** `backend/app/Http/Controllers/Api/Admin/ProductController.php` (hàm `show`)
- **Nguyên lý hoạt động:**
  - Khi xem chi tiết 1 sản phẩm `A`, hệ thống tìm tối đa 4 sản phẩm `B` thỏa mãn 3 điều kiện:
    1. Đang mở bán: `status = 1`.
    2. Khác sản phẩm đang xem: `id != A.id`.
    3. Cùng danh mục hoặc cùng thương hiệu: `category_id == A.category_id OR brand_id == A.brand_id`.
  - Giúp tăng tỷ lệ chuyển đổi đơn hàng (Upsell/Cross-sell) bằng các mẫu máy cùng phân khúc.

---

### Thuật toán 4: Đánh giá sao, Thống kê phân bố và Đồng bộ kiểm duyệt Admin
- **Vị trí code:**
  - Backend: `ProductController.php` (hàm `show`, `storeReview`), `AdminReviewController.php`
  - Frontend: `frontend/src/app/products/[id]/page.tsx`, `frontend/src/app/admin/danh-gia/page.jsx`
- **Nguyên lý hoạt động:**
  1. **Tính điểm trung bình:** Lấy danh sách đánh giá có `status = 1`, tính `AVG(rating)` làm tròn 1 chữ số thập phân (ví dụ: `4.8 / 5.0`).
  2. **Biểu đồ tỷ lệ sao:** Thống kê số lượng đánh giá cho từng mốc 1, 2, 3, 4, 5 sao, tính phần trăm `% = (số lượng sao / tổng đánh giá) * 100` để render thanh tiến độ.
  3. **Gửi đánh giá và cập nhật UI tức thì:** Khách hàng chọn số sao (1-5 SVG Star) và nhập nội dung. Khi gửi thành công lên `POST /api/products/{id}/reviews`, Next.js cập nhật trực tiếp vào mảng state `reviews` mà không cần F5 trình duyệt.
  4. **Phản hồi của Quản trị viên:** Quản trị viên tại `/admin/danh-gia` có thể nhập câu trả lời. Câu trả lời được lưu vào cột `admin_reply` và hiển thị trang trọng ngay dưới nhận xét của khách trên trang sản phẩm.

---

### Thuật toán 5: Quản lý Người dùng (Block/Unblock) và Gom toàn bộ đơn hàng vào cùng 1 trang
- **Vị trí code:**
  - Backend: `AdminUserController.php` (hàm `show`, `toggleStatus`), `AuthController.php`, `OrderController.php`
  - Frontend: `frontend/src/app/admin/nguoi-dung/page.jsx`
- **Nguyên lý hoạt động:**
  1. **Khóa / Mở khóa tài khoản (Block Guard):** Khi Quản trị viên bấm nút `Khóa`, hệ thống đổi `status` thành `0` và **thu hồi toàn bộ token đăng nhập (`$user->tokens()->delete()`)**. Khi user bị khóa cố tình đăng nhập hoặc đặt hàng, API trả về lỗi **HTTP 403 Forbidden** kèm thông báo: *"Tài khoản của bạn đã bị khóa bởi Quản trị viên! Vui lòng liên hệ bộ phận CSKH để được hỗ trợ."*
  2. **Chuẩn sơ đồ bảng trắng (Hiển thị User + Lịch sử đơn hàng trên 1 trang):** Khi bấm nút `Chi tiết`, hàm `show($id)` nạp quan hệ Eager Loading `User::withCount('orders')->with(['orders.details'])`. Giao diện Modal mở ra hiển thị đồng thời cả thông tin người dùng và danh sách từng đơn hàng kèm sản phẩm, giá tiền, trạng thái mà không cần chuyển qua trang đơn hàng.

---

### Thuật toán 6: Cơ chế Đồng bộ hai chiều (User ⇄ Admin)

#### BẢNG MA TRẬN ĐỒNG BỘ DỮ LIỆU USER ⇄ ADMIN (2 CHIỀU)

| Chức năng bên Trang Người Dùng | API Endpoint gọi xuống | Bảng MySQL lưu trữ | Nhánh Quản Lý bên Trang Admin | File Code xử lý (Frontend & Backend) |
| :--- | :--- | :--- | :--- | :--- |
| **Gửi Phiếu Hỗ Trợ Trực Tuyến** (Tư vấn, bảo hành, khiếu nại, mã đơn) | `POST /api/support-tickets` | `support_tickets` | **Quản lý Hỗ trợ** (`/admin/ho-tro`) | • FE: `frontend/src/app/ho-tro/page.tsx`<br>• Admin FE: `frontend/src/app/admin/ho-tro/page.jsx`<br>• BE: `SupportTicketController.php` & `AdminSupportTicketController.php` |
| **Gửi Đánh Giá Sao & Nhận Xét** (1-5 sao, bình luận sản phẩm) | `POST /api/products/{id}/reviews` | `reviews` | **Quản lý Đánh giá** (`/admin/danh-gia`) | • FE: `frontend/src/app/products/[id]/page.tsx`<br>• Admin FE: `frontend/src/app/admin/danh-gia/page.jsx`<br>• BE: `ProductController.php` & `AdminReviewController.php` |
| **Xem & Lọc Sản Phẩm Khuyến Mãi (Sale)** | `GET /api/products?type=sale` | `products` (`sale_price < price`) | **Quản lý Sản phẩm** (`/admin/san-pham`) | • FE: `frontend/src/app/products/page.tsx`<br>• Admin FE: `frontend/src/app/admin/san-pham/page.jsx`<br>• BE: `ProductController.php` |
| **Xem Sản Phẩm Mới Nhất** | `GET /api/products?type=new` | `products` (`ORDER BY id DESC`) | **Quản lý Sản phẩm** (`/admin/san-pham`) | • FE: `frontend/src/app/products/page.tsx`<br>• Admin FE: `frontend/src/app/admin/san-pham/page.jsx`<br>• BE: `ProductController.php` |
| **Tìm Kiếm Sản Phẩm Thời Gian Thực** | `GET /api/products?search={kw}` | `products` (`LIKE %search%`) | **Quản lý Sản phẩm** (`/admin/san-pham`) | • FE: `frontend/src/components/SmartSearchBar.tsx`<br>• BE: `ProductController.php` |
| **Đặt Hàng & Thanh Toán (COD / QR)** | `POST /api/orders` | `orders` & `order_details` | **Quản lý Đơn hàng** (`/admin/don-hang`) | • FE: `frontend/src/app/checkout/page.tsx`<br>• Admin FE: `frontend/src/app/admin/don-hang/page.jsx`<br>• BE: `OrderController.php` & `AdminOrderController.php` |
| **Đăng Ký, Đăng Nhập & Hồ Sơ** | `POST /api/login`, `POST /api/register` | `users` | **Quản lý Người dùng** (`/admin/nguoi-dung`) | • FE: `frontend/src/app/login/page.tsx`<br>• Admin FE: `frontend/src/app/admin/nguoi-dung/page.jsx`<br>• BE: `AuthController.php` & `AdminUserController.php` |

---

#### 1. Luồng Chạy Đồng Bộ Form Hỗ Trợ (`/ho-tro` ➔ `/admin/ho-tro`):
1. **Khách hàng gửi yêu cầu:** Tại `http://localhost:3000/ho-tro`, khách điền Họ tên, SĐT, Email, Mã đơn hàng, chọn Chủ đề và nhập Nội dung, bấm **"GỬI YÊU CẦU HỖ TRỢ NGAY"**.
2. **Frontend xử lý:** `frontend/src/app/ho-tro/page.tsx` validate form (Họ tên != rỗng, SĐT != rỗng, Nội dung >= 5 ký tự) và phát `POST /api/support-tickets`.
3. **Backend tiếp nhận & Lưu trữ:** `SupportTicketController::store` kiểm tra dữ liệu, tự động liên kết `user_id` (nếu khách đã đăng nhập), gán mặc định `status = 'pending'`, và lưu bản ghi vào bảng `support_tickets` trong MySQL.
4. **Admin quản lý & Điều phối:** Tại `http://localhost:3000/admin/ho-tro`, danh sách yêu cầu mới xuất hiện ngay lập tức kèm 4 thẻ KPI (**Tổng yêu cầu**, **Chờ xử lý**, **Đang xử lý**, **Đã giải quyết**). Admin bấm nút **"Xử lý"** để xem toàn bộ nội dung, đổi trạng thái sang `processing` hoặc `resolved`, và nhập `admin_notes` (ghi chú CSKH). Dữ liệu được lưu thật vào MySQL qua `PUT /api/admin/support-tickets/{id}`.

#### 2. Luồng Chạy Đồng Bộ Đánh Giá Review Sản Phẩm (`/products/[id]` ➔ `/admin/danh-gia` ➔ `/products/[id]`):
1. **Khách gửi nhận xét:** Tại `http://localhost:3000/products/{id}`, khách bấm chọn số sao (1 đến 5 sao SVG) và nhập bình luận (>= 3 ký tự), bấm **"Gửi đánh giá ngay"**.
2. **Frontend & Backend lưu trữ:** Gọi `POST /api/products/{id}/reviews`. `ProductController::storeReview` lưu vào bảng `reviews` với `status = 1` (hiển thị). Giao diện chi tiết sản phẩm tự động chèn nhận xét mới vào danh sách và cập nhật lại điểm sao trung bình ngay trên UI mà không cần tải lại trang.
3. **Admin kiểm duyệt (Ẩn / Hiện):** Tại `http://localhost:3000/admin/danh-gia`, Quản trị viên thấy nhận xét mới.
   - Nếu nhận xét vi phạm tiêu chuẩn cộng đồng, Admin bấm nút **"Ẩn"** (`PUT /api/admin/reviews/{id}/status`) ➔ `status` đổi thành `0`.
   - Ngay lập tức, khi khách hàng truy cập lại trang `/products/{id}`, hàm `ProductController::show` chỉ lấy `where('status', 1)` nên nhận xét bị ẩn sẽ biến mất hoàn toàn và điểm sao trung bình hệ thống tự động tính lại dựa trên các đánh giá hợp lệ!
4. **Admin phản hồi nhận xét (Admin Reply):** Quản trị viên bấm nút **"Trả lời"** tại `/admin/danh-gia` và nhập nội dung giải đáp (ví dụ: *"Cảm ơn bạn đã ủng hộ Bảo Công Studio..."*), gọi `PUT /api/admin/reviews/{id}/reply`.
   - Câu trả lời được lưu vào trường `admin_reply` trong bảng `reviews`.
   - Trang `/products/{id}` của khách hàng lập tức hiển thị khung phản hồi trang trọng: `Bảo Công Studio — Phản hồi chính thức từ Quản trị viên` ngay dưới đánh giá của khách!
---

### Thuật toán 7: Hệ thống Bài viết Công nghệ & Thảo luận Cộng đồng Đồng bộ 2 Chiều
- **Vị trí code:**
  - Backend Models: `backend/app/Models/Post.php`, `backend/app/Models/PostComment.php`
  - Backend Controllers:
    - `backend/app/Http/Controllers/Api/PostController.php` (hàm `index`, `show`, `storeComment`)
    - `backend/app/Http/Controllers/Api/Admin/AdminPostController.php` (thống kê `stats`, CRUD, 3 micro-controls: `toggleVisibility`, `toggleFeatured`, `toggleComments`)
    - `backend/app/Http/Controllers/Api/Admin/AdminPostCommentController.php` (duyệt ẩn/hiện, `reply`, `destroy`)
  - Frontend Người dùng:
    - `frontend/src/app/trangchu/page.jsx` (khối "Chuyên trang Công nghệ & Đánh giá" lấy 3 bài viết mới nhất)
    - `frontend/src/app/bai-viet/page.jsx` (Lưới bài viết + Bento Hero 8 cột tâm điểm + 4 cột trending + Debounce tìm kiếm + Chip chuyên mục)
    - `frontend/src/app/bai-viet/[id]/page.jsx` (Chi tiết bài viết + Tự tăng views + 3 bài viết cùng chuyên mục + Khung thảo luận & phản hồi Admin)
  - Frontend Quản trị:
    - `frontend/src/app/admin/bai-viet/page.jsx` (Bảng quản lý bài viết, KPI stats, 3 micro-controls 1-chạm, form modal)
    - `frontend/src/app/admin/thao-luan/page.jsx` (Bảng quản lý thảo luận, KPI stats, phản hồi chính thức `admin_reply`)
- **Nguyên lý hoạt động 2 chiều:**
  1. **Bento Hero & Phân loại bài viết thông minh:**
     - Phía backend, `PostController::index` tự động truy vấn bài viết có cờ `is_featured = true` mới nhất để làm **Tâm điểm công nghệ** (chiếm 8 cột Bento bên trái với giao diện dark carbon sang trọng).
     - Đồng thời lấy 2 bài viết có lượt xem cao nhất (`orderBy('views', 'desc')`) loại trừ bài tâm điểm để làm 2 thẻ **Xu hướng (Trending)** ở 4 cột bên phải.
  2. **Cơ chế đếm lượt xem tự động (Auto-increment Views):**
     - Khi người dùng bấm vào đọc bài viết tại `/bai-viet/{id}`, backend kích hoạt `$post->increment('views');` tăng số lượt xem lên 1 đơn vị ngay trong database MySQL mà không cần bất kỳ script tracking nặng nề của bên thứ 3.
  3. **3 Nút Micro-control 1-chạm của Quản trị viên (`/admin/bai-viet`):**
     - **Ẩn / Hiện (`toggle-visibility`):** Đổi ngay lập tức cờ `is_visible` giữa `true` và `false`. Khi bài bị ẩn, toàn bộ trang chủ và `/bai-viet` phía người dùng lập tức không còn hiển thị bài viết đó.
     - **Ghim Bento (`toggle-featured`):** Khi Admin bật ghim cho một bài bất kỳ, bài đó lập tức trở thành bài lớn 8 cột trong Hero Bento ở đầu trang `/bai-viet`.
     - **Đóng / Mở Thảo luận (`toggle-comments`):** Khi Admin bấm khóa thảo luận, `allow_comments` chuyển sang `false`. Phía người dùng tại `/bai-viet/[id]`, form gửi bình luận lập tức bị khóa lại và hiển thị thông báo trang trọng kèm icon ổ khóa vector: *"Khung thảo luận cho bài viết này đã được tạm khóa bởi ban quản trị"*.
  4. **Góc Thảo luận 2 chiều & Phản hồi chính thức (Admin Reply):**
     - Độc giả hoặc khách hàng thành viên có thể gửi câu hỏi, nhận xét tại `/bai-viet/[id]`.
     - Bình luận được lưu vào bảng `post_comments` và lập tức hiển thị trên UI.
     - Bên trang `/admin/thao-luan`, Admin nhận được thông báo bình luận mới ở thẻ KPI *"Chưa phản hồi"*. Admin bấm nút **"Trả lời khách hàng"** để nhập câu trả lời của chuyên viên kỹ thuật.
     - Câu trả lời được lưu vào cột `admin_reply`. Phía trang chi tiết bài viết của khách hàng lập tức xuất hiện khối thẻ đen tuyền viền mỏng: **"Phản hồi chính thức từ Bảo Công Studio"** tạo uy tín tuyệt đối cho thương hiệu.

---

### 2.11. Thuật toán Kiểm tra & Upload File Ảnh (`PNG/JPG <= 10MB`) từ Client lên Laravel Server

- **Các file tham gia:**
  - **Backend Controller:** `backend/app/Http/Controllers/Api/UploadController.php` (hàm `uploadImage`)
  - **Backend Route:** `backend/routes/api.php` (`POST /api/upload-image` và `POST /api/admin/upload-image`)
  - **Frontend Admin Bài Viết:** `frontend/src/app/admin/bai-viet/page.jsx` (hàm `uploadImageFile`, `handleThumbnailFileChange`, `handleInlineImageFileChange`)
  - **Frontend Admin Sản Phẩm:** `frontend/src/app/admin/san-pham/page.jsx` (hàm `handleProductImageUpload`)
  - **Next.js Config:** `frontend/next.config.mjs` (cấu hình `images.remotePatterns` cho `localhost:8000`, `127.0.0.1:8000`)
- **Quy trình kiểm tra 2 lớp (Double-layer Validation) & Upload:**
  1. **Lớp 1 - Kiểm tra tức thì tại Client (Frontend Pre-flight Validation):**
     - **MIME Type:** Kiểm tra `file.type` phải thuộc tập hợp cho phép: `image/png`, `image/jpeg`, `image/jpg`. Nếu người dùng chọn file khác (như `.gif`, `.webp`, `.pdf`, `.mp4`), hệ thống chặn ngay tại trình duyệt và hiển thị thông báo lỗi: *"Chỉ chấp nhận file ảnh định dạng PNG hoặc JPG/JPEG!"*.
     - **Kích thước file:** Tính toán bằng công thức byte nhị phân `file.size <= 10 * 1024 * 1024` (tương đương chính xác 10.485.760 bytes = 10MB). Nếu vượt quá, thông báo lỗi ngay: *"Dung lượng ảnh vượt quá giới hạn cho phép (Tối đa 10MB)!"*.
     - **UX Phản hồi:** Hiển thị trạng thái *"Đang tải ảnh lên..."*, khóa nút chọn file để ngăn chặn duplicate request (spam click).
  2. **Lớp 2 - Kiểm tra nghiêm ngặt tại Backend Laravel (Server-side Validation):**
     - Nhận tập tin từ request (hỗ trợ cả trường `image` và `file`).
     - Áp dụng Laravel Validator:
       ```php
       $validator = Validator::make($request->all(), [
           $fieldName => ['required', 'file', 'mimes:png,jpg,jpeg', 'max:10240'],
       ], [
           "{$fieldName}.required" => 'Vui lòng chọn file ảnh để tải lên!',
           "{$fieldName}.file"     => 'Dữ liệu tải lên phải là một tập tin!',
           "{$fieldName}.mimes"    => 'Chỉ chấp nhận file ảnh định dạng PNG hoặc JPG/JPEG!',
           "{$fieldName}.max"      => 'Dung lượng ảnh vượt quá giới hạn cho phép (Tối đa 10MB)!',
       ]);
       ```
       *(Lưu ý: tham số `max:10240` của Laravel tính bằng Kilobytes, tương đương 10 Megabytes)*.
     - Nếu không vượt qua kiểm tra, trả về mã trạng thái HTTP **422 Unprocessable Entity** kèm cấu trúc JSON lỗi chi tiết.
  3. **Lưu trữ trực tiếp & Sinh URL độc lập không phụ thuộc Symlink:**
     - **Tạo tên file duy nhất:** Kết hợp timestamp hiện tại cùng slug tên gốc của ảnh và phần mở rộng an toàn:
       ```php
       $fileName = time() . '_' . Str::slug($originalName) . '.' . $extension;
       ```
     - **Lưu trực tiếp vào thư mục công khai:** Đưa file vào `backend/public/uploads/images/` bằng hàm `$file->move($destinationPath, $fileName)`. Nếu thư mục chưa tồn tại, hệ thống tự động tạo bằng `mkdir($destinationPath, 0755, true)`.
     - **Tạo URL tuyệt đối:** Sử dụng `asset('uploads/images/' . $fileName)` để tạo URL hoàn chỉnh (`http://localhost:8000/uploads/images/...`). Cơ chế này giúp cả giao diện Admin lẫn toàn bộ trang Người dùng (`/trangchu`, `/products`, `/bai-viet`) tải được ảnh ngay lập tức mà không cần tạo symlink `storage:link` của PHP Artisan.

---


---

### Thuật toán 8: Kiểm tra & Áp dụng Mã khuyến mãi (Coupons) (FUNC-ORDER-02)

- **Vị trí code:**
  - Backend Model: `backend/app/Models/Promotion.php` (các hàm `isValidForAmount()`, `calculateDiscount()`)
  - Backend Controller:
    - `backend/app/Http/Controllers/Api/Admin/AdminPromotionController.php` (hàm `applyPromotion()`, lines 45–87; `store()`, `update()`)
    - `backend/app/Http/Controllers/Api/OrderController.php` (hàm `store()`, lines 118–132, ghi nhận `coupon_code`, tính `discount`, tăng `used_count`)
  - Frontend Người dùng:
    - `frontend/src/app/cart/page.jsx` (Khung nhập Coupon & danh sách mã có sẵn)
    - `frontend/src/app/checkout/page.jsx` (Tự động áp dụng mã từ Giỏ hàng sang Thanh toán)
  - Frontend Quản trị:
    - `frontend/src/app/admin/khuyen-mai/page.jsx` (Quản trị CRUD voucher, theo dõi lượt dùng `used_count/usage_limit`)
- **Nguyên lý hoạt động 5 bước:**
  1. **Bước 1 - Tìm mã & Kiểm tra trạng thái kích hoạt:**
     - Truy vấn `Promotion::where('code', $code)->first()`.
     - Nếu không tồn tại: Báo lỗi 422: `Mã khuyến mãi «{code}» không tồn tại trên hệ thống!`.
     - Nếu `status !== 1`: Báo lỗi 422: `Mã khuyến mãi «{code}» hiện đang bị tạm khóa hoặc ngừng áp dụng!`.
  2. **Bước 2 - Kiểm tra thời hạn hiệu lực:**
     - So sánh `now()` với `start_date` và `end_date`.
     - Nếu `now() < start_date`: Báo lỗi `Mã khuyến mãi «{code}» chưa đến thời gian có hiệu lực!`.
     - Nếu `now() > end_date`: Báo lỗi `Mã khuyến mãi «{code}» đã hết hạn sử dụng!`.
  3. **Bước 3 - Kiểm tra giới hạn lượt dùng:**
     - Nếu `usage_limit > 0` và `used_count >= usage_limit`: Báo lỗi `Mã khuyến mãi «{code}» đã hết lượt sử dụng trên hệ thống!`.
  4. **Bước 4 - Kiểm tra giá trị đơn hàng tối thiểu:**
     - So sánh tạm tính `amount` với `min_order_value`.
     - Nếu `amount < min_order_value`: Báo lỗi `Đơn hàng chưa đạt giá trị tối thiểu {min_order_value} đ để áp dụng mã!`.
  5. **Bước 5 - Tính toán mức giảm:**
     - **Theo phần trăm (`percent`):** `discount = (amount * discount_value) / 100`. Nếu có cấu hình `max_discount_amount`, áp dụng chặn trên: `discount = min(discount, max_discount_amount)`.
     - **Theo tiền mặt cố định (`fixed`):** `discount = min(discount_value, amount)`.
     - Tính tổng thanh toán cuối cùng: `final_total = max(0, amount - discount + shipping_fee)`.
     - Khi đơn hàng tạo thành công: Gọi `$promo->increment('used_count')` để đảm bảo số lượt dùng luôn chính xác tuyệt đối.

---

### Thuật toán 9: Đồng bộ Tồn kho 4 Chiều (Inventory Sync Engine)

- **Vị trí code:**
  - Backend Model: `backend/app/Models/StockMovement.php`, `backend/app/Models/Product.php`
  - Backend Controller:
    - **Chiều 1 (Đặt hàng):** `backend/app/Http/Controllers/Api/OrderController.php` (hàm `store()`, lines 105–115 kiểm tra `quantity <= stock`, lines 185–186 gọi `$prod->decrement('stock', $line['quantity'])`)
    - **Chiều 2 (Hủy đơn hàng):**
      - Khách hàng tự hủy: `backend/app/Http/Controllers/Api/OrderController.php` (hàm `cancel()`, lines 220–225 gọi `Product::where('id', $d->product_id)->increment('stock', $d->quantity)`)
      - Quản trị viên hủy đơn: `backend/app/Http/Controllers/Api/Admin/AdminOrderController.php` (hàm `updateStatus()`, lines 160–175 tự động hoàn kho khi đơn chuyển sang `cancelled`)
    - **Chiều 3 (Nhập kho hàng loạt):** `backend/app/Http/Controllers/Api/Admin/AdminStockController.php` (hàm `storeImport()`, lines 101–153 tạo phiếu `NK-...`, lưu `stock_before`, `stock_after = stock_before + qty`, gọi `$product->update(['stock' => $stockAfter])`)
    - **Chiều 4 (Xuất kho chặn vượt tồn):** `backend/app/Http/Controllers/Api/Admin/AdminStockController.php` (hàm `storeExport()`, lines 156–215 kiểm tra `if ($qty > $stockBefore) throw Exception`, tạo phiếu `XK-...`, trừ kho an toàn qua `DB::transaction`)
  - Frontend Khách hàng & Quản trị:
    - `frontend/src/app/cart/page.jsx` (Kiểm tra `quantity <= stock` ngay khi bấm tăng số lượng)
    - `frontend/src/app/orders/[id]/page.jsx` (Nút `[Hủy đơn hàng]` chỉ hiện khi `pending`, tự động hoàn trả tồn kho)
    - `frontend/src/app/admin/kho-hang/page.jsx` (Tab Tồn kho thực tế cảnh báo thẻ màu: `stock = 0` Đỏ Hết hàng, `stock <= 5` Vàng Sắp hết hàng)
- **Nguyên lý hoạt động 4 chiều:**
  - Toàn bộ 4 thao tác đều bọc trong `DB::transaction()` và sử dụng `lockForUpdate()` để triệt tiêu hiện tượng tranh chấp ghi dữ liệu (Race Conditions) khi nhiều người cùng đặt mua hoặc thủ kho đang nhập/xuất đồng thời.

---

### Thuật toán 10: Ràng buộc Khóa ngoại & Toàn vẹn Dữ liệu Kế toán khi Xóa

- **Vị trí code:**
  - **Xóa Danh mục (`CategoryController.php`, lines 145–165):**
    - Kiểm tra `$category->products()->count() > 0`.
    - Nếu vi phạm, trả về HTTP 422: `"Không thể xóa danh mục «{name}» vì đang có {count} sản phẩm trực thuộc. Vui lòng chuyển hoặc xóa các sản phẩm này trước!"`.
  - **Xóa Thương hiệu (`BrandController.php`, lines 130–150):**
    - Kiểm tra `$brand->products()->count() > 0`.
    - Nếu vi phạm, trả về HTTP 422: `"Không thể xóa thương hiệu «{name}» vì đang có {count} sản phẩm trực thuộc. Vui lòng chuyển hoặc xóa các sản phẩm này trước!"`.
  - **Xóa Vĩnh viễn Sản phẩm (`ProductController.php`, lines 220–245):**
    - Kiểm tra `$product->orderDetails()->count() > 0`.
    - Nếu vi phạm, trả về HTTP 422: `"Không thể xóa vĩnh viễn sản phẩm «{name}» vì sản phẩm này đã từng phát sinh trong {count} đơn hàng lịch sử. Để bảo toàn dữ liệu kế toán, chỉ được phép xóa mềm (chuyển vào thùng rác)!"`.
  - **Xóa Chủ đề bài viết (`AdminPostCategoryController.php`, lines 125–145):**
    - Kiểm tra `$cat->posts()->count() > 0`.
    - Nếu vi phạm, trả về HTTP 422: `"Không thể xóa chủ đề bài viết «{name}» vì đang có {count} bài viết trực thuộc. Vui lòng chuyển hoặc xóa các bài viết trước!"`.
- **Nguyên tắc bảo vệ dữ liệu:**
  - Tuyệt đối không cho phép xóa mồ côi (orphaned records) hoặc làm vỡ lịch sử hóa đơn tài chính của khách hàng. Tất cả thông báo 422 được Frontend bắt và hiển thị trực tiếp lên modal hoặc alert box của Quản trị viên.


## 3. MẸO THAY ĐỔI THÔNG SỐ TẠI CHỖ KHI GIẢNG VIÊN YÊU CẦU

Khi vấn đáp, giảng viên thường yêu cầu chỉnh sửa nhanh một số thông số để kiểm tra xem sinh viên có thực sự hiểu code hay không. Dưới đây là vị trí chính xác để sửa trong 5 giây:

| Yêu cầu của Giảng viên | File cần mở | Vị trí dòng code & Cách sửa |
| :--- | :--- | :--- |
| **Đổi số lượng sản phẩm trên 1 trang phân trang** (ví dụ: từ 9 máy thành 6 máy) | `backend/app/Http/Controllers/Api/Admin/ProductController.php` | Tìm dòng `$perPage = (int) $request->input('per_page', 9);` ➔ đổi số `9` thành `6`.<br>Đồng thời trong `frontend/src/app/products/page.tsx` đổi `'per_page', '9'` thành `'6'`. |
| **Đổi thời gian nhảy chữ tìm kiếm** (ví dụ: từ 2.5s thành 1s hoặc 4s) | `frontend/src/components/SmartSearchBar.tsx` | Tìm hàm `useEffect`, dòng `}, 2500);` ➔ đổi `2500` thành `1000` (1 giây) hoặc `4000` (4 giây). |
| **Thêm mốc lọc khoảng giá mới** (ví dụ: mốc "Dưới 5 triệu") | `frontend/src/app/products/page.tsx` | Tại mảng `PRICE_PRESETS`, thêm phần tử:<br>`{ label: "Dưới 5 triệu", min: null, max: 5000000 },` |
| **Đổi mốc Miễn phí vận chuyển** (ví dụ: từ 5 triệu thành 10 triệu) | `backend/app/Http/Controllers/Api/OrderController.php` | Tìm dòng `private const FREE_SHIP_FROM = 5000000;` ➔ đổi thành `10000000`. |
| **Đổi số lượng sản phẩm liên quan gợi ý** (ví dụ: từ 4 máy thành 6 máy) | `backend/app/Http/Controllers/Api/Admin/ProductController.php` | Trong hàm `show()`, tìm dòng `->limit(4)->get();` ➔ đổi `4` thành `6`. |
| **Đổi nội dung câu gợi ý tìm kiếm luân phiên** | `frontend/src/components/SmartSearchBar.tsx` | Tìm mảng `SEARCH_SUGGESTIONS` ở đầu file và sửa hoặc thêm tên điện thoại mới. |
| **Đổi số lượng bài viết công nghệ trên 1 trang** (ví dụ: từ 9 bài thành 6 bài) | `backend/app/Http/Controllers/Api/PostController.php` | Tìm dòng `$perPage = (int) $request->get('per_page', 9);` ➔ đổi `9` thành `6`. Đồng thời trong `frontend/src/app/bai-viet/page.jsx` đổi `per_page: 9` thành `6`. |
| **Đổi số bài viết liên quan cùng chuyên mục** (ví dụ: từ 3 bài thành 4 bài) | `backend/app/Http/Controllers/Api/PostController.php` | Trong hàm `show()`, tìm dòng `->limit(3)->get();` ➔ đổi `3` thành số mong muốn. |
| **Đổi giới hạn dung lượng tải ảnh** (ví dụ: từ 10MB thành 5MB) | `backend/app/Http/Controllers/Api/UploadController.php` | Trong hàm `uploadImage`, đổi `'max:10240'` thành `'max:5120'`.<br>Đồng thời trong `frontend/src/app/admin/bai-viet/page.jsx` và `frontend/src/app/admin/san-pham/page.jsx` đổi `10 * 1024 * 1024` thành `5 * 1024 * 1024`. |

---

## 4. TÀI KHOẢN ĐĂNG NHẬP MẪU

| Vai trò | Email đăng nhập | Mật khẩu | Chức năng kiểm thử |
| :--- | :--- | :--- | :--- |
| **Quản trị viên Super Admin** *(Khuyên dùng)* | `admin@baocong.vn` | `password123` | Toàn quyền quản trị cao nhất: Quản lý Sản phẩm, Danh mục, Đơn hàng, Tồn kho 4 chiều, Khóa/Mở khóa User, Duyệt review, Phản hồi thảo luận |
| **Quản trị viên dự phòng** | `admin@baocong.com` / `admin@example.com` | `password123` | Quyền Quản trị viên Admin đồng bộ |
| **Khách hàng thân thiết** *(Khuyên dùng)* | `khachhang@baocong.vn` | `password123` | Có sẵn 3 đơn hàng lịch sử (#BC-20261001, #BC-20261002, #BC-20261005), Mua sắm, Áp mã voucher, Gửi review, Gửi phiếu hỗ trợ |
| **Khách hàng dự phòng** | `user@gmail.com` | `password123` | Tài khoản khách hàng thông thường |
