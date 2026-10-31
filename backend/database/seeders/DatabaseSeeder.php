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
                'sale_price'  => 27990000,
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
                'sale_price'  => 28490000,
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
                'sale_price'  => 18790000,
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
                'image'       => 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80',
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
                'sale_price'  => 25990000,
                'stock'       => 18,
                'category_id' => 1,
                'brand_id'    => 2,
                'featured'    => false,
                'status'      => 1,
                'image'       => 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80',
                'description' => 'Galaxy Z Flip6 gập hộp phấn nhỏ gọn sang trọng, màn hình ngoài Flex Window 3.4 inch độc đáo và camera 50MP cải tiến.',
            ],
            [
                'id'          => 8,
                'name'        => 'Xiaomi 14 Ultra 512GB',
                'slug'        => 'xiaomi-14-ultra-512gb',
                'sku'         => 'MI-14U-512',
                'price'       => 29990000,
                'sale_price'  => 27990000,
                'stock'       => 12,
                'category_id' => 1,
                'brand_id'    => 3,
                'featured'    => true,
                'status'      => 1,
                'image'       => 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop&q=80',
                'description' => 'Xiaomi 14 Ultra với cụm 4 camera Leica Summilux cảm biến 1 inch thế hệ mới, thấu kính quang học đỉnh cao cho chất ảnh sống động.',
            ],
            [
                'id'          => 9,
                'name'        => 'Xiaomi 14T Pro 256GB',
                'slug'        => 'xiaomi-14t-pro-256gb',
                'sku'         => 'MI-14TP-256',
                'price'       => 16990000,
                'sale_price'  => 15490000,
                'stock'       => 35,
                'category_id' => 3,
                'brand_id'    => 3,
                'featured'    => false,
                'status'      => 1,
                'image'       => 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=600&auto=format&fit=crop&q=80',
                'description' => 'Xiaomi 14T Pro chip Dimensity 9300+, sạc 120W siêu tốc trong 19 phút, màn hình CrystalRes 144Hz chuyên phục vụ game thủ.',
            ],
            [
                'id'          => 10,
                'name'        => 'OPPO Find X7 Ultra 256GB',
                'slug'        => 'oppo-find-x7-ultra-256gb',
                'sku'         => 'OP-FX7U-256',
                'price'       => 26990000,
                'sale_price'  => 24990000,
                'stock'       => 15,
                'category_id' => 1,
                'brand_id'    => 4,
                'featured'    => false,
                'status'      => 1,
                'image'       => 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600&auto=format&fit=crop&q=80',
                'description' => 'OPPO Find X7 Ultra camera kép tiềm vọng đầu tiên trên thế giới kết hợp màu sắc điện ảnh Hasselblad và mặt lưng da cao cấp.',
            ],
            [
                'id'          => 11,
                'name'        => 'Vivo X100 Pro 256GB',
                'slug'        => 'vivo-x100-pro-256gb',
                'sku'         => 'VV-X100P-256',
                'price'       => 23990000,
                'sale_price'  => 21990000,
                'stock'       => 22,
                'category_id' => 1,
                'brand_id'    => 5,
                'featured'    => false,
                'status'      => 1,
                'image'       => 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80',
                'description' => 'Vivo X100 Pro chuyên gia chụp đêm và chân dung với thấu kính ZEISS APO, chip xử lý hình ảnh Vivo V3 6nm hiệu năng cao.',
            ],
            [
                'id'          => 12,
                'name'        => 'Realme GT5 Pro 256GB',
                'slug'        => 'realme-gt5-pro-256gb',
                'sku'         => 'RM-GT5P-256',
                'price'       => 15990000,
                'sale_price'  => 14490000,
                'stock'       => 28,
                'category_id' => 3,
                'brand_id'    => 6,
                'featured'    => false,
                'status'      => 1,
                'image'       => 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80',
                'description' => 'Realme GT5 Pro chiến binh gaming chip Snapdragon 8 Gen 3, tản nhiệt buồng hơi 12000mm² và pin trâu 5400mAh sạc 100W.',
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
                        'product_id'   => 9,
                        'product_name' => 'Xiaomi 14T Pro 256GB',
                        'product_sku'  => 'MI-14TP-256',
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
                        'product_id'   => 12,
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
                'product_id'     => 9, // Xiaomi 14T Pro 256GB
                'user_id'        => null,
                'reviewer_name'  => 'Hoàng Đình Bách',
                'reviewer_email' => 'bach.hd@gmail.com',
                'rating'         => 5,
                'comment'        => 'Ống kính Leica chụp tông màu chân dung rất có chiều sâu. Sạc nhanh 120W đúng 19 phút là đầy 100% pin, quá bá đạo!',
                'admin_reply'    => 'Dạ cảm ơn anh Bách! Xiaomi 14T Pro là sự kết hợp tuyệt vời với Leica đó ạ.',
                'status'         => 1,
            ],
            [
                'product_id'     => 9,
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
                'product_id'     => 12, // Realme GT5 Pro 256GB
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
    }
}
