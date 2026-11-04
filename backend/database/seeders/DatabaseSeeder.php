<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Review;
use App\Models\SupportTicket;
use App\Models\Post;
use App\Models\PostComment;
use App\Models\Setting;
use App\Models\Banner;
use App\Models\Menu;
use App\Models\Page;
use App\Models\Promotion;
use App\Models\StockMovement;
use App\Models\OrderStatusHistory;

class DatabaseSeeder extends Seeder
{
    /**
     * Nạp dữ liệu mẫu thực tế cho Website Bán Điện Thoại Bảo Công Mobile.
     */
    public function run(): void
    {
        // =========================================================================
        // 1. TẠO TÀI KHOẢN NGƯỜI DÙNG (USERS)
        // =========================================================================

        // Admin 1 (Chính)
        $admin1 = User::updateOrCreate(
            ['email' => 'admin@baocong.com'],
            [
                'name'     => 'Quản Trị Viên Bảo Công',
                'password' => Hash::make('password'),
                'phone'    => '0988888888',
                'address'  => '123 Đường Ba Tháng Hai, Phường 11, Quận 10, TP.HCM',
                'role'     => 'admin',
                'status'   => 1,
            ]
        );

        // Admin 2 (Khớp placeholder form login retro: admin@example.com)
        $admin2 = User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name'     => 'Quản Trị Viên Hệ Thống',
                'password' => Hash::make('password'),
                'phone'    => '0977777777',
                'address'  => '456 Đường Cách Mạng Tháng Tám, Quận 3, TP.HCM',
                'role'     => 'admin',
                'status'   => 1,
            ]
        );

        // Admin 3 (Hỗ trợ tài khoản người dùng cũ nếu cần)
        User::updateOrCreate(
            ['email' => 'huydh6278@gmail.com'],
            [
                'name'     => 'Đỗ Gia Bảo (Admin)',
                'password' => Hash::make('6278'),
                'phone'    => '0966666666',
                'address'  => 'TP. Hồ Chí Minh',
                'role'     => 'admin',
                'status'   => 1,
            ]
        );

        // Khách hàng mẫu (Customer)
        $customer = User::updateOrCreate(
            ['email' => 'user@gmail.com'],
            [
                'name'     => 'Khách Hàng Thân Thiết',
                'password' => Hash::make('password'),
                'phone'    => '0901234567',
                'address'  => 'Số 789 Đường Nguyễn Thị Minh Khai, Phường Bến Nghé, Quận 1, TP.HCM',
                'role'     => 'customer',
                'status'   => 1,
            ]
        );

        // =========================================================================
        // 2. TẠO DANH MỤC (CATEGORIES)
        // =========================================================================
        $categoriesData = [
            [
                'id'          => 1,
                'name'        => 'Điện thoại thông minh',
                'slug'        => 'dien-thoai-thong-minh',
                'description' => 'Các dòng smartphone cao cấp, cận cao cấp và phổ thông chính hãng.',
                'sort_order'  => 1,
                'status'      => 1,
            ],
            [
                'id'          => 2,
                'name'        => 'Máy tính bảng',
                'slug'        => 'may-tinh-bang',
                'description' => 'iPad, Galaxy Tab và các dòng tablet phục vụ học tập, giải trí và đồ họa.',
                'sort_order'  => 2,
                'status'      => 1,
            ],
            [
                'id'          => 3,
                'name'        => 'Điện thoại Gaming',
                'slug'        => 'dien-thoai-gaming',
                'description' => 'Smartphone chuyên game với hệ thống tản nhiệt tối tân và màn hình 144Hz.',
                'sort_order'  => 3,
                'status'      => 1,
            ],
            [
                'id'          => 4,
                'name'        => 'Phụ kiện chính hãng',
                'slug'        => 'phu-kien-chinh-hang',
                'description' => 'Củ sạc nhanh GaN, cáp sạc Type-C/Lightning, tai nghe không dây chính hãng.',
                'sort_order'  => 4,
                'status'      => 1,
            ],
        ];

        foreach ($categoriesData as $cat) {
            Category::updateOrCreate(['id' => $cat['id']], $cat);
        }

        // =========================================================================
        // 3. TẠO THƯƠNG HIỆU (BRANDS)
        // =========================================================================
        $brandsData = [
            [
                'id'          => 1,
                'name'        => 'Apple',
                'slug'        => 'apple',
                'description' => 'Thương hiệu công nghệ hàng đầu thế giới từ Mỹ với hệ sinh thái iOS đỉnh cao.',
                'image'       => 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
                'status'      => 1,
            ],
            [
                'id'          => 2,
                'name'        => 'Samsung',
                'slug'        => 'samsung',
                'description' => 'Gã khổng lồ công nghệ Hàn Quốc với dòng Galaxy S và Z Fold dẫn đầu công nghệ.',
                'image'       => 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg',
                'status'      => 1,
            ],
            [
                'id'          => 3,
                'name'        => 'Xiaomi',
                'slug'        => 'xiaomi',
                'description' => 'Thương hiệu nổi tiếng với cấu hình cực mạnh, sạc siêu tốc cùng ống kính Leica.',
                'image'       => 'https://upload.wikimedia.org/wikipedia/commons/2/29/Xiaomi_logo.svg',
                'status'      => 1,
            ],
            [
                'id'          => 4,
                'name'        => 'OPPO',
                'slug'        => 'oppo',
                'description' => 'Chuyên gia nhiếp ảnh chân dung, thiết kế sang trọng và camera Hasselblad.',
                'image'       => 'https://upload.wikimedia.org/wikipedia/commons/b/b8/OPPO_Logo.svg',
                'status'      => 1,
            ],
            [
                'id'          => 5,
                'name'        => 'Vivo',
                'slug'        => 'vivo',
                'description' => 'Đỉnh cao nhiếp ảnh di động đồng chế tác với Zeiss và chip xử lý ảnh độc quyền V3.',
                'image'       => 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Vivo_mobile_logo.png',
                'status'      => 1,
            ],
            [
                'id'          => 6,
                'name'        => 'Realme',
                'slug'        => 'realme',
                'description' => 'Thương hiệu smartphone đậm chất công nghệ dành cho giới trẻ năng động.',
                'image'       => 'https://upload.wikimedia.org/wikipedia/commons/1/13/Realme_logo.svg',
                'status'      => 1,
            ],
        ];

        foreach ($brandsData as $b) {
            Brand::updateOrCreate(['id' => $b['id']], $b);
        }

        // =========================================================================
        // 4. TẠO 12 SẢN PHẨM ĐIỆN THOẠI THỰC TẾ (PRODUCTS)
        // =========================================================================
        $productsData = [
            [
                'id'          => 1,
                'name'        => 'iPhone 16 Pro Max 256GB',
                'slug'        => 'iphone-16-pro-max-256gb',
                'sku'         => 'IP16PM-256',
                'price'       => 34990000,
                'sale_price'  => 33490000,
                'stock'       => 25,
                'category_id' => 1,
                'brand_id'    => 1,
                'featured'    => true,
                'status'      => 1,
                'image'       => 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
                'description' => 'iPhone 16 Pro Max với chip A18 Pro, nút điều khiển Camera Control đột phá, màn hình 6.9 inch siêu lớn, viền mỏng nhất lịch sử Apple.',
            ],
            [
                'id'          => 2,
                'name'        => 'iPhone 16 Pro 128GB',
                'slug'        => 'iphone-16-pro-128gb',
                'sku'         => 'IP16P-128',
                'price'       => 28990000,
                'sale_price'  => null,
                'stock'       => 30,
                'category_id' => 1,
                'brand_id'    => 1,
                'featured'    => true,
                'status'      => 1,
                'image'       => 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
                'description' => 'iPhone 16 Pro kích thước 6.3 inch cầm vừa tay, khung viền titan siêu nhẹ cấp 5, camera tele 5x Tetraprism cao cấp.',
            ],
            [
                'id'          => 3,
                'name'        => 'iPhone 15 Pro Max 256GB',
                'slug'        => 'iphone-15-pro-max-256gb',
                'sku'         => 'IP15PM-256',
                'price'       => 29990000,
                'sale_price'  => null,
                'stock'       => 15,
                'category_id' => 1,
                'brand_id'    => 1,
                'featured'    => false,
                'status'      => 1,
                'image'       => 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80',
                'description' => 'iPhone 15 Pro Max trang bị chip A17 Pro mạnh mẽ, camera zoom quang học 5x, thiết kế viền titan tự nhiên sang trọng.',
            ],
            [
                'id'          => 4,
                'name'        => 'iPhone 15 128GB',
                'slug'        => 'iphone-15-128gb',
                'sku'         => 'IP15-128',
                'price'       => 19990000,
                'sale_price'  => null,
                'stock'       => 40,
                'category_id' => 1,
                'brand_id'    => 1,
                'featured'    => false,
                'status'      => 1,
                'image'       => 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80',
                'description' => 'iPhone 15 sở hữu màn hình Dynamic Island thời thượng, cổng USB-C tiện lợi và camera chính 48MP sắc nét gấp 4 lần.',
            ],
            [
                'id'          => 5,
                'name'        => 'Samsung Galaxy S24 Ultra 256GB',
                'slug'        => 'samsung-galaxy-s24-ultra-256gb',
                'sku'         => 'SS-S24U-256',
                'price'       => 31990000,
                'sale_price'  => 28990000,
                'stock'       => 20,
                'category_id' => 1,
                'brand_id'    => 2,
                'featured'    => true,
                'status'      => 1,
                'image'       => 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
                'description' => 'Galaxy S24 Ultra trang bị quyền năng Galaxy AI đỉnh cao, bút S-Pen ghi chú tức thì, màn hình phẳng chống chói hàng đầu.',
            ],
            [
                'id'          => 6,
                'name'        => 'Samsung Galaxy Z Fold6 256GB',
                'slug'        => 'samsung-galaxy-z-fold6-256gb',
                'sku'         => 'SS-ZFOLD6-256',
                'price'       => 43990000,
                'sale_price'  => 41490000,
                'stock'       => 10,
                'category_id' => 1,
                'brand_id'    => 2,
                'featured'    => true,
                'status'      => 1,
                'image'       => 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80',
                'description' => 'Galaxy Z Fold6 thiết kế siêu mỏng nhẹ, bản lề FlexHinge bền bỉ, màn hình trong 7.6 inch đa nhiệm mượt mà cùng Galaxy AI.',
            ],
            [
                'id'          => 7,
                'name'        => 'Samsung Galaxy Z Flip6 256GB',
                'slug'        => 'samsung-galaxy-z-flip6-256gb',
                'sku'         => 'SS-ZFLIP6-256',
                'price'       => 28990000,
                'sale_price'  => null,
                'stock'       => 18,
                'category_id' => 1,
                'brand_id'    => 2,
                'featured'    => false,
                'status'      => 1,
                'image'       => 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=600&auto=format&fit=crop&q=80',
                'description' => 'Galaxy Z Flip6 gập hộp phấn nhỏ gọn sang trọng, màn hình ngoài Flex Window 3.4 inch độc đáo và camera 50MP cải tiến.',
            ],
            [
                'id'          => 8,
                'name'        => 'OPPO Find X7 Ultra 256GB',
                'slug'        => 'oppo-find-x7-ultra-256gb',
                'sku'         => 'OP-FX7U-256',
                'price'       => 26990000,
                'sale_price'  => null,
                'stock'       => 15,
                'category_id' => 1,
                'brand_id'    => 4,
                'featured'    => false,
                'status'      => 1,
                'image'       => 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&auto=format&fit=crop&q=80',
                'description' => 'OPPO Find X7 Ultra camera kép tiềm vọng đầu tiên trên thế giới kết hợp màu sắc điện ảnh Hasselblad và mặt lưng da cao cấp.',
            ],
            [
                'id'          => 9,
                'name'        => 'Vivo X100 Pro 256GB',
                'slug'        => 'vivo-x100-pro-256gb',
                'sku'         => 'VV-X100P-256',
                'price'       => 23990000,
                'sale_price'  => null,
                'stock'       => 22,
                'category_id' => 1,
                'brand_id'    => 5,
                'featured'    => false,
                'status'      => 1,
                'image'       => 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600&auto=format&fit=crop&q=80',
                'description' => 'Vivo X100 Pro chuyên gia chụp đêm và chân dung với thấu kính ZEISS APO, chip xử lý hình ảnh Vivo V3 6nm hiệu năng cao.',
            ],
            [
                'id'          => 10,
                'name'        => 'OPPO Reno12 Pro 5G 256GB',
                'slug'        => 'oppo-reno12-pro-5g-256gb',
                'sku'         => 'OP-R12P-256',
                'price'       => 18990000,
                'sale_price'  => null,
                'stock'       => 20,
                'category_id' => 1,
                'brand_id'    => 4,
                'featured'    => false,
                'status'      => 1,
                'image'       => 'https://images.unsplash.com/photo-1575695342320-d2d2d2f9b73f?w=600&auto=format&fit=crop&q=80',
                'description' => 'OPPO Reno12 Pro 5G thiết kế mỏng nhẹ dòng Reno thế hệ mới, tích hợp bộ công cụ nhiếp ảnh AI thông minh và sạc nhanh SuperVOOC 80W.',
            ],
            [
                'id'          => 11,
                'name'        => 'iPad Pro 11 inch M4 256GB Wi-Fi',
                'slug'        => 'ipad-pro-11-inch-m4-256gb-wi-fi',
                'sku'         => 'IPD-M4-256',
                'price'       => 28990000,
                'sale_price'  => 26990000,
                'stock'       => 18,
                'category_id' => 2,
                'brand_id'    => 1,
                'featured'    => true,
                'status'      => 1,
                'image'       => 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80',
                'description' => 'iPad Pro M4 mỏng kỷ lục 5.3mm, màn hình Ultra Retina XDR công nghệ Tandem OLED đột phá, chip M4 hiệu năng trí tuệ nhân tạo vượt trội.',
            ],
            [
                'id'          => 12,
                'name'        => 'iPad Air 11 inch M2 128GB Wi-Fi',
                'slug'        => 'ipad-air-11-inch-m2-128gb-wi-fi',
                'sku'         => 'IPD-AIR-128',
                'price'       => 16990000,
                'sale_price'  => null,
                'stock'       => 25,
                'category_id' => 2,
                'brand_id'    => 1,
                'featured'    => false,
                'status'      => 1,
                'image'       => 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&auto=format&fit=crop&q=80',
                'description' => 'iPad Air trang bị chip M2 mạnh mẽ, hỗ trợ Apple Pencil Pro, màn hình Liquid Retina sắc nét đáp ứng toàn diện nhu cầu học tập và sáng tạo.',
            ],
            [
                'id'          => 13,
                'name'        => 'Samsung Galaxy Tab S9 Ultra 256GB',
                'slug'        => 'samsung-galaxy-tab-s9-ultra-256gb',
                'sku'         => 'SS-TABS9U-256',
                'price'       => 32990000,
                'sale_price'  => null,
                'stock'       => 12,
                'category_id' => 2,
                'brand_id'    => 2,
                'featured'    => true,
                'status'      => 1,
                'image'       => 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=600&auto=format&fit=crop&q=80',
                'description' => 'Galaxy Tab S9 Ultra màn hình Dynamic AMOLED 2X siêu khủng 14.6 inch, chuẩn kháng nước bụi IP68 và kèm sẵn bút S-Pen chuyên nghiệp.',
            ],
            [
                'id'          => 14,
                'name'        => 'Xiaomi 14 Ultra 512GB Leica',
                'slug'        => 'xiaomi-14-ultra-512gb-leica',
                'sku'         => 'MI-14U-512',
                'price'       => 29990000,
                'sale_price'  => null,
                'stock'       => 12,
                'category_id' => 3,
                'brand_id'    => 3,
                'featured'    => true,
                'status'      => 1,
                'image'       => 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop&q=80',
                'description' => 'Xiaomi 14 Ultra với cụm 4 camera Leica Summilux cảm biến 1 inch thế hệ mới, thấu kính quang học đỉnh cao cho chất ảnh sống động.',
            ],
            [
                'id'          => 15,
                'name'        => 'Xiaomi 14T Pro 256GB 120W',
                'slug'        => 'xiaomi-14t-pro-256gb-120w',
                'sku'         => 'XM-14TP-256',
                'price'       => 16990000,
                'sale_price'  => 15490000,
                'stock'       => 35,
                'category_id' => 3,
                'brand_id'    => 3,
                'featured'    => false,
                'status'      => 1,
                'image'       => 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
                'description' => 'Xiaomi 14T Pro chip Dimensity 9300+, sạc 120W siêu tốc trong 19 phút, màn hình CrystalRes 144Hz chuyên phục vụ game thủ.',
            ],
            [
                'id'          => 16,
                'name'        => 'Realme GT5 Pro 256GB Snapdragon 8 Gen 3',
                'slug'        => 'realme-gt5-pro-256gb-snapdragon-8-gen-3',
                'sku'         => 'RM-GT5P-256',
                'price'       => 15990000,
                'sale_price'  => null,
                'stock'       => 28,
                'category_id' => 3,
                'brand_id'    => 6,
                'featured'    => false,
                'status'      => 1,
                'image'       => 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&auto=format&fit=crop&q=80',
                'description' => 'Realme GT5 Pro chiến binh gaming chip Snapdragon 8 Gen 3, tản nhiệt buồng hơi 12000mm² và pin trâu 5400mAh sạc 100W.',
            ],
            [
                'id'          => 17,
                'name'        => 'Tai nghe Apple AirPods Pro 2 MagSafe USB-C',
                'slug'        => 'tai-nghe-apple-airpods-pro-2-magsafe-usb-c',
                'sku'         => 'APP-PRO2-USBC',
                'price'       => 5990000,
                'sale_price'  => 5290000,
                'stock'       => 50,
                'category_id' => 4,
                'brand_id'    => 1,
                'featured'    => true,
                'status'      => 1,
                'image'       => 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80',
                'description' => 'AirPods Pro 2 trang bị chip H2, khả năng chủ động khử tiếng ồn ANC gấp 2 lần, âm thanh thích ứng và hộp sạc chuẩn USB-C có loa định vị.',
            ],
            [
                'id'          => 18,
                'name'        => 'Củ sạc nhanh Apple 20W USB-C Chính Hãng',
                'slug'        => 'cu-sac-nhanh-apple-20w-usb-c-chinh-hang',
                'sku'         => 'APP-20W-USBC',
                'price'       => 550000,
                'sale_price'  => 490000,
                'stock'       => 80,
                'category_id' => 4,
                'brand_id'    => 1,
                'featured'    => false,
                'status'      => 1,
                'image'       => 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
                'description' => 'Củ sạc chính hãng Apple công suất 20W công nghệ sạc nhanh PD, tương thích tối ưu cho toàn bộ dòng iPhone, iPad và Apple Watch.',
            ],
            [
                'id'          => 19,
                'name'        => 'Sạc dự phòng Anker GaN 20.000mAh 65W High-Speed',
                'slug'        => 'sac-du-phong-anker-gan-20000mah-65w-high-speed',
                'sku'         => 'AK-PB-20K-65W',
                'price'       => 1490000,
                'sale_price'  => null,
                'stock'       => 35,
                'category_id' => 4,
                'brand_id'    => 2,
                'featured'    => false,
                'status'      => 1,
                'image'       => 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=600&auto=format&fit=crop&q=80',
                'description' => 'Pin dự phòng dung lượng chuẩn 20.000mAh công suất sạc nhanh 65W chuẩn GaN, sạc cùng lúc 3 thiết bị và hỗ trợ sạc cả Laptop MacBook.',
            ],
            [
                'id'          => 20,
                'name'        => 'Cáp sạc Type-C to C Dù Siêu Bền 100W 2m',
                'slug'        => 'cap-sac-type-c-to-c-du-sieu-ben-100w-2m',
                'sku'         => 'CB-C2C-100W',
                'price'       => 290000,
                'sale_price'  => null,
                'stock'       => 100,
                'category_id' => 4,
                'brand_id'    => 3,
                'featured'    => false,
                'status'      => 1,
                'image'       => 'https://images.unsplash.com/photo-1509741102003-ca64bfe5f069?w=600&auto=format&fit=crop&q=80',
                'description' => 'Cáp bọc sợi dù Kevlar siêu bền bỉ chống đứt gãy, chiều dài 2 mét, hỗ trợ dòng truyền tải tối đa 100W và truyền dữ liệu tốc độ cao.',
            ],
        ];

        foreach ($productsData as $prod) {
            Product::updateOrCreate(['id' => $prod['id']], $prod);
        }

        // =========================================================================
        // 5. TẠO 5 ĐƠN HÀNG MẪU (ORDERS & ORDER_DETAILS)
        // =========================================================================
        $ordersData = [
            [
                'id'               => 1,
                'order_code'       => 'BC-20261001',
                'user_id'          => $customer->id,
                'customer_name'    => 'Khách Hàng Thân Thiết',
                'customer_phone'   => '0901234567',
                'customer_email'   => 'user@gmail.com',
                'shipping_address' => 'Số 789 Đường Nguyễn Thị Minh Khai, Phường Bến Nghé, Quận 1, TP.HCM',
                'note'             => 'Giao giờ hành chính, gọi trước 15 phút.',
                'subtotal'         => 33490000,
                'shipping_fee'     => 0,
                'discount'         => 0,
                'total'            => 33490000,
                'payment_method'   => 'bank_transfer',
                'payment_status'   => 'paid',
                'status'           => 'shipping',
                'created_at'       => now()->subDays(2),
                'updated_at'       => now()->subDays(1),
                'details'          => [
                    [
                        'product_id'   => 1,
                        'product_name' => 'iPhone 16 Pro Max 256GB',
                        'product_sku'  => 'IP16PM-256',
                        'price'        => 33490000,
                        'quantity'     => 1,
                        'subtotal'     => 33490000,
                    ],
                ],
            ],
            [
                'id'               => 2,
                'order_code'       => 'BC-20261002',
                'user_id'          => $customer->id,
                'customer_name'    => 'Trần Văn An',
                'customer_phone'   => '0912345678',
                'customer_email'   => 'an.tran@gmail.com',
                'shipping_address' => 'Tòa nhà Landmark 81, 720A Điện Biên Phủ, Phường 22, Bình Thạnh, TP.HCM',
                'note'             => 'Hàng giá trị cao vui lòng bọc chống sốc kỹ càng.',
                'subtotal'         => 28990000,
                'shipping_fee'     => 30000,
                'discount'         => 500000,
                'total'            => 28520000,
                'payment_method'   => 'vnpay',
                'payment_status'   => 'paid',
                'status'           => 'completed',
                'created_at'       => now()->subDays(4),
                'updated_at'       => now()->subDays(3),
                'details'          => [
                    [
                        'product_id'   => 5,
                        'product_name' => 'Samsung Galaxy S24 Ultra 256GB',
                        'product_sku'  => 'SS-S24U-256',
                        'price'        => 28990000,
                        'quantity'     => 1,
                        'subtotal'     => 28990000,
                    ],
                ],
            ],
            [
                'id'               => 3,
                'order_code'       => 'BC-20261003',
                'user_id'          => null,
                'customer_name'    => 'Nguyễn Thị Bích',
                'customer_phone'   => '0934567890',
                'customer_email'   => 'bichnguyen@gmail.com',
                'shipping_address' => 'Số 45 Lê Duẩn, Phường Bến Nghé, Quận 1, TP.HCM',
                'note'             => 'Giao buổi chiều sau 17h.',
                'subtotal'         => 27990000,
                'shipping_fee'     => 0,
                'discount'         => 0,
                'total'            => 27990000,
                'payment_method'   => 'cod',
                'payment_status'   => 'pending',
                'status'           => 'confirmed',
                'created_at'       => now()->subDays(1),
                'updated_at'       => now()->subHours(5),
                'details'          => [
                    [
                        'product_id'   => 2,
                        'product_name' => 'iPhone 16 Pro 128GB',
                        'product_sku'  => 'IP16P-128',
                        'price'        => 27990000,
                        'quantity'     => 1,
                        'subtotal'     => 27990000,
                    ],
                ],
            ],
            [
                'id'               => 4,
                'order_code'       => 'BC-20261004',
                'user_id'          => null,
                'customer_name'    => 'Lê Hoàng Long',
                'customer_phone'   => '0978901234',
                'customer_email'   => 'long.le@gmail.com',
                'shipping_address' => '120 Hoàng Hoa Thám, Phường 7, Quận Bình Thạnh, TP.HCM',
                'note'             => 'Đồng kiểm hàng trước khi thanh toán COD.',
                'subtotal'         => 15490000,
                'shipping_fee'     => 40000,
                'discount'         => 0,
                'total'            => 15530000,
                'payment_method'   => 'cod',
                'payment_status'   => 'pending',
                'status'           => 'pending',
                'created_at'       => now()->subHours(3),
                'updated_at'       => now()->subHours(3),
                'details'          => [
                    [
                        'product_id'   => 15,
                        'product_name' => 'Xiaomi 14T Pro 256GB',
                        'product_sku'  => 'XM-14TP-256',
                        'price'        => 15490000,
                        'quantity'     => 1,
                        'subtotal'     => 15490000,
                    ],
                ],
            ],
            [
                'id'               => 5,
                'order_code'       => 'BC-20261005',
                'user_id'          => $customer->id,
                'customer_name'    => 'Phạm Minh Đức',
                'customer_phone'   => '0989012345',
                'customer_email'   => 'duc.pm@gmail.com',
                'shipping_address' => '250 Cộng Hòa, Phường 13, Quận Tân Bình, TP.HCM',
                'note'             => 'Khách đổi ý muốn lấy bản dung lượng cao hơn nên yêu cầu hủy.',
                'subtotal'         => 14490000,
                'shipping_fee'     => 0,
                'discount'         => 0,
                'total'            => 14490000,
                'payment_method'   => 'momo',
                'payment_status'   => 'refunded',
                'status'           => 'cancelled',
                'created_at'       => now()->subDays(3),
                'updated_at'       => now()->subDays(2),
                'details'          => [
                    [
                        'product_id'   => 16,
                        'product_name' => 'Realme GT5 Pro 256GB',
                        'product_sku'  => 'RM-GT5P-256',
                        'price'        => 14490000,
                        'quantity'     => 1,
                        'subtotal'     => 14490000,
                    ],
                ],
            ],
        ];

        foreach ($ordersData as $oData) {
            $details = $oData['details'];
            unset($oData['details']);

            $order = Order::updateOrCreate(['id' => $oData['id']], $oData);

            // Xóa chi tiết cũ nếu có rồi nạp lại
            OrderDetail::where('order_id', $order->id)->delete();
            foreach ($details as $d) {
                $d['order_id'] = $order->id;
                OrderDetail::create($d);
            }

            OrderStatusHistory::where('order_id', $order->id)->delete();
            $histories = [
                ['status' => 'pending', 'note' => 'Khách hàng tạo đơn hàng mới trên website', 'changed_by' => 'Khách hàng', 'created_at' => now()->subHours(5)],
            ];
            if ($order->status !== 'pending') {
                $histories[] = [
                    'status'     => $order->status,
                    'note'       => 'Hệ thống chuyển trạng thái đơn hàng sang: ' . $order->status,
                    'changed_by' => 'Quản trị viên',
                    'created_at' => now()->subHours(2),
                ];
            }
            foreach ($histories as $h) {
                OrderStatusHistory::create([
                    'order_id'   => $order->id,
                    'status'     => $h['status'],
                    'note'       => $h['note'],
                    'changed_by' => $h['changed_by'],
                    'created_at' => $h['created_at'],
                ]);
            }
            $order->update(['status_history' => $histories]);
        }

        // =========================================================================
        // 5. TẠO ĐÁNH GIÁ MẪU SẢN PHẨM (REVIEWS) - 18 ĐÁNH GIÁ THỰC TẾ
        // =========================================================================
        $reviewsData = [
            [
                'product_id'     => 1, // iPhone 16 Pro Max
                'user_id'        => $customer->id,
                'reviewer_name'  => 'Trần Hoàng Nam',
                'reviewer_email' => 'nam.th@gmail.com',
                'rating'         => 5,
                'comment'        => 'Máy Titan Sa Mạc màu ngoài đời siêu đẹp! Nút Camera Control chụp ảnh rất tiện lợi, pin trâu dùng cả ngày xem phim lướt web không lo hết.',
                'admin_reply'    => 'Bảo Công Mobile cảm ơn bạn Nam rất nhiều! Chúc bạn có những bức ảnh thật ưng ý cùng siêu phẩm iPhone 16 Pro Max ạ!',
                'status'         => 1,
            ],
            [
                'product_id'     => 1,
                'user_id'        => null,
                'reviewer_name'  => 'Lê Thu Trang',
                'reviewer_email' => 'trangle@gmail.com',
                'rating'         => 5,
                'comment'        => 'Đóng gói cực kỳ cẩn thận, nguyên seal chính hãng VN/A. Kích hoạt bảo hành điện tử chuẩn Apple. Shop giao hỏa tốc 2 tiếng rất uy tín!',
                'admin_reply'    => 'Dạ shop cảm ơn chị Trang đã tin tưởng Bảo Công Mobile. Cần hỗ trợ phụ kiện cứ nhắn shop nhé chị!',
                'status'         => 1,
            ],
            [
                'product_id'     => 1,
                'user_id'        => null,
                'reviewer_name'  => 'Ngô Gia Huy',
                'reviewer_email' => 'huyngo.tech@gmail.com',
                'rating'         => 4,
                'comment'        => 'Hiệu năng A18 Pro quá khủng, chơi game nặng siêu mượt. Chỉ có điều máy hơi nặng một chút khi cầm 1 tay lúc nằm.',
                'admin_reply'    => 'Cảm ơn phản hồi chi tiết của anh Huy ạ! Phiên bản Pro Max màn hình lớn 6.9 inch phục vụ giải trí đỉnh cao nên khung máy sẽ đầm tay hơn ạ.',
                'status'         => 1,
            ],
            [
                'product_id'     => 2, // iPhone 16 Pro 128GB
                'user_id'        => null,
                'reviewer_name'  => 'Phạm Văn Hùng',
                'reviewer_email' => 'hung.pham@outlook.com',
                'rating'         => 5,
                'comment'        => 'Kích thước 6.3 inch cầm vừa vặn tay nhất từ trước đến nay. Màn hình ProMotion 120Hz mượt mà tuyệt đối.',
                'admin_reply'    => 'Cảm ơn anh Hùng đã ủng hộ shop ạ!',
                'status'         => 1,
            ],
            [
                'product_id'     => 3, // iPhone 16 128GB
                'user_id'        => null,
                'reviewer_name'  => 'Vũ Minh Anh',
                'reviewer_email' => 'minhanh.vu@gmail.com',
                'rating'         => 5,
                'comment'        => 'Màu hồng pastel xinh xỉu, loa ngoài nghe rất ấm và to. Giá khuyến mãi ở Bảo Công Mobile rẻ hơn các chuỗi khác gần 2 triệu.',
                'admin_reply'    => null,
                'status'         => 1,
            ],
            [
                'product_id'     => 5, // Samsung Galaxy S24 Ultra 256GB
                'user_id'        => $customer->id,
                'reviewer_name'  => 'Trần Văn An',
                'reviewer_email' => 'an.tran@gmail.com',
                'rating'         => 5,
                'comment'        => 'Bút S-Pen ký tài liệu với vẽ vời công việc cực đỉnh. Tính năng Galaxy AI khoanh vùng tìm kiếm và dịch trực tiếp cuộc gọi rất đáng giá.',
                'admin_reply'    => 'Bảo Công Mobile cảm ơn anh An! Chúc anh làm việc hiệu quả và thành công cùng Galaxy S24 Ultra!',
                'status'         => 1,
            ],
            [
                'product_id'     => 5,
                'user_id'        => null,
                'reviewer_name'  => 'Đinh Khắc Vinh',
                'reviewer_email' => 'vinh.dinh@yahoo.com',
                'rating'         => 5,
                'comment'        => 'Màn hình chống chói Gorilla Armor đỉnh thật sự, ra nắng gắt xem văn bản rõ mồn một. Zoom 100x chụp mặt trăng nét căng.',
                'admin_reply'    => null,
                'status'         => 1,
            ],
            [
                'product_id'     => 6, // Samsung Galaxy Z Fold6 256GB
                'user_id'        => null,
                'reviewer_name'  => 'Lâm Tuấn Kiệt',
                'reviewer_email' => 'kiet.lam@gmail.com',
                'rating'         => 5,
                'comment'        => 'Bản lề gập khít hơn đời trước rất nhiều, màn hình ngoài gõ phím thoải mái không bị chật. Mở ra đa nhiệm 3 ứng dụng mượt mà.',
                'admin_reply'    => 'Cảm ơn anh Kiệt! Gói bảo hiểm Samsung Care+ tặng kèm đã kích hoạt đầy đủ cho anh rồi ạ.',
                'status'         => 1,
            ],
            [
                'product_id'     => 7, // Samsung Galaxy Z Flip6 256GB
                'user_id'        => null,
                'reviewer_name'  => 'Nguyễn Mai Phương',
                'reviewer_email' => 'phuong.mai@gmail.com',
                'rating'         => 5,
                'comment'        => 'Gập lại bé tí nhét vừa túi xách nhỏ. FlexCam chụp ảnh tự sướng không cần gậy selfie rất tiện lợi!',
                'admin_reply'    => null,
                'status'         => 1,
            ],
            [
                        'product_id'   => 15,
                'user_id'        => null,
                'reviewer_name'  => 'Hoàng Đình Bách',
                'reviewer_email' => 'bach.hd@gmail.com',
                'rating'         => 5,
                'comment'        => 'Ống kính Leica chụp tông màu chân dung rất có chiều sâu. Sạc nhanh 120W đúng 19 phút là đầy 100% pin, quá bá đạo!',
                'admin_reply'    => 'Dạ cảm ơn anh Bách! Xiaomi 14T Pro là sự kết hợp tuyệt vời với Leica đó ạ.',
                'status'         => 1,
            ],
            [
                        'product_id'   => 15,
                'user_id'        => null,
                'reviewer_name'  => 'Phan Quốc Việt',
                'reviewer_email' => 'viet.pq@gmail.com',
                'rating'         => 4,
                'comment'        => 'Chip Dimensity 9300+ mát mẻ, cân tốt mọi tựa game max cấu hình. Giá phân khúc cận cao cấp mà tính năng tiệm cận flagship.',
                'admin_reply'    => null,
                'status'         => 1,
            ],
            [
                'product_id'     => 10, // Xiaomi 14 256GB
                'user_id'        => null,
                'reviewer_name'  => 'Bùi Thị Hà',
                'reviewer_email' => 'habui@gmail.com',
                'rating'         => 5,
                'comment'        => 'Máy nhỏ gọn mà camera Leica chụp xuất sắc, viền màn hình siêu mỏng nhìn rất tinh tế và hiện đại.',
                'admin_reply'    => null,
                'status'         => 1,
            ],
            [
                'product_id'     => 11, // OPPO Find N3 Flip
                'user_id'        => null,
                'reviewer_name'  => 'Đỗ Cẩm Ly',
                'reviewer_email' => 'camly.do@gmail.com',
                'rating'         => 5,
                'comment'        => 'Màn hình ngoài dọc dùng được hầu hết các app như Zalo, Youtube, TikTok. Camera Hasselblad màu rất chuẩn.',
                'admin_reply'    => 'Bảo Công Mobile cảm ơn bạn Ly nhiều ạ!',
                'status'         => 1,
            ],
            [
                        'product_id'   => 16,
                'user_id'        => null,
                'reviewer_name'  => 'Nguyễn Duy Mạnh',
                'reviewer_email' => 'manh.nd@gmail.com',
                'rating'         => 5,
                'comment'        => 'Cấu hình Snapdragon 8 Gen 3 với camera tiềm vọng tele Sony IMX890 mà giá chỉ 14 triệu quá hời!',
                'admin_reply'    => null,
                'status'         => 1,
            ],
            [
                'product_id'     => 4, // iPad Pro M4 11 inch
                'user_id'        => null,
                'reviewer_name'  => 'Trịnh Gia Huy',
                'reviewer_email' => 'huytrinh.art@gmail.com',
                'rating'         => 5,
                'comment'        => 'Màn hình Tandem OLED hiển thị màu đen sâu thẳm, độ sáng rực rỡ. Dùng vẽ Apple Pencil Pro với Procreate cực kỳ chuẩn xác.',
                'admin_reply'    => 'Dạ cảm ơn bạn Huy đã đánh giá, chúc bạn sáng tạo nhiều tác phẩm nghệ thuật tuyệt đẹp nhé!',
                'status'         => 1,
            ],
            [
                'product_id'     => 8, // Samsung Galaxy Tab S9 FE 5G
                'user_id'        => null,
                'reviewer_name'  => 'Lê Mỹ Duyên',
                'reviewer_email' => 'duyen.le@gmail.com',
                'rating'         => 4,
                'comment'        => 'Tặng kèm sẵn bút S-Pen theo hộp nên tiết kiệm được một khoản, kháng nước IP68 dùng rất yên tâm.',
                'admin_reply'    => null,
                'status'         => 1,
            ],
            [
                'product_id'     => 2, // iPhone 16 Pro 128GB
                'user_id'        => null,
                'reviewer_name'  => 'Dương Hoàng Yến',
                'reviewer_email' => 'hoangyen@gmail.com',
                'rating'         => 5,
                'comment'        => 'Nhân viên tư vấn nhiệt tình, có hỗ trợ trả góp 0% duyệt hồ sơ nhanh trong 10 phút. Đã dán màn hình miễn phí.',
                'admin_reply'    => 'Dạ cảm ơn chị Yến! Rất hân hạnh được phục vụ chị trong những lần mua hàng tiếp theo ạ!',
                'status'         => 1,
            ],
            [
                'product_id'     => 6, // Samsung Galaxy Z Fold6 256GB
                'user_id'        => null,
                'reviewer_name'  => 'Võ Quốc Bảo',
                'reviewer_email' => 'baovo@gmail.com',
                'rating'         => 5,
                'comment'        => 'Giao diện One UI mượt mà, kết hợp phụ kiện ốp lưng bút S-Pen rất tiện cho công việc ký hợp đồng từ xa.',
                'admin_reply'    => null,
                'status'         => 1,
            ],
        ];

        Review::truncate();
        foreach ($reviewsData as $r) {
            Review::create($r);
        }

        // =========================================================================
        // 6. TẠO PHIẾU HỖ TRỢ MẪU (SUPPORT TICKETS) - ĐỒNG BỘ TRANG /ho-tro VÀ ADMIN
        // =========================================================================
        $supportTicketsData = [
            [
                'user_id'     => $customer->id,
                'name'        => 'Trần Văn An',
                'phone'       => '0912345678',
                'email'       => 'an.tran@gmail.com',
                'order_code'  => 'BC-20261002',
                'subject'     => 'Cần tư vấn chính sách Thu cũ đổi mới lên iPhone 16 Pro Max',
                'message'     => 'Mình vừa mua chiếc Samsung S24 Ultra tại shop nhưng muốn đổi sang iPhone 16 Pro Max để đồng bộ với MacBook. Cho mình hỏi thủ tục thu cũ đổi mới và mức giá bù trừ hiện tại nhé.',
                'status'      => 'processing',
                'admin_notes' => 'Đã phân công chuyên viên CSKH gọi điện hỗ trợ tư vấn chính sách đổi máy trong 30 ngày.',
            ],
            [
                'user_id'     => null,
                'name'        => 'Lê Hoàng Long',
                'phone'       => '0978901234',
                'email'       => 'long.le@gmail.com',
                'order_code'  => 'BC-20261004',
                'subject'     => 'Kiểm tra tình trạng vận chuyển đơn hàng hỏa tốc',
                'message'     => 'Đơn hàng BC-20261004 của mình cần nhận gấp trong sáng mai để kịp đi công tác. Nhờ shop hỗ trợ hối bên bưu tá Viettel Post giúp mình.',
                'status'      => 'resolved',
                'admin_notes' => 'Đã liên hệ trưởng bưu cục điều phối giao ưu tiên lúc 8h30 sáng.',
            ],
            [
                'user_id'     => null,
                'name'        => 'Nguyễn Thị Bích',
                'phone'       => '0934567890',
                'email'       => 'bichnguyen@gmail.com',
                'order_code'  => 'BC-20261003',
                'subject'     => 'Hỏi về gói bảo hành VIP rơi vỡ màn hình',
                'message'     => 'Mình muốn hỏi thêm về quyền lợi gói bảo hành VIP 1 đổi 1 trong 12 tháng, nếu vô tình làm rơi nứt mặt kính lưng thì có được thay thế linh kiện Apple chính hãng không?',
                'status'      => 'pending',
                'admin_notes' => null,
            ],
            [
                'user_id'     => null,
                'name'        => 'Đặng Quốc Khánh',
                'phone'       => '0909887766',
                'email'       => 'khanh.dq@gmail.com',
                'order_code'  => null,
                'subject'     => 'Tư vấn xuất hóa đơn VAT điện tử cho công ty',
                'message'     => 'Công ty mình có nhu cầu đặt mua 5 máy iPad Pro M4 và xuất hóa đơn VAT điện tử cho doanh nghiệp. Vui lòng gửi báo giá chiết khấu số lượng lớn qua email khanh.dq@gmail.com giúp mình.',
                'status'      => 'pending',
                'admin_notes' => null,
            ],
        ];

        SupportTicket::truncate();
        foreach ($supportTicketsData as $st) {
            SupportTicket::create($st);
        }
        $this->call(PostSeeder::class);

        // =========================================================================
        // 7. CẤU HÌNH THÔNG TIN WEBSITE (FUNC-ADM-CONFIG-01)
        // =========================================================================
        Setting::updateOrCreate(
            ['id' => 1],
            [
                'site_name'        => 'Bảo Công Studio',
                'logo'             => '/images/logo.png',
                'favicon'          => '/favicon.ico',
                'hotline'          => '1900 8888',
                'email'            => 'cskh@baocongstudio.vn',
                'address'          => '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
                'working_hours'    => '8h00 - 21h30 (Thứ 2 - Chủ Nhật)',
                'facebook_url'     => 'https://facebook.com/baocongstudio',
                'youtube_url'      => 'https://youtube.com/@baocongstudio',
                'zalo_url'         => 'https://zalo.me/19008888',
                'tiktok_url'       => 'https://tiktok.com/@baocongstudio',
                'meta_title'       => 'Bảo Công Studio - Hệ Thống Thiết Bị Di Động & Phụ Kiện Hàng Đầu',
                'meta_description' => 'Hệ thống bán lẻ thiết bị di động, tablet & phụ kiện công nghệ chính hãng hàng đầu. Tiên phong trải nghiệm mua sắm thông minh và chính sách 1 đổi 1.',
                'meta_keywords'    => 'dien thoai, iphone, samsung, ipad, bao cong studio',
                'copyright_text'   => '© 2026 Bảo Công Studio. All rights reserved.',
            ]
        );

        // =========================================================================
        // 8. BANNERS TRANG CHỦ (FUNC-ADM-BANNER-01..04)
        // =========================================================================
        $bannersData = [
            [
                'title'       => 'iPhone 16 Pro Max - Vươn Tầm Đẳng Cấp Titan Sa Mạc',
                'subtitle'    => 'Trang bị chip A18 Pro 3nm vượt trội, Camera Fusion 48MP và nút Camera Control thế hệ mới.',
                'badge_text'  => 'FLAGSHIP MỚI NHẤT',
                'image'       => 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=1470&auto=format&fit=crop',
                'link_url'    => '/san-pham/iphone-16-pro-max-256gb',
                'button_text' => 'Đặt Hàng Ngay',
                'position'    => 'main_hero',
                'sort_order'  => 1,
                'status'      => 1,
            ],
            [
                'title'       => 'Samsung Galaxy Z Fold6 - Kỷ Nguyên Galaxy AI',
                'subtitle'    => 'Màn hình gập Dynamic AMOLED 2X 120Hz mỏng nhẹ nhất từ trước đến nay cùng bút S-Pen quyền năng.',
                'badge_text'  => 'SIÊU PHẨM MÀN GẬP',
                'image'       => 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=1470&auto=format&fit=crop',
                'link_url'    => '/san-pham/samsung-galaxy-z-fold6-256gb',
                'button_text' => 'Trải Nghiệm Ngay',
                'position'    => 'main_hero',
                'sort_order'  => 2,
                'status'      => 1,
            ],
            [
                'title'       => 'Thu Cũ Đổi Mới - Trợ Giá Đến 3.000.000₫',
                'subtitle'    => 'Quy trình thẩm định máy chỉ 15 phút, lên đời máy mới không lo bù tiền.',
                'badge_text'  => 'HOT DEAL',
                'image'       => 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?q=80&w=1470&auto=format&fit=crop',
                'link_url'    => '/products',
                'button_text' => 'Xem Chi Tiết',
                'position'    => 'sub_banner',
                'sort_order'  => 1,
                'status'      => 1,
            ],
            [
                'title'       => 'Hệ Sinh Thái Phụ Kiện Apple & GaN Chính Hãng',
                'subtitle'    => 'Giảm trực tiếp 20% khi mua kèm máy mới bất kỳ trong tháng này tại Bảo Công Studio.',
                'badge_text'  => 'ƯU ĐÃI KÈM MÁY',
                'image'       => 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1470&auto=format&fit=crop',
                'link_url'    => '/products?category_id=4',
                'button_text' => 'Mua Phụ Kiện',
                'position'    => 'sub_banner',
                'sort_order'  => 2,
                'status'      => 1,
            ],
        ];

        Banner::truncate();
        foreach ($bannersData as $b) {
            Banner::create($b);
        }

        // =========================================================================
        // 9. MENU ĐIỀU HƯỚNG HEADER & FOOTER (FUNC-ADM-MENU-01..04)
        // =========================================================================
        $menusData = [
            // Header
            ['name' => 'Trang chủ', 'url' => '/trangchu', 'position' => 'header', 'sort_order' => 1, 'status' => 1],
            ['name' => 'Tất cả sản phẩm', 'url' => '/products', 'position' => 'header', 'sort_order' => 2, 'status' => 1],
            ['name' => 'Sản phẩm mới', 'url' => '/products?type=new', 'position' => 'header', 'sort_order' => 3, 'status' => 1],
            ['name' => 'Sale / Khuyến mãi', 'url' => '/products?type=sale', 'position' => 'header', 'sort_order' => 4, 'status' => 1],
            ['name' => 'Bài viết công nghệ', 'url' => '/bai-viet', 'position' => 'header', 'sort_order' => 5, 'status' => 1],
            ['name' => 'Giới thiệu', 'url' => '/trang/gioi-thieu', 'position' => 'header', 'sort_order' => 6, 'status' => 1],
            ['name' => 'Trung tâm hỗ trợ', 'url' => '/ho-tro', 'position' => 'header', 'sort_order' => 7, 'status' => 1],

            // Footer
            ['name' => 'Về Bảo Công Studio', 'url' => '/trang/gioi-thieu', 'position' => 'footer', 'sort_order' => 1, 'status' => 1],
            ['name' => 'Chính sách mua hàng', 'url' => '/trang/chinh-sach-mua-hang', 'position' => 'footer', 'sort_order' => 2, 'status' => 1],
            ['name' => 'Chính sách đổi trả 30 ngày', 'url' => '/trang/chinh-sach-doi-tra', 'position' => 'footer', 'sort_order' => 3, 'status' => 1],
            ['name' => 'Chính sách bảo hành 12 tháng', 'url' => '/trang/chinh-sach-bao-hanh', 'position' => 'footer', 'sort_order' => 4, 'status' => 1],
            ['name' => 'Hướng dẫn đặt mua online', 'url' => '/trang/huong-dan-mua-hang', 'position' => 'footer', 'sort_order' => 5, 'status' => 1],
        ];

        Menu::truncate();
        foreach ($menusData as $m) {
            Menu::create($m);
        }

        // =========================================================================
        // 10. TRANG ĐƠN / TRANG TĨNH ĐỘNG (FUNC-ADM-PAGE-01..04 & FUNC-PAGE-U-01)
        // =========================================================================
        $pagesData = [
            [
                'title'   => 'Giới thiệu về Bảo Công Studio',
                'slug'    => 'gioi-thieu',
                'summary' => 'Hành trình phát triển và sứ mệnh phụng sự khách hàng yêu thích công nghệ của Bảo Công Studio.',
                'content' => "## Chào mừng bạn đến với Bảo Công Studio\n\n**Bảo Công Studio** được thành lập với mục tiêu trở thành điểm đến tin cậy hàng đầu cho cộng đồng người dùng công nghệ tại Việt Nam. Chúng tôi cam kết phân phối 100% thiết bị di động, tablet, laptop và phụ kiện chính hãng nguyên seal với đầy đủ hóa đơn chứng từ VAT điện tử.\n\n### Giá trị cốt lõi\n- **Chính hãng tuyệt đối:** Mọi thiết bị bán ra đều được nhập khẩu chính ngạch từ Apple Việt Nam, Samsung Vina, Xiaomi, Anker...\n- **Bảo hành 1 đổi 1 trong 30 ngày:** Bất kỳ lỗi phần cứng nào từ nhà sản xuất sẽ được đổi mới ngay lập tức không giữ máy chờ sửa.\n- **Đồng hành trọn đời:** Đội ngũ kỹ thuật viên giàu kinh nghiệm luôn sẵn sàng tư vấn, hỗ trợ cài đặt và bảo dưỡng thiết bị miễn phí.",
                'status'  => 1,
            ],
            [
                'title'   => 'Chính sách mua hàng & Giao nhận',
                'slug'    => 'chinh-sach-mua-hang',
                'summary' => 'Quy định đặt hàng, thanh toán linh hoạt và thời gian giao nhận toàn quốc.',
                'content' => "## Chính sách Mua Hàng & Vận Chuyển\n\n### 1. Phương thức mua hàng\n- Mua trực tiếp tại Showroom: 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM.\n- Đặt hàng trực tuyến qua website Bảo Công Studio với quy trình đơn giản chỉ 3 bước.\n\n### 2. Chính sách miễn phí vận chuyển\n- **Đơn hàng từ 5.000.000₫ trở lên:** Miễn phí 100% cước chuyển phát nhanh toàn quốc.\n- **Đơn hàng dưới 5.000.000₫:** Phí giao hàng cố định 30.000₫ toàn quốc.\n- **Giao hỏa tốc 2 giờ:** Áp dụng cho các quận nội thành TP.HCM (Quận 1, 3, 5, 10, Phú Nhuận, Bình Thạnh).",
                'status'  => 1,
            ],
            [
                'title'   => 'Chính sách đổi trả 1 đổi 1 trong 30 ngày',
                'slug'    => 'chinh-sach-doi-tra',
                'summary' => 'Bảo vệ quyền lợi khách hàng với cam kết 1 đổi 1 nhanh chóng và minh bạch.',
                'content' => "## Chính sách Đổi Trả Sản Phẩm\n\n### 1. Thời hạn và điều kiện áp dụng\n- **Trong 30 ngày đầu tiên:** Đổi máy mới 100% nếu sản phẩm phát sinh lỗi phần cứng do nhà sản xuất (màn hình, nguồn, camera, bo mạch...).\n- Thiết bị phải còn đầy đủ hộp máy, phụ kiện đi kèm nguyên vẹn và hóa đơn/số điện thoại mua hàng trên hệ thống.\n\n### 2. Quy trình xử lý\n- Kỹ thuật viên kiểm tra lỗi tại chỗ trong vòng 15 - 30 phút.\n- Khách hàng được đổi máy mới cùng model hoặc nâng cấp lên model cao hơn và bù chênh lệch theo giá niêm yết hiện hành.",
                'status'  => 1,
            ],
            [
                'title'   => 'Chính sách bảo hành chính hãng',
                'slug'    => 'chinh-sach-bao-hanh',
                'summary' => 'Quy định bảo hành 12 - 24 tháng tại các trung tâm bảo hành ủy quyền toàn quốc.',
                'content' => "## Chính sách Bảo Hành Tiêu Chuẩn & VIP\n\n### 1. Bảo hành tiêu chuẩn 12 tháng\n- Toàn bộ thiết bị chính hãng Apple, Samsung, Xiaomi bán ra tại Bảo Công Studio đều được bảo hành 12 tháng tại các Trung tâm Bảo hành Ủy quyền (AASP, Samsung Brand Shop).\n- Hỗ trợ gửi máy bảo hành hộ khách hàng hoàn toàn miễn phí.\n\n### 2. Gói Bảo Hành Vàng (Rơi vỡ / Vào nước)\n- Khách hàng có thể đăng ký thêm gói bảo hành mở rộng để được chi trả đến 90% chi phí sửa chữa thay thế linh kiện chính hãng nếu vô tình làm rơi vỡ.",
                'status'  => 1,
            ],
            [
                'title'   => 'Hướng dẫn đặt mua hàng trực tuyến',
                'slug'    => 'huong-dan-mua-hang',
                'summary' => 'Hướng dẫn 4 bước mua sắm và thanh toán online tiện lợi trên website.',
                'content' => "## Hướng Dẫn Mua Hàng Nhanh 4 Bước\n\n1. **Bước 1: Tìm kiếm & Chọn sản phẩm:** Sử dụng thanh tìm kiếm thông minh hoặc bộ lọc danh mục để chọn mẫu điện thoại, màu sắc và dung lượng mong muốn.\n2. **Bước 2: Thêm vào giỏ & Áp mã giảm giá:** Kiểm tra giỏ hàng, nhập mã khuyến mãi (ví dụ `BAOCONG500K` hoặc `WELCOME10`) để nhận chiết khấu ngay.\n3. **Bước 3: Điền thông tin giao nhận:** Nhập họ tên, số điện thoại, địa chỉ nhận hàng và chọn hình thức thanh toán (COD, Chuyển khoản, MoMo, VNPay).\n4. **Bước 4: Xác nhận đơn hàng:** Hệ thống gửi mã vận đơn và nhân viên CSKH sẽ liên hệ xác nhận đơn hàng trong vòng 10 phút.",
                'status'  => 1,
            ],
        ];

        Page::truncate();
        foreach ($pagesData as $p) {
            Page::create($p);
        }

        // =========================================================================
        // 11. MÃ KHUYẾN MÃI / COUPONS (FUNC-ADM-PROMO-01..04 & FUNC-ORDER-02)
        // =========================================================================
        $promotionsData = [
            [
                'code'                => 'BAOCONG500K',
                'name'                => 'Giảm 500.000₫ cho Flagship cao cấp',
                'discount_type'       => 'fixed',
                'discount_value'      => 500000,
                'max_discount_amount' => 500000,
                'min_order_value'     => 15000000,
                'usage_limit'         => 100,
                'used_count'          => 12,
                'start_date'          => now()->subDays(5),
                'end_date'            => now()->addDays(30),
                'status'              => 1,
            ],
            [
                'code'                => 'WELCOME10',
                'name'                => 'Ưu đãi thành viên mới giảm 10% (Tối đa 1 triệu)',
                'discount_type'       => 'percent',
                'discount_value'      => 10,
                'max_discount_amount' => 1000000,
                'min_order_value'     => 5000000,
                'usage_limit'         => 200,
                'used_count'          => 25,
                'start_date'          => now()->subDays(10),
                'end_date'            => now()->addDays(60),
                'status'              => 1,
            ],
            [
                'code'                => 'VIP2026',
                'name'                => 'Tri ân khách hàng VIP giảm trực tiếp 1.500.000₫',
                'discount_type'       => 'fixed',
                'discount_value'      => 1500000,
                'max_discount_amount' => 1500000,
                'min_order_value'     => 25000000,
                'usage_limit'         => 50,
                'used_count'          => 8,
                'start_date'          => now()->subDays(2),
                'end_date'            => now()->addDays(45),
                'status'              => 1,
            ],
            [
                'code'                => 'FREESHIP',
                'name'                => 'Miễn phí vận chuyển toàn quốc cho đơn từ 500.000₫',
                'discount_type'       => 'fixed',
                'discount_value'      => 30000,
                'max_discount_amount' => 30000,
                'min_order_value'     => 500000,
                'usage_limit'         => 500,
                'used_count'          => 110,
                'start_date'          => now()->subDays(15),
                'end_date'            => now()->addDays(90),
                'status'              => 1,
            ],
        ];

        Promotion::truncate();
        foreach ($promotionsData as $promo) {
            Promotion::create($promo);
        }

        // =========================================================================
        // 12. PHIẾU NHẬP / XUẤT KHO HÀNG (FUNC-ADM-STOCK-01..03)
        // =========================================================================
        $stockMovementsData = [
            [
                'code'               => 'NK-20261001-A101',
                'product_id'         => 1, // iPhone 16 Pro Max 256GB
                'type'               => 'import',
                'quantity'           => 50,
                'unit_cost'          => 30500000,
                'stock_before'       => 15,
                'stock_after'        => 65,
                'supplier_or_reason' => 'Apple Việt Nam (Nhập khẩu chính ngạch)',
                'note'               => 'Lô hàng máy màu Titan Sa Mạc và Titan Tự Nhiên đợt 1',
                'created_by'         => 'Quản Trị Viên Bảo Công (admin)',
            ],
            [
                'code'               => 'NK-20261005-B202',
                'product_id'         => 5, // Samsung Galaxy S24 Ultra
                'type'               => 'import',
                'quantity'           => 30,
                'unit_cost'          => 24500000,
                'stock_before'       => 10,
                'stock_after'        => 40,
                'supplier_or_reason' => 'Samsung Vina Electronics',
                'note'               => 'Nhập bổ sung phiên bản 256GB màu Xám Titan phục vụ khuyến mãi',
                'created_by'         => 'Quản Trị Viên Hệ Thống (admin)',
            ],
            [
                'code'               => 'NK-20261010-C303',
                'product_id'         => 3, // iPad Pro M4 11 inch
                'type'               => 'import',
                'quantity'           => 20,
                'unit_cost'          => 23800000,
                'stock_before'       => 5,
                'stock_after'        => 25,
                'supplier_or_reason' => 'FPT Synnex Distributor',
                'note'               => 'Lô iPad màn hình Tandem OLED chính hãng',
                'created_by'         => 'Quản Trị Viên Bảo Công (admin)',
            ],
            [
                'code'               => 'XK-20261018-X001',
                'product_id'         => 5, // Samsung Galaxy S24 Ultra
                'type'               => 'export',
                'quantity'           => 2,
                'unit_cost'          => 24500000,
                'stock_before'       => 40,
                'stock_after'        => 38,
                'supplier_or_reason' => 'Xuất trả nhà cung cấp (Lỗi cấn móp vỏ hộp khi vận chuyển)',
                'note'               => 'Đã lập biên bản bàn giao đơn vị vận chuyển Viettel Post',
                'created_by'         => 'Quản Trị Viên Hệ Thống (admin)',
            ],
            [
                'code'               => 'XK-20261022-X002',
                'product_id'         => 8, // Củ sạc nhanh Anker GaNPrime 65W
                'type'               => 'export',
                'quantity'           => 1,
                'unit_cost'          => 750000,
                'stock_before'       => 35,
                'stock_after'        => 34,
                'supplier_or_reason' => 'Xuất hủy hàng lỗi kỹ thuật linh kiện nguồn',
                'note'               => 'Thiết bị cắm sạc chập chờn, bàn giao phòng bảo hành Anker tiêu hủy',
                'created_by'         => 'Quản Trị Viên Bảo Công (admin)',
            ],
        ];

        StockMovement::truncate();
        foreach ($stockMovementsData as $sm) {
            StockMovement::create($sm);
        }

    }
}
