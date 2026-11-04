# BẢO CÔNG STUDIO — HƯỚNG DẪN CÀI ĐẶT & CHẤM ĐỒ ÁN

- **Học phần:** Thực hành Lập trình Web
- **Sinh viên thực hiện:** Đỗ Gia Bảo & Đoàn Nguyễn Thành Công
- **Công nghệ:** Backend Laravel 11 (Port 8000) + Frontend Next.js JavaScript (Port 3000) + MySQL (XAMPP Port 3306)
- **Tài liệu thuật toán vấn đáp:** [TAI_LIEU_VAN_DAP.md](file:///d:/TongHop/THLTW_CongBao_24E/docs/TAI_LIEU_VAN_DAP.md)

---

## 1. KHỞI TẠO DATABASE (MYSQL - XAMPP)

Bật **Apache** và **MySQL** trên XAMPP Control Panel, vào `http://localhost/phpmyadmin` tạo database trống tên là **`bao_cong`** (`utf8mb4_unicode_ci`), sau đó chọn 1 trong 2 cách:

- **Cách 1 (Dùng lệnh tự động trong thư mục `backend`):**
  ```bash
  php artisan migrate:fresh --seed
  ```
- **Cách 2 (Import file SQL):**
  Chọn database `bao_cong` trong phpMyAdmin ➔ Bấm tab **Import** ➔ Chọn file `docs/bao_cong.sql` ➔ Bấm **Import**.

---

## 2. LỆNH CHẠY DỰ ÁN (MỞ 2 TERMINAL)

**Terminal 1 — Chạy Backend Laravel (Port 8000):**
```bash
cd backend
composer install
copy .env.example .env
php artisan key:generate
php artisan serve --port=8000
```

**Terminal 2 — Chạy Frontend Next.js (Port 3000):**
```bash
cd frontend
npm install
npm run dev
```

➔ Truy cập Website tại: **[http://localhost:3000/trangchu](http://localhost:3000/trangchu)**

---

## 3. TÀI KHOẢN ĐĂNG NHẬP & DỮ LIỆU TEST

Hệ thống dùng chung 1 cổng đăng nhập tại **[http://localhost:3000/login](http://localhost:3000/login)** (tự động phân luồng vào `/admin` hoặc `/trangchu` theo quyền):

| Vai trò | Email | Mật khẩu | Ghi chú kiểm thử |
| :--- | :--- | :--- | :--- |
| **Admin (Quản trị)** | `admin@baocong.vn` | `password123` | Toàn quyền quản trị hệ thống (`/admin`) |
| **Khách hàng (VIP)** | `khachhang@baocong.vn` | `password123` | Có sẵn lịch sử đơn hàng (`#BC-20261001`...`1005`), SĐT xác minh quên mật khẩu: `0901234567` |
| **Khách hàng 2** | `user@gmail.com` | `password123` | Tài khoản khách hàng thường |

- **Mã giảm giá dùng thử tại Giỏ hàng (`/cart`):** `VOUCHER500`, `TECH10`, `VIPMEMBER`, `FREESHIP`

---

## 4. TÓM TẮT CÁC CHỨC NĂNG ĐỒNG BỘ 2 CHIỀU (USER ⇄ ADMIN)

1. **Sản phẩm & Kho hàng:**
   - **Khách hàng (`/trangchu`, `/products`):** Tìm kiếm gợi ý thông minh (Debounce), lọc theo danh mục, hãng, khoảng giá và phân trang.
   - **Admin (`/admin/san-pham`, `/admin/danh-muc`, `/admin/kho-hang`):** Thêm/sửa/xóa mềm (SoftDeletes), chỉnh giá Sale, quản lý nhập/xuất kho tự động đồng bộ tồn kho khi đặt hoặc hủy đơn.
2. **Đặt hàng & Quản lý Đơn hàng:**
   - **Khách hàng (`/cart`, `/checkout`, `/orders`):** Thêm giỏ hàng, áp mã giảm giá, đặt hàng, theo dõi trạng thái đơn và hủy đơn đang chờ xác nhận.
   - **Admin (`/admin/don-hang`):** Duyệt trạng thái đơn hàng và tự động ghi lịch sử cập nhật.
3. **Bài viết Công nghệ & Thảo luận:**
   - **Khách hàng (`/bai-viet`, `/bai-viet/[id]`):** Đọc bài viết theo chuyên mục, tự động tăng lượt xem và gửi bình luận thảo luận cuối bài.
   - **Admin (`/admin/bai-viet`, `/admin/thao-luan`):** Đăng/sửa/ẩn bài viết, ghim bài nổi bật (Bento), đóng/mở bình luận, ẩn bình luận vi phạm và phản hồi chính thức.
4. **Đánh giá Sao (Review) & Hỗ trợ Bảo hành (Ticket):**
   - **Khách hàng (`/products/[id]`, `/ho-tro`):** Đánh giá 1-5 sao cho sản phẩm; gửi phiếu yêu cầu hỗ trợ kỹ thuật/bảo hành.
   - **Admin (`/admin/danh-gia`, `/admin/ho-tro`):** Ẩn/hiện và trả lời đánh giá; tiếp nhận và cập nhật tiến độ xử lý phiếu hỗ trợ.
5. **Quản lý Người dùng & Bảo mật Tài khoản:**
   - **Khách hàng (`/login`, `/forgot-password`, `/profile`):** Đăng nhập phân quyền tự động, khôi phục mật khẩu và cập nhật hồ sơ cá nhân.
   - **Admin (`/admin/nguoi-dung`):** Xem chi tiết thông tin kèm lịch sử đơn hàng của từng khách; Khóa/Mở khóa (Block/Unblock) tài khoản tức thì.
