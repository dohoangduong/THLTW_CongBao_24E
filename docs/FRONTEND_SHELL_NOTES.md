# Tài Liệu Ghi Chú Kiến Trúc Giao Diện Khung (Layout Shells)

Tài liệu này ghi chú chi tiết về kiến trúc, vai trò, cơ chế hoạt động và hướng dẫn sử dụng hai Layout Shell cốt lõi trong ứng dụng frontend của dự án `THLTW_CongBao_24E`:
- `PageShell.tsx` (`src/components/PageShell.tsx`)
- `ShopShell.tsx` (`src/components/shop/ShopShell.tsx`)

---

## 1. Tổng quan về `PageShell.tsx`

### 1.1. Vai trò và Mục đích
- **Thành phần**: Server/Static Component tối giản, không yêu cầu client state phức tạp.
- **Vai trò**: Cung cấp khung bố cục chuẩn mực, nhẹ nhàng cho các trang chức năng độc lập hoặc các trang form (Đăng nhập, Đăng ký, Quản lý tài khoản cá nhân, Quản lý đơn hàng, Giỏ hàng, Chi tiết đơn hàng, Thanh toán...).
- **Cung cấp Design Tokens**: Đóng vai trò là nơi xuất bản các hằng số CSS Tailwind tiêu chuẩn dùng chung trên toàn bộ ứng dụng nhằm đảm bảo tính đồng nhất về giao diện (UI consistency).

### 1.2. Các hằng số Style (Design Tokens) được export
Các hằng số này được tái sử dụng rộng rãi ở các trang form và trang quản trị:

| Hằng số | Giá trị Tailwind CSS | Ý nghĩa & Ứng dụng |
| :--- | :--- | :--- |
| `inputCls` | `w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-600` | Định dạng chuẩn cho mọi trường nhập liệu (`<input>`, `<select>`, `<textarea>`). Bo góc nhẹ, viền xám nhạt, đổi màu viền sang xanh dương đậm khi focus. |
| `btnPrimary` | `rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300` | Nút bấm hành động chính (Primary Action). Nền xanh dương `blue-600`, chữ trắng, bo góc vừa (`rounded-xl`), hiệu ứng hover làm đậm và tự động chuyển sang màu xám mờ + vô hiệu hóa con trỏ khi `disabled`. |
| `btnGhost` | `rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-900` | Nút bấm phụ (Secondary / Outline Action). Nền trắng, viền xám, đổi sang viền xám đậm `slate-900` khi hover. |
| `card` | `rounded-2xl border border-slate-200 bg-white p-5` | Khung thẻ chứa nội dung nổi bật. Nền trắng, bo tròn lớn (`rounded-2xl`), viền mảnh tinh tế và padding `p-5`. |

### 1.3. Cấu trúc Component `PageShell({ title, children, narrow })`
```tsx
export function PageShell({
  title,
  children,
  narrow = false
}: {
  title: string;
  children: ReactNode;
  narrow?: boolean;
})
```

- **Khung bao ngoài**: Bao phủ toàn bộ màn hình với chiều cao tối thiểu `min-h-screen`, nền màu trung tính `#F1F4F2`, màu chữ chính `text-slate-900`.
- **Header tĩnh**:
  - Viền dưới mảnh `border-b border-slate-200`, nền trắng.
  - Logo thương hiệu bên trái: **Bảo Công <span className="text-blue-600">Mobile</span>** liên kết về trang chủ `/`.
  - Thanh điều hướng tĩnh (`nav`) góc phải chứa 4 liên kết cơ bản:
    - `Cửa hàng` (`/`)
    - `Giỏ hàng` (`/cart`)
    - `Đơn hàng` (`/orders`)
    - `Tài khoản` (`/profile`)
- **Main Container**:
  - Hỗ trợ prop điều khiển bố cục `narrow` (mặc định là `false`):
    - Khi `narrow = true`: Giới hạn chiều rộng tối đa ở mức `max-w-md` (thường dùng cho form đăng nhập `/login`, đăng ký `/register` để form luôn gọn gàng ở giữa trang).
    - Khi `narrow = false`: Mở rộng chiều rộng tối đa lên `max-w-6xl` (thích hợp cho các trang hiển thị bảng biểu, danh sách đơn hàng, giỏ hàng, thông tin tài khoản).
  - Tự động hiển thị tiêu đề trang dạng thẻ `<h1>` với class font đậm `text-2xl font-extrabold mb-6` từ prop `title` trước khi render nội dung `children`.

### 1.4. Component phụ trợ `ErrorBox({ message })`
- **Mục đích**: Hiển thị thông điệp lỗi từ API hoặc form validate một cách trực quan, chuẩn accessibility.
- **Cơ chế hoạt động**:
  - Nếu `message` rỗng hoặc `undefined/null`: Trả về `null` (không render DOM dư thừa).
  - Nếu có `message`: Render thẻ `<p role="alert">` với phong cách cảnh báo: nền đỏ pastel `bg-red-50`, viền `border-red-200`, chữ màu đỏ đậm `text-red-700`, bo góc `rounded-xl`.

