# Cập nhật: Trang chủ khách + Upload ảnh trong Admin

## Lần đầu chạy backend (thư mục backend chưa có vendor)
```powershell
cd backend
composer install                # tạo thư mục vendor (hết lỗi đỏ "Undefined type" trong VS Code)
copy .env.example .env          # rồi sửa DB_DATABASE / DB_USERNAME / DB_PASSWORD cho đúng máy bạn
php artisan key:generate
```
Import `docs/bao_cong.sql` vào MySQL (tạo sẵn database `bao_cong`) hoặc chạy `php artisan migrate`.
Nếu bạn đã có bản backend chạy được (có `artisan`, `vendor`, `.env`), KHÔNG cần các file này:
chỉ chép đè các file trong mục "File đã thêm / sửa" vào bản đó.

## Chạy lại sau khi cập nhật
```bash
# Backend
cd backend
php artisan storage:link        # tạo liên kết public/storage -> storage/app/public (chỉ cần chạy 1 lần)
php artisan serve               # http://127.0.0.1:8000

# Frontend
cd frontend
npm install
npm run dev                     # http://localhost:3000
```
> Nếu `storage:link` báo "link already exists" thì xóa thư mục `backend/public/storage` rồi chạy lại.
> Không cần chạy migrate: không có thay đổi cấu trúc database.

## 1. Upload ảnh từ máy (Admin)
- Trang **/admin/products**, **/admin/categories**, **/admin/brands**: ô "Link ảnh" được thay bằng nút **Chọn ảnh từ máy**
  (xem trước, đổi ảnh, xóa ảnh; JPG/PNG/WEBP/GIF, tối đa 2MB).
- Ảnh lưu ở `backend/storage/app/public/{products|categories|brands}/` và được hiển thị qua `/storage/...`.
- Form gửi dạng `multipart/form-data`; khi SỬA gửi `POST` kèm `_method=PUT` (PHP không đọc được body multipart của PUT).
- Sửa sản phẩm mà không chọn ảnh mới thì giữ ảnh cũ; bấm "Xóa ảnh" sẽ xóa file cũ.
- Mọi response của sản phẩm/danh mục/thương hiệu có thêm trường `image_url` (URL đầy đủ để hiển thị).
- Ảnh cũ nhập bằng link `http(s)://...` hoặc nằm trong `public/uploads/` vẫn hiển thị bình thường.

## 2. Trang chủ khách (`/`)
- Banner tự chuyển (3 slide), 4 ô cam kết, danh mục, thương hiệu.
- **Sản phẩm mới** (mới thêm nhất), **Đang giảm giá** (giảm nhiều nhất trước), **Nổi bật**
  (admin tick "Sản phẩm nổi bật", sau đó đến sản phẩm nhiều lượt xem).
- **Tất cả sản phẩm**: tab lọc nhanh (Tất cả / Mới / Giảm giá / Nổi bật), lọc theo danh mục (có danh mục con) và hãng,
  tìm kiếm, sắp xếp (mới nhất / xem nhiều / giá tăng / giá giảm), **phân trang 12 sản phẩm/trang** xử lý ở server.
- Trang chi tiết sản phẩm `/products/{id}` (chọn số lượng, thêm vào giỏ, sản phẩm cùng danh mục); mỗi lượt xem cộng vào `views`.
- Bộ lọc đọc được từ đường dẫn, ví dụ `/?filter=sale`, `/?category=2`, `/?brand=1`, `/?q=iphone`.

## API mới / đã mở rộng
| API | Mô tả |
|---|---|
| `GET /api/home?limit=8` | Trả `{ new, sale, hot }` cho trang chủ |
| `GET /api/products?page=&per_page=&q=&category_id=&brand_id=&filter=new\|sale\|hot&sort=newest\|popular\|price-asc\|price-desc` | Danh sách có lọc + phân trang |
| `GET /api/products/{id}` | Sản phẩm ẩn trả 404 với khách; tăng `views` |
| `POST/PUT /api/admin/{products,categories,brands}` | Nhận file `image` (+ `remove_image=1` để xóa ảnh) |

## File đã thêm / sửa
Backend: `Controllers/Api/Admin/{ProductController,AdminProductController,AdminCategoryController,AdminBrandController}.php`,
`Models/Concerns/HasImageUrl.php` (mới), `Models/{Product,Category,Brand}.php`, `Support/Media.php`, `routes/api.php`.
Frontend: `app/page.tsx`, `app/products/[id]/page.tsx` (mới), `app/layout.tsx`, `components/shop/*` (mới),
`components/ResourceManager.tsx`, `app/admin/{products,categories,brands}/page.tsx`, `lib/{api,shop,useShop}.ts`.
