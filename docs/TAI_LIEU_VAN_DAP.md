# CẨM NANG VẤN ĐÁP ĐỒ ÁN THỰC HÀNH LẬP TRÌNH WEB (THLTW)
## DỰ ÁN: WEBSITE BÁN HÀNG ĐIỆN THOẠI BẢO CÔNG MOBILE
**Sinh viên thực hiện:** Đỗ Gia Bảo  
**Công nghệ sử dụng:** Backend Laravel 11 (PHP 8.2+, MySQL `bao_cong`, Sanctum) + Frontend Next.js 16 (React 19, Tailwind CSS, Turbopack)  
**Nhánh Git:** `DOGIABAO`  
**Quy chuẩn thiết kế:** 100% Vector SVG từ `@/components/Icons.tsx` (Nghiêm cấm Emoji), Bento Tech Grid, Không dùng Mock Data (100% Dynamic MySQL Database).

---

## MỤC LỤC TRA CỨU NHANH (5 GIÂY)
1. [Sơ Đồ Cây Thư Mục & Vai Trò Từng File](#1-sơ-đồ-cây-thư-mục--vai-trò-từng-file)
2. [Chi Tiết 6 Thuật Toán Cốt Lõi (Có File & Dòng Code)](#2-chi-tiết-6-thuật-toán-cốt-lõi)
   - [Thuật toán 1: Tìm kiếm thật & Luân phiên nhảy từ khóa](#thuật-toán-1-tìm-kiếm-thời-gian-thực-debounce--sql-like--luân-phiên-nhảy-gợi-ý)
   - [Thuật toán 2: Lọc đa tiêu chí kết hợp Phân trang](#thuật-toán-2-lọc-đa-tiêu-chí-kết-hợp-phân-trang-pagination)
   - [Thuật toán 3: Gợi ý sản phẩm liên quan](#thuật-toán-3-gợi-ý-sản-phẩm-liên-quan-cùng-hãng--danh-mục)
   - [Thuật toán 4: Đánh giá sao, Thống kê & Phản hồi Admin](#thuật-toán-4-đánh-giá-sao-thống-kê-phân-bố-và-đồng-bộ-kiểm-duyệt-admin)
   - [Thuật toán 5: Quản lý User (Khóa tài khoản & Gom Đơn hàng vào 1 trang)](#thuật-toán-5-quản-lý-người-dùng-blockunblock-và-gom-toàn-bộ-đơn-hàng-vào-cùng-1-trang)
   - [Thuật toán 6: Cơ chế Đồng bộ dữ liệu 100% Khách hàng ⇄ Quản trị](#thuật-toán-6-cơ-chế-đồng-bộ-hai-chiều-user--admin)
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
│   │   │   │   ├── AdminOrderController.php       # Quản lý đơn hàng, đổi trạng thái đơn, thanh toán, doanh thu
│   │   │   │   ├── CategoryController.php         # Danh mục sản phẩm kèm đếm số lượng máy (products_count)
│   │   │   │   └── BrandController.php            # Thương hiệu (Apple, Samsung...) kèm đếm số lượng máy
│   │   │   ├── AuthController.php                 # Đăng ký, Đăng nhập (chặn đăng nhập nếu status = 0), Đăng xuất
│   │   │   ├── OrderController.php                # Đặt hàng từ giỏ (chặn user bị khóa), lịch sử đơn hàng cá nhân
│   │   │   ├── CartController.php                 # Giỏ hàng cá nhân (thêm, sửa số lượng, xóa)
│   │   │   └── SupportTicketController.php        # Tiếp nhận form yêu cầu hỗ trợ từ khách hàng vãng lai & thành viên
│   ├── Models/
│   │   ├── Product.php                            # Quan hệ category(), brand(), reviews(), cartItems()
│   │   ├── User.php                               # Quan hệ orders(), reviews(), supportTickets()
│   │   ├── Review.php                             # Bảng đánh giá sao: product_id, reviewer_name, rating, comment, admin_reply
│   │   ├── SupportTicket.php                      # Bảng phiếu hỗ trợ: name, phone, email, order_code, subject, message, status
│   │   ├── Order.php & OrderDetail.php            # Bảng đơn hàng và chi tiết sản phẩm đơn hàng
│   │   └── Category.php & Brand.php               # Bảng danh mục và thương hiệu
├── database/
│   ├── migrations/
│   │   ├── ..._create_products_table.php          # Cấu trúc bảng products (price, sale_price, stock, status, sku)
│   │   ├── ..._create_carts_and_orders_tables.php # Cấu trúc carts, orders, order_details
│   │   └── ..._create_reviews_and_support_tickets_tables.php # Cấu trúc reviews và support_tickets
│   └── seeders/
│       └── DatabaseSeeder.php                     # Nạp dữ liệu chuẩn: 12 điện thoại, 18 đánh giá, 5 đơn hàng, 4 phiếu hỗ trợ
└── routes/
    └── api.php                                    # Định nghĩa toàn bộ RESTful API Public, Staff và Super Admin
```

### B. Phân Hệ Frontend (Next.js 16 App Router)
```
frontend/src/
├── app/
│   ├── trangchu/page.tsx                          # Trang chủ chính thức: Bento Banner, Cam kết, Sản phẩm hot, Sale, Mới
│   ├── products/page.tsx                          # Trang Tất cả sản phẩm: 2 cột (Sidebar Danh mục, Hãng, Giá + Lưới sản phẩm & Phân trang)
│   ├── products/[id]/page.tsx                     # Chi tiết sản phẩm: Ảnh nét, Giá sale, Sản phẩm liên quan, Reviews & Form gửi đánh giá
│   ├── ho-tro/page.tsx                            # Trang Hỗ trợ: Giới thiệu shop, Chính sách 1 đổi 1, FAQ & Form gửi phiếu hỗ trợ
│   ├── sale/page.tsx                              # URL rút gọn tự động chuyển hướng sang /products?type=sale
│   ├── san-pham-moi/page.tsx                      # URL rút gọn tự động chuyển hướng sang /products?type=new
│   ├── cart/page.tsx                              # Giỏ hàng khách hàng
│   ├── checkout/page.tsx                          # Thanh toán & Đặt hàng trực tiếp vào MySQL
│   ├── orders/page.tsx                            # Lịch sử theo dõi đơn hàng của khách hàng
│   ├── login/page.tsx & register/page.tsx         # Đăng nhập & Đăng ký tài khoản
│   ├── admin/
│   │   ├── layout.jsx                             # Admin Layout: Auth Guard chống bypass, Sidebar điều hướng High-Density
│   │   ├── nguoi-dung/page.jsx                    # Quản lý User: Khóa/Mở khóa (Block), Xem chi tiết User + Toàn bộ đơn hàng trên 1 trang
│   │   ├── danh-gia/page.jsx                      # Quản lý Đánh giá: Duyệt/Ẩn, Trả lời câu hỏi khách (Admin Reply), Xóa
│   │   ├── ho-tro/page.jsx                        # Quản lý Phiếu hỗ trợ: Cập nhật tiến độ xử lý, ghi chú CSKH
│   │   ├── don-hang/page.jsx                      # Quản lý Đơn hàng: Cập nhật tiến độ giao và trạng thái thanh toán
│   │   ├── san-pham/page.jsx                      # Quản lý Sản phẩm: Sửa giá gốc, giá sale, số lượng tồn kho, ẩn/hiện
│   │   ├── danh-muc/page.jsx                      # Quản lý Danh mục sản phẩm
│   │   └── thuong-hieu/page.jsx                   # Quản lý Thương hiệu điện thoại
├── components/
│   ├── SmartSearchBar.tsx                         # Thanh tìm kiếm: setInterval 2.5s luân phiên chữ, debounce 300ms, brand jump, top 5 gợi ý
│   ├── StoreHeader.tsx                            # Header thống nhất: 5 mục menu điều hướng, giỏ hàng, thông tin user hydration-safe
│   └── Icons.tsx                                  # Thư viện 100% SVG Vector (BrandLogo, Star, Shield, Bolt, Refresh, Trash...)
└── services/
    └── axiosClient.js                             # Axios cấu hình baseURL: http://localhost:8000/api, tự động gán Bearer Token & bắt lỗi 401/403
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

---

## 4. TÀI KHOẢN ĐĂNG NHẬP MẪU

| Vai trò | Email đăng nhập | Mật khẩu | Chức năng kiểm thử |
| :--- | :--- | :--- | :--- |
| **Quản trị viên Super Admin** | `admin@baocong.com` | `password` | Toàn quyền quản trị: Quản lý User, Khóa/Mở khóa tài khoản, Kiểm duyệt review, Quản lý đơn hàng, Xử lý phiếu hỗ trợ |
| **Quản trị viên phụ** | `admin@example.com` | `password` | Quyền Quản trị viên Admin |
| **Khách hàng thân thiết** | `user@gmail.com` | `password` | Xem sản phẩm, Đặt hàng, Xem lịch sử đơn, Gửi đánh giá review, Gửi phiếu hỗ trợ |