---

## 2. Tổng quan về `ShopShell.tsx`

### 2.1. Vai trò và Mục đích
- **Thành phần**: Client Component (`"use client"`).
- **Vai trò**: Là khung giao diện chính tương tác đầy đủ tính năng dành cho khách hàng mua sắm (áp dụng cho trang chủ `/`, trang chi tiết sản phẩm `/products/[id]`...).
- **Tích hợp State toàn cục**: Kết nối trực tiếp với custom hook `useShop()` (`@/lib/useShop`) để quản lý phiên đăng nhập, trạng thái giỏ hàng, thông báo toast tự động và các thao tác mua sắm.

### 2.2. Cơ chế hoạt động với `useShop()` và Render Props
`ShopShell` áp dụng mẫu thiết kế **Render Props** thông qua thuộc tính `children`:
```tsx
interface Props {
  search?: string;
  onSearch?: (value: string) => void;
  children: (shop: Shop) => ReactNode;
}
```
- Khi khởi tạo, `ShopShell` thực thi hook:
  ```tsx
  const shop = useShop();
  const { token, user, cartCount, toast, logout } = shop;
  ```
- Khi render phần thân trang:
  ```tsx
  <main className="mx-auto max-w-6xl px-4 py-8">{children(shop)}</main>
  ```
- **Lợi ích kiến trúc**:
  - Các trang con (như Home hay Product Detail) nhận trực tiếp đối tượng `shop` (bao gồm `addToCart`, `addingId`, `cartCount`, `user`, `token`, `showToast`...) dưới dạng tham số của hàm `children`.
  - Giúp tránh việc phải gọi lại `useShop()` nhiều lần hoặc truyền props qua nhiều tầng (prop drilling), đảm bảo trạng thái dữ liệu người dùng và giỏ hàng luôn được đồng bộ duy nhất từ một nguồn.

### 2.3. Thanh điều hướng thông minh (Sticky Header)
- **Hiệu ứng bám dính**: `sticky top-0 z-20` kết hợp nền trắng mờ `bg-white/95 backdrop-blur`, giúp header luôn hiển thị khi người dùng cuộn xem danh mục sản phẩm dài mà không che mất nội dung bên dưới.
- **Ô tìm kiếm linh hoạt (`searchBox`)**:
  - Chỉ hiển thị khi trang cha truyền callback `onSearch`.
  - **Hỗ trợ Responsive tối ưu**:
    - Trên màn hình máy tính / tablet (`sm:block` trở lên): Ô tìm kiếm nằm ở trung tâm header, co giãn linh hoạt (`flex-1`).
    - Trên màn hình điện thoại di động (`sm:hidden`): Ô tìm kiếm tự động tách xuống một hàng phụ độc lập ngay bên dưới thanh điều hướng, giúp giao diện không bị chật chội hay vỡ layout.
- **Phân quyền và Trạng thái xác thực trên Menu**:
  - **Quyền Quản trị viên (`user?.role === "admin"`)**: Tự động hiển thị nút liên kết **Quản trị** với màu nền vàng hổ phách (`bg-amber-100 text-amber-900`) dẫn đến trang Dashboard `/admin`.
  - **Trạng thái Đã đăng nhập (`token` tồn tại)**:
    - Hiển thị link **Đơn hàng** (`/orders`).
    - Hiển thị lời chào cá nhân hóa **Chào, {user?.name}** dẫn tới trang `/profile`.
    - Hiển thị nút bấm **Đăng xuất** gọi trực tiếp hàm `logout()` (xóa token và reset giỏ hàng).
  - **Trạng thái Khách vãng lai (Chưa đăng nhập)**:
    - Hiển thị nút **Đăng nhập** (`/login`).
    - Hiển thị nút **Đăng ký** nổi bật (`/register`) dạng pill button viền bo tròn nền xanh.
- **Huy hiệu số lượng giỏ hàng (Cart Badge)**:
  - Nút **Giỏ hàng** (`/cart`) dạng viên thuốc có viền.
  - Khi `cartCount > 0`: Tự động kích hoạt huy hiệu đỏ rực `bg-red-600 text-white rounded-full` nằm đè ở góc trên bên phải (`absolute -right-2 -top-2`), hiển thị tổng số lượng sản phẩm đang có trong giỏ hàng.

### 2.4. Chân trang chuyên nghiệp (Footer)
- Phân chia bố cục lưới responsive 4 cột (`sm:grid-cols-2 lg:grid-cols-4`):
  1. **Cột 1 - Giới thiệu thương hiệu**: Tên thương hiệu Bảo Công Mobile và thông điệp cam kết (hàng chính hãng, giá niêm yết, giao nhanh toàn quốc).
  2. **Cột 2 - Liên kết Mua sắm**: Đường dẫn nhanh tới Cửa hàng (`/`), Giỏ hàng (`/cart`), Đơn hàng cá nhân (`/orders`).
  3. **Cột 3 - Liên kết Tài khoản**: Đăng nhập (`/login`), Đăng ký (`/register`), Thông tin cá nhân (`/profile`).
  4. **Cột 4 - Chính sách cam kết**: Bảo hành 12 tháng, Đổi trả trong 7 ngày nếu lỗi nhà sản xuất, Thanh toán tiền mặt khi nhận hàng (COD).
- **Dòng bản quyền**: Tự động tính toán năm hiện tại qua `new Date().getFullYear()` đảm bảo tính cập nhật tự động.

### 2.5. Hệ thống thông báo nổi (Toast Notification)
- Tích hợp trực tiếp với thuộc tính `toast` của `useShop`:
  ```tsx
  {toast && (
    <div
      role="status"
      className={`fixed bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-full px-5 py-2.5 text-sm font-medium text-white shadow-lg ${
        toast.ok ? "bg-slate-900" : "bg-red-600"
      }`}
    >
      {toast.text}
    </div>
  )}
  ```
- **Vị trí cố định**: Neo ngay giữa đáy màn hình (`fixed bottom-6 left-1/2 -translate-x-1/2`), nổi bật với hiệu ứng bóng đổ `shadow-lg` và `z-30`.
- **Phản hồi trạng thái bằng màu sắc**:
  - Khi thành công (`toast.ok === true`): Nền xám đen sang trọng `bg-slate-900` (ví dụ: "Đã thêm iPhone 15 vào giỏ").
  - Khi thất bại hoặc gặp lỗi (`toast.ok === false`): Nền đỏ cảnh báo `bg-red-600` (ví dụ: "Mất kết nối máy chủ").
- **Tự động biến mất**: Cơ chế bên trong hook `useShop()` tự hủy thông báo sau 2500ms.

---

## 3. Bảng so sánh và Tiêu chí lựa chọn: `PageShell` vs `ShopShell`

| Đặc điểm | `PageShell.tsx` | `ShopShell.tsx` |
| :--- | :--- | :--- |
| **Loại Component** | Server / Static Component (Nhẹ) | Client Component (`"use client"`) |
| **Quản lý State** | Không quản lý state trực tiếp | Tích hợp sâu hook `useShop()` (Auth, Cart, Toast) |
| **Kiểu truyền Children** | `children: ReactNode` chuẩn | Render Props: `children: (shop: Shop) => ReactNode` |
| **Thanh tìm kiếm** | Không có | Có hỗ trợ, responsive tách hàng trên mobile khi có `onSearch` |
| **Thanh điều hướng** | Tĩnh, danh sách link cố định | Động theo quyền (`admin`), trạng thái (`token`, `user`), badge giỏ hàng |
| **Footer** | Không có | Footer đầy đủ 4 cột thông tin, chính sách & bản quyền |
| **Hệ thống Toast** | Không tích hợp sẵn | Tự động hiển thị và định dạng theo `toast.ok` |
| **Độ rộng Main (`narrow`)** | Hỗ trợ chuyển đổi giữa `max-w-md` và `max-w-6xl` | Cố định `max-w-6xl` tối ưu cho danh sách sản phẩm |
| **Tài nguyên kèm theo** | Xuất bản Design Tokens (`inputCls`, `btnPrimary`, `btnGhost`, `card`) & `ErrorBox` | Nhận trực tiếp đối tượng shop từ hook `useShop()` |

### Hướng dẫn lựa chọn sử dụng:
1. **Sử dụng `ShopShell` khi**:
   - Xây dựng các trang hiển thị sản phẩm chính của khách hàng (như trang chủ `/`, trang chi tiết sản phẩm `/products/[id]`).
   - Trang cần thanh tìm kiếm sản phẩm trên header.
   - Trang cần thêm sản phẩm vào giỏ hàng ngay lập tức và muốn cập nhật badge giỏ hàng, hiển thị thông báo toast mà không cần tải lại trang.
   - Trang cần hiển thị đầy đủ chân trang thương hiệu và các liên kết mua sắm/chính sách.

2. **Sử dụng `PageShell` khi**:
   - Xây dựng các trang chức năng, biểu mẫu độc lập: Đăng ký (`/register`), Đăng nhập (`/login`) (sử dụng prop `narrow={true}`).
   - Trang thông tin tài khoản (`/profile`), trang quản lý đơn hàng (`/orders`, `/orders/[id]`), trang thanh toán (`/checkout`), giỏ hàng tĩnh (`/cart`).
   - Sử dụng các hằng số CSS tái sử dụng (`inputCls`, `btnPrimary`, `btnGhost`, `card`) và hộp báo lỗi `ErrorBox` để xây dựng giao diện form nhất quán với toàn hệ thống.
