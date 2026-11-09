-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th10 06, 2026 lúc 11:49 PM
-- Phiên bản máy phục vụ: 10.11.16-MariaDB
-- Phiên bản PHP: 8.5.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `bao_cong`
--
CREATE DATABASE IF NOT EXISTS `bao_cong` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `bao_cong`;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `banners`
--

CREATE TABLE `banners` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `subtitle` varchar(500) DEFAULT NULL,
  `badge_text` varchar(100) DEFAULT NULL,
  `image` varchar(500) NOT NULL,
  `link_url` varchar(500) NOT NULL DEFAULT '/products',
  `button_text` varchar(100) NOT NULL DEFAULT 'Khám phá ngay',
  `position` varchar(50) NOT NULL DEFAULT 'main_hero',
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `status` tinyint(4) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `banners`
--

INSERT INTO `banners` (`id`, `title`, `subtitle`, `badge_text`, `image`, `link_url`, `button_text`, `position`, `sort_order`, `status`, `created_at`, `updated_at`) VALUES
(1, 'iPhone 16 Pro Max - Vươn Tầm Đẳng Cấp Titan Sa Mạc', 'Trang bị chip A18 Pro 3nm vượt trội, Camera Fusion 48MP và nút Camera Control thế hệ mới.', 'FLAGSHIP MỚI NHẤT', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=1470&auto=format&fit=crop', '/san-pham/iphone-16-pro-max-256gb', 'Đặt Hàng Ngay', 'main_hero', 1, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(2, 'Samsung Galaxy Z Fold6 - Kỷ Nguyên Galaxy AI', 'Màn hình gập Dynamic AMOLED 2X 120Hz mỏng nhẹ nhất từ trước đến nay cùng bút S-Pen quyền năng.', 'SIÊU PHẨM MÀN GẬP', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=1470&auto=format&fit=crop', '/san-pham/samsung-galaxy-z-fold6-256gb', 'Trải Nghiệm Ngay', 'main_hero', 2, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(3, 'Thu Cũ Đổi Mới - Trợ Giá Đến 3.000.000₫', 'Quy trình thẩm định máy chỉ 15 phút, lên đời máy mới không lo bù tiền.', 'HOT DEAL', 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?q=80&w=1470&auto=format&fit=crop', '/products', 'Xem Chi Tiết', 'sub_banner', 1, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(4, 'Hệ Sinh Thái Phụ Kiện Apple & GaN Chính Hãng', 'Giảm trực tiếp 20% khi mua kèm máy mới bất kỳ trong tháng này tại Bảo Công Studio.', 'ƯU ĐÃI KÈM MÁY', 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1470&auto=format&fit=crop', '/products?category_id=4', 'Mua Phụ Kiện', 'sub_banner', 2, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `brands`
--

CREATE TABLE `brands` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `status` tinyint(4) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `brands`
--

INSERT INTO `brands` (`id`, `name`, `image`, `status`, `created_at`, `updated_at`, `deleted_at`, `slug`, `description`) VALUES
(1, 'Apple', 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', 1, NULL, NULL, NULL, 'apple', 'Thương hiệu công nghệ hàng đầu thế giới từ Mỹ với hệ sinh thái iOS đỉnh cao.'),
(2, 'Samsung', 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg', 1, NULL, NULL, NULL, 'samsung', 'Gã khổng lồ công nghệ Hàn Quốc với dòng Galaxy S và Z Fold dẫn đầu công nghệ.'),
(3, 'Xiaomi', 'https://upload.wikimedia.org/wikipedia/commons/2/29/Xiaomi_logo.svg', 1, NULL, NULL, NULL, 'xiaomi', 'Thương hiệu nổi tiếng với cấu hình cực mạnh, sạc siêu tốc cùng ống kính Leica.'),
(4, 'OPPO', 'https://upload.wikimedia.org/wikipedia/commons/b/b8/OPPO_Logo.svg', 1, NULL, NULL, NULL, 'oppo', 'Chuyên gia nhiếp ảnh chân dung, thiết kế sang trọng và camera Hasselblad.'),
(5, 'Vivo', 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Vivo_mobile_logo.png', 1, NULL, NULL, NULL, 'vivo', 'Đỉnh cao nhiếp ảnh di động đồng chế tác với Zeiss và chip xử lý ảnh độc quyền V3.'),
(6, 'Realme', 'https://upload.wikimedia.org/wikipedia/commons/1/13/Realme_logo.svg', 1, NULL, NULL, NULL, 'realme', 'Thương hiệu smartphone đậm chất công nghệ dành cho giới trẻ năng động.');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `carts`
--

CREATE TABLE `carts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `carts`
--

INSERT INTO `carts` (`id`, `user_id`, `created_at`, `updated_at`) VALUES
(1, 1, '2026-11-04 10:38:17', '2026-11-04 10:38:17'),
(2, 4, '2026-11-04 10:39:39', '2026-11-04 10:39:39');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cart_items`
--

CREATE TABLE `cart_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `cart_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `parent_id` bigint(20) UNSIGNED DEFAULT NULL,
  `status` tinyint(4) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `categories`
--

INSERT INTO `categories` (`id`, `name`, `parent_id`, `status`, `sort_order`, `created_at`, `updated_at`, `deleted_at`, `slug`, `description`, `image`) VALUES
(1, 'Điện thoại thông minh', NULL, 1, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL, 'dien-thoai-thong-minh', 'Các dòng smartphone cao cấp, cận cao cấp và phổ thông chính hãng.', NULL),
(2, 'Máy tính bảng', NULL, 1, 2, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL, 'may-tinh-bang', 'iPad, Galaxy Tab và các dòng tablet phục vụ học tập, giải trí và đồ họa.', NULL),
(3, 'Điện thoại Gaming', NULL, 1, 3, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL, 'dien-thoai-gaming', 'Smartphone chuyên game với hệ thống tản nhiệt tối tân và màn hình 144Hz.', NULL),
(4, 'Phụ kiện chính hãng', NULL, 1, 4, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL, 'phu-kien-chinh-hang', 'Củ sạc nhanh GaN, cáp sạc Type-C/Lightning, tai nghe không dây chính hãng.', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `menus`
--

CREATE TABLE `menus` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `url` varchar(500) NOT NULL,
  `position` varchar(50) NOT NULL DEFAULT 'header',
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `status` tinyint(4) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `menus`
--

INSERT INTO `menus` (`id`, `name`, `url`, `position`, `sort_order`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Trang chủ', '/trangchu', 'header', 1, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(2, 'Tất cả sản phẩm', '/products', 'header', 2, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(3, 'Sản phẩm mới', '/products?type=new', 'header', 3, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(4, 'Sale / Khuyến mãi', '/products?type=sale', 'header', 4, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(5, 'Bài viết công nghệ', '/bai-viet', 'header', 5, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(6, 'Giới thiệu', '/trang/gioi-thieu', 'header', 6, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(7, 'Trung tâm hỗ trợ', '/ho-tro', 'header', 7, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(8, 'Về Bảo Công Studio', '/trang/gioi-thieu', 'footer', 1, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(9, 'Chính sách mua hàng', '/trang/chinh-sach-mua-hang', 'footer', 2, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(10, 'Chính sách đổi trả 30 ngày', '/trang/chinh-sach-doi-tra', 'footer', 3, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(11, 'Chính sách bảo hành 12 tháng', '/trang/chinh-sach-bao-hanh', 'footer', 4, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(12, 'Hướng dẫn đặt mua online', '/trang/huong-dan-mua-hang', 'footer', 5, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_09_21_080135_create_personal_access_tokens_table', 1),
(5, '2026_10_05_103038_create_categories_table', 1),
(6, '2026_10_05_104124_create_brands_table', 1),
(7, '2026_10_05_999999_create_products_table', 1),
(8, '2026_10_12_000001_add_soft_deletes_to_products_categories_brands_tables', 1),
(9, '2026_10_12_000002_add_parent_id_to_categories_table', 1),
(10, '2026_10_12_000003_update_role_column_in_users_table', 1),
(11, '2026_10_12_000004_create_carts_and_orders_tables', 1),
(12, '2026_10_12_000005_create_reviews_and_support_tickets_tables', 1),
(13, '2026_10_12_000006_create_posts_and_post_comments_tables', 1),
(14, '2026_10_12_000007_create_settings_banners_menus_pages_promos_stocks_tables', 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `orders`
--

CREATE TABLE `orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `order_code` varchar(50) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `customer_phone` varchar(20) NOT NULL,
  `shipping_address` varchar(500) NOT NULL,
  `note` text DEFAULT NULL,
  `subtotal` decimal(15,2) NOT NULL DEFAULT 0.00,
  `shipping_fee` decimal(15,2) NOT NULL DEFAULT 0.00,
  `discount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `coupon_code` varchar(50) DEFAULT NULL,
  `total` decimal(15,2) NOT NULL DEFAULT 0.00,
  `payment_method` varchar(50) NOT NULL DEFAULT 'cod',
  `payment_status` varchar(50) NOT NULL DEFAULT 'pending',
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `status_history` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`status_history`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `order_code`, `customer_name`, `customer_email`, `customer_phone`, `shipping_address`, `note`, `subtotal`, `shipping_fee`, `discount`, `coupon_code`, `total`, `payment_method`, `payment_status`, `status`, `status_history`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 4, 'BC-20261001', 'Khách Hàng Thân Thiết', 'user@gmail.com', '0901234567', 'Số 789 Đường Nguyễn Thị Minh Khai, Phường Bến Nghé, Quận 1, TP.HCM', 'Giao giờ hành chính, gọi trước 15 phút.', 33490000.00, 0.00, 0.00, NULL, 33490000.00, 'bank_transfer', 'paid', 'shipping', '[{\"status\":\"pending\",\"note\":\"Kh\\u00e1ch h\\u00e0ng t\\u1ea1o \\u0111\\u01a1n h\\u00e0ng m\\u1edbi tr\\u00ean website\",\"changed_by\":\"Kh\\u00e1ch h\\u00e0ng\",\"created_at\":\"2026-11-04T12:34:25.682716Z\"},{\"status\":\"shipping\",\"note\":\"H\\u1ec7 th\\u1ed1ng chuy\\u1ec3n tr\\u1ea1ng th\\u00e1i \\u0111\\u01a1n h\\u00e0ng sang: shipping\",\"changed_by\":\"Qu\\u1ea3n tr\\u1ecb vi\\u00ean\",\"created_at\":\"2026-11-04T15:34:25.682794Z\"}]', '2026-11-02 10:34:25', '2026-11-04 10:34:25', NULL),
(2, 4, 'BC-20261002', 'Trần Văn An', 'an.tran@gmail.com', '0912345678', 'Tòa nhà Landmark 81, 720A Điện Biên Phủ, Phường 22, Bình Thạnh, TP.HCM', 'Hàng giá trị cao vui lòng bọc chống sốc kỹ càng.', 28990000.00, 30000.00, 500000.00, NULL, 28520000.00, 'vnpay', 'paid', 'completed', '[{\"status\":\"pending\",\"note\":\"Kh\\u00e1ch h\\u00e0ng t\\u1ea1o \\u0111\\u01a1n h\\u00e0ng m\\u1edbi tr\\u00ean website\",\"changed_by\":\"Kh\\u00e1ch h\\u00e0ng\",\"created_at\":\"2026-11-04T12:34:25.706433Z\"},{\"status\":\"completed\",\"note\":\"H\\u1ec7 th\\u1ed1ng chuy\\u1ec3n tr\\u1ea1ng th\\u00e1i \\u0111\\u01a1n h\\u00e0ng sang: completed\",\"changed_by\":\"Qu\\u1ea3n tr\\u1ecb vi\\u00ean\",\"created_at\":\"2026-11-04T15:34:25.706487Z\"}]', '2026-10-31 10:34:25', '2026-11-04 10:34:25', NULL),
(3, NULL, 'BC-20261003', 'Nguyễn Thị Bích', 'bichnguyen@gmail.com', '0934567890', 'Số 45 Lê Duẩn, Phường Bến Nghé, Quận 1, TP.HCM', 'Giao buổi chiều sau 17h.', 27990000.00, 0.00, 0.00, NULL, 27990000.00, 'cod', 'pending', 'confirmed', '[{\"status\":\"pending\",\"note\":\"Kh\\u00e1ch h\\u00e0ng t\\u1ea1o \\u0111\\u01a1n h\\u00e0ng m\\u1edbi tr\\u00ean website\",\"changed_by\":\"Kh\\u00e1ch h\\u00e0ng\",\"created_at\":\"2026-11-04T12:34:25.710314Z\"},{\"status\":\"confirmed\",\"note\":\"H\\u1ec7 th\\u1ed1ng chuy\\u1ec3n tr\\u1ea1ng th\\u00e1i \\u0111\\u01a1n h\\u00e0ng sang: confirmed\",\"changed_by\":\"Qu\\u1ea3n tr\\u1ecb vi\\u00ean\",\"created_at\":\"2026-11-04T15:34:25.710360Z\"}]', '2026-11-03 10:34:25', '2026-11-04 10:34:25', NULL),
(4, NULL, 'BC-20261004', 'Lê Hoàng Long', 'long.le@gmail.com', '0978901234', '120 Hoàng Hoa Thám, Phường 7, Quận Bình Thạnh, TP.HCM', 'Đồng kiểm hàng trước khi thanh toán COD.', 15490000.00, 40000.00, 0.00, NULL, 15530000.00, 'cod', 'pending', 'pending', '[{\"status\":\"pending\",\"note\":\"Kh\\u00e1ch h\\u00e0ng t\\u1ea1o \\u0111\\u01a1n h\\u00e0ng m\\u1edbi tr\\u00ean website\",\"changed_by\":\"Kh\\u00e1ch h\\u00e0ng\",\"created_at\":\"2026-11-04T12:34:25.714035Z\"}]', '2026-11-04 07:34:25', '2026-11-04 10:34:25', NULL),
(5, 4, 'BC-20261005', 'Phạm Minh Đức', 'duc.pm@gmail.com', '0989012345', '250 Cộng Hòa, Phường 13, Quận Tân Bình, TP.HCM', 'Khách đổi ý muốn lấy bản dung lượng cao hơn nên yêu cầu hủy.', 14490000.00, 0.00, 0.00, NULL, 14490000.00, 'momo', 'refunded', 'cancelled', '[{\"status\":\"pending\",\"note\":\"Kh\\u00e1ch h\\u00e0ng t\\u1ea1o \\u0111\\u01a1n h\\u00e0ng m\\u1edbi tr\\u00ean website\",\"changed_by\":\"Kh\\u00e1ch h\\u00e0ng\",\"created_at\":\"2026-11-04T12:34:25.717088Z\"},{\"status\":\"cancelled\",\"note\":\"H\\u1ec7 th\\u1ed1ng chuy\\u1ec3n tr\\u1ea1ng th\\u00e1i \\u0111\\u01a1n h\\u00e0ng sang: cancelled\",\"changed_by\":\"Qu\\u1ea3n tr\\u1ecb vi\\u00ean\",\"created_at\":\"2026-11-04T15:34:25.717126Z\"}]', '2026-11-01 10:34:25', '2026-11-04 10:34:25', NULL),
(6, 4, 'DH261106155337BPR', 'Khách Hàng Thân Thiết', 'user@gmail.com', '0901234567', 'Số 789 Đường Nguyễn Thị Minh Khai, Phường Bến Nghé, Quận 1, TP.HCM', NULL, 63480000.00, 0.00, 0.00, NULL, 63480000.00, 'cod', 'pending', 'pending', '[{\"status\":\"pending\",\"note\":\"Kh\\u00e1ch h\\u00e0ng t\\u1ea1o \\u0111\\u01a1n h\\u00e0ng m\\u1edbi\",\"changed_by\":\"Kh\\u00e1ch H\\u00e0ng Th\\u00e2n Thi\\u1ebft\",\"time\":\"2026-11-06T15:53:37+00:00\"}]', '2026-11-06 08:53:37', '2026-11-06 08:53:37', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order_details`
--

CREATE TABLE `order_details` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_sku` varchar(100) DEFAULT NULL,
  `price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `subtotal` decimal(15,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `order_details`
--

INSERT INTO `order_details` (`id`, `order_id`, `product_id`, `product_name`, `product_sku`, `price`, `quantity`, `subtotal`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'iPhone 16 Pro Max 256GB', 'IP16PM-256', 33490000.00, 1, 33490000.00, '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(2, 2, 5, 'Samsung Galaxy S24 Ultra 256GB', 'SS-S24U-256', 28990000.00, 1, 28990000.00, '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(3, 3, 2, 'iPhone 16 Pro 128GB', 'IP16P-128', 27990000.00, 1, 27990000.00, '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(4, 4, 15, 'Xiaomi 14T Pro 256GB', 'XM-14TP-256', 15490000.00, 1, 15490000.00, '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(5, 5, 16, 'Realme GT5 Pro 256GB', 'RM-GT5P-256', 14490000.00, 1, 14490000.00, '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(6, 6, 1, 'iPhone 16 Pro Max 256GB', 'IP16PM-256', 33490000.00, 1, 33490000.00, '2026-11-06 08:53:37', '2026-11-06 08:53:37'),
(7, 6, 3, 'iPhone 15 Pro Max 256GB', 'IP15PM-256', 29990000.00, 1, 29990000.00, '2026-11-06 08:53:37', '2026-11-06 08:53:37');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order_items`
--

CREATE TABLE `order_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_sku` varchar(100) DEFAULT NULL,
  `price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `subtotal` decimal(15,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order_status_histories`
--

CREATE TABLE `order_status_histories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `status` varchar(50) NOT NULL,
  `note` text DEFAULT NULL,
  `changed_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `order_status_histories`
--

INSERT INTO `order_status_histories` (`id`, `order_id`, `status`, `note`, `changed_by`, `created_at`) VALUES
(1, 1, 'pending', 'Khách hàng tạo đơn hàng mới trên website', 'Khách hàng', '2026-11-04 05:34:25'),
(2, 1, 'shipping', 'Hệ thống chuyển trạng thái đơn hàng sang: shipping', 'Quản trị viên', '2026-11-04 08:34:25'),
(3, 2, 'pending', 'Khách hàng tạo đơn hàng mới trên website', 'Khách hàng', '2026-11-04 05:34:25'),
(4, 2, 'completed', 'Hệ thống chuyển trạng thái đơn hàng sang: completed', 'Quản trị viên', '2026-11-04 08:34:25'),
(5, 3, 'pending', 'Khách hàng tạo đơn hàng mới trên website', 'Khách hàng', '2026-11-04 05:34:25'),
(6, 3, 'confirmed', 'Hệ thống chuyển trạng thái đơn hàng sang: confirmed', 'Quản trị viên', '2026-11-04 08:34:25'),
(7, 4, 'pending', 'Khách hàng tạo đơn hàng mới trên website', 'Khách hàng', '2026-11-04 05:34:25'),
(8, 5, 'pending', 'Khách hàng tạo đơn hàng mới trên website', 'Khách hàng', '2026-11-04 05:34:25'),
(9, 5, 'cancelled', 'Hệ thống chuyển trạng thái đơn hàng sang: cancelled', 'Quản trị viên', '2026-11-04 08:34:25'),
(10, 6, 'pending', 'Khách hàng tạo đơn hàng mới', 'Khách Hàng Thân Thiết', '2026-11-06 08:53:37');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `pages`
--

CREATE TABLE `pages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `summary` text DEFAULT NULL,
  `content` longtext NOT NULL,
  `status` tinyint(4) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `pages`
--

INSERT INTO `pages` (`id`, `title`, `slug`, `summary`, `content`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Giới thiệu về Bảo Công Studio', 'gioi-thieu', 'Hành trình phát triển và sứ mệnh phụng sự khách hàng yêu thích công nghệ của Bảo Công Studio.', '## Chào mừng bạn đến với Bảo Công Studio\n\n**Bảo Công Studio** được thành lập với mục tiêu trở thành điểm đến tin cậy hàng đầu cho cộng đồng người dùng công nghệ tại Việt Nam. Chúng tôi cam kết phân phối 100% thiết bị di động, tablet, laptop và phụ kiện chính hãng nguyên seal với đầy đủ hóa đơn chứng từ VAT điện tử.\n\n### Giá trị cốt lõi\n- **Chính hãng tuyệt đối:** Mọi thiết bị bán ra đều được nhập khẩu chính ngạch từ Apple Việt Nam, Samsung Vina, Xiaomi, Anker...\n- **Bảo hành 1 đổi 1 trong 30 ngày:** Bất kỳ lỗi phần cứng nào từ nhà sản xuất sẽ được đổi mới ngay lập tức không giữ máy chờ sửa.\n- **Đồng hành trọn đời:** Đội ngũ kỹ thuật viên giàu kinh nghiệm luôn sẵn sàng tư vấn, hỗ trợ cài đặt và bảo dưỡng thiết bị miễn phí.', 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(2, 'Chính sách mua hàng & Giao nhận', 'chinh-sach-mua-hang', 'Quy định đặt hàng, thanh toán linh hoạt và thời gian giao nhận toàn quốc.', '## Chính sách Mua Hàng & Vận Chuyển\n\n### 1. Phương thức mua hàng\n- Mua trực tiếp tại Showroom: 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM.\n- Đặt hàng trực tuyến qua website Bảo Công Studio với quy trình đơn giản chỉ 3 bước.\n\n### 2. Chính sách miễn phí vận chuyển\n- **Đơn hàng từ 5.000.000₫ trở lên:** Miễn phí 100% cước chuyển phát nhanh toàn quốc.\n- **Đơn hàng dưới 5.000.000₫:** Phí giao hàng cố định 30.000₫ toàn quốc.\n- **Giao hỏa tốc 2 giờ:** Áp dụng cho các quận nội thành TP.HCM (Quận 1, 3, 5, 10, Phú Nhuận, Bình Thạnh).', 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(3, 'Chính sách đổi trả 1 đổi 1 trong 30 ngày', 'chinh-sach-doi-tra', 'Bảo vệ quyền lợi khách hàng với cam kết 1 đổi 1 nhanh chóng và minh bạch.', '## Chính sách Đổi Trả Sản Phẩm\n\n### 1. Thời hạn và điều kiện áp dụng\n- **Trong 30 ngày đầu tiên:** Đổi máy mới 100% nếu sản phẩm phát sinh lỗi phần cứng do nhà sản xuất (màn hình, nguồn, camera, bo mạch...).\n- Thiết bị phải còn đầy đủ hộp máy, phụ kiện đi kèm nguyên vẹn và hóa đơn/số điện thoại mua hàng trên hệ thống.\n\n### 2. Quy trình xử lý\n- Kỹ thuật viên kiểm tra lỗi tại chỗ trong vòng 15 - 30 phút.\n- Khách hàng được đổi máy mới cùng model hoặc nâng cấp lên model cao hơn và bù chênh lệch theo giá niêm yết hiện hành.', 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(4, 'Chính sách bảo hành chính hãng', 'chinh-sach-bao-hanh', 'Quy định bảo hành 12 - 24 tháng tại các trung tâm bảo hành ủy quyền toàn quốc.', '## Chính sách Bảo Hành Tiêu Chuẩn & VIP\n\n### 1. Bảo hành tiêu chuẩn 12 tháng\n- Toàn bộ thiết bị chính hãng Apple, Samsung, Xiaomi bán ra tại Bảo Công Studio đều được bảo hành 12 tháng tại các Trung tâm Bảo hành Ủy quyền (AASP, Samsung Brand Shop).\n- Hỗ trợ gửi máy bảo hành hộ khách hàng hoàn toàn miễn phí.\n\n### 2. Gói Bảo Hành Vàng (Rơi vỡ / Vào nước)\n- Khách hàng có thể đăng ký thêm gói bảo hành mở rộng để được chi trả đến 90% chi phí sửa chữa thay thế linh kiện chính hãng nếu vô tình làm rơi vỡ.', 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(5, 'Hướng dẫn đặt mua hàng trực tuyến', 'huong-dan-mua-hang', 'Hướng dẫn 4 bước mua sắm và thanh toán online tiện lợi trên website.', '## Hướng Dẫn Mua Hàng Nhanh 4 Bước\n\n1. **Bước 1: Tìm kiếm & Chọn sản phẩm:** Sử dụng thanh tìm kiếm thông minh hoặc bộ lọc danh mục để chọn mẫu điện thoại, màu sắc và dung lượng mong muốn.\n2. **Bước 2: Thêm vào giỏ & Áp mã giảm giá:** Kiểm tra giỏ hàng, nhập mã khuyến mãi (ví dụ `BAOCONG500K` hoặc `WELCOME10`) để nhận chiết khấu ngay.\n3. **Bước 3: Điền thông tin giao nhận:** Nhập họ tên, số điện thoại, địa chỉ nhận hàng và chọn hình thức thanh toán (COD, Chuyển khoản, MoMo, VNPay).\n4. **Bước 4: Xác nhận đơn hàng:** Hệ thống gửi mã vận đơn và nhân viên CSKH sẽ liên hệ xác nhận đơn hàng trong vòng 10 phút.', 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(5, 'App\\Models\\User', 1, 'auth_token', '101799490c429848b3c46febd7476f5938e3ffb2fc3391ce42cb7ffc308fccbe', '[\"*\"]', '2026-11-06 11:29:43', NULL, '2026-11-06 08:53:51', '2026-11-06 11:29:43'),
(6, 'App\\Models\\User', 1, 'auth_token', 'cbbf9ba6e39b05d12081e61567bd11e6abe793cc466ddd0409059647d47312cd', '[\"*\"]', NULL, NULL, '2026-11-06 10:58:09', '2026-11-06 10:58:09'),
(7, 'App\\Models\\User', 1, 'auth_token', '3db106fcd422a0acd224047c85e53addd69775c24e87d544b8ab07c96e31a513', '[\"*\"]', '2026-11-06 10:58:24', NULL, '2026-11-06 10:58:10', '2026-11-06 10:58:24'),
(8, 'App\\Models\\User', 4, 'auth_token', '2a47bf988cdd4b23061bb527d91f8d0ed203c361c933c557d532b1983ec8e6a9', '[\"*\"]', NULL, NULL, '2026-11-06 10:58:10', '2026-11-06 10:58:10'),
(9, 'App\\Models\\User', 4, 'auth_token', 'd36786326422243087cd04c2fa125da1abb25e405a178a495660be559fae93c3', '[\"*\"]', '2026-11-06 10:58:25', NULL, '2026-11-06 10:58:11', '2026-11-06 10:58:25'),
(11, 'App\\Models\\User', 4, 'auth_token', 'f2808ceb4cb5a6406815afa6c4bc8e7671e682fcac942c18bcfab1bee9219ff9', '[\"*\"]', NULL, NULL, '2026-11-06 10:58:26', '2026-11-06 10:58:26'),
(12, 'App\\Models\\User', 4, 'auth_token', '0a394b02a70fb6b5592fdfa3769be0fd4c558f2038c6374beda5c6cbf61683e6', '[\"*\"]', NULL, NULL, '2026-11-06 10:58:26', '2026-11-06 10:58:26'),
(13, 'App\\Models\\User', 1, 'auth_token', 'c34cd46ac8fb63aa7e36ca1aac09ca13de539aab7b53fcda412d61eb571a5a4d', '[\"*\"]', NULL, NULL, '2026-11-06 11:11:48', '2026-11-06 11:11:48'),
(14, 'App\\Models\\User', 1, 'auth_token', '8e1bf43f4902334947e34ea66be226b2a008cbb36dc8ca5cc241717032c93a37', '[\"*\"]', '2026-11-06 11:12:02', NULL, '2026-11-06 11:11:48', '2026-11-06 11:12:02'),
(15, 'App\\Models\\User', 4, 'auth_token', 'fd7e739b94577df017771830dab814fc117602f12116e680bd3535c58f8aac68', '[\"*\"]', NULL, NULL, '2026-11-06 11:11:48', '2026-11-06 11:11:48'),
(16, 'App\\Models\\User', 4, 'auth_token', '0850d6a12fe114254a06d8d5b3a0448124cbc783ea1fbd646a0254fe740674dd', '[\"*\"]', '2026-11-06 11:12:03', NULL, '2026-11-06 11:11:49', '2026-11-06 11:12:03'),
(18, 'App\\Models\\User', 4, 'auth_token', '6efe2b345d8d023028d0bb323fc887ab513fc77a9f8d93fbecf185ccf617ecad', '[\"*\"]', NULL, NULL, '2026-11-06 11:12:04', '2026-11-06 11:12:04'),
(19, 'App\\Models\\User', 4, 'auth_token', '7fa5092597c028616b1f3bf6966318b14e21fed9bb9997115b7db36501af3a64', '[\"*\"]', NULL, NULL, '2026-11-06 11:12:04', '2026-11-06 11:12:04'),
(20, 'App\\Models\\User', 4, 'auth_token', 'f073f667f3c69053c66ed27ff34c1948598bf34702bc18bf7ddf3d5b4f538b85', '[\"*\"]', NULL, NULL, '2026-11-06 11:19:28', '2026-11-06 11:19:28'),
(21, 'App\\Models\\User', 4, 'auth_token', '9aea883c805c05ab841d38bc92f52942356e1dab776c5beb78679c955c7f90fa', '[\"*\"]', NULL, NULL, '2026-11-06 11:19:28', '2026-11-06 11:19:28'),
(22, 'App\\Models\\User', 4, 'auth_token', '1f13e23de410851f7930303a5f18fa0b146f1eb9c230e2a2753960f60239cb93', '[\"*\"]', NULL, NULL, '2026-11-06 11:19:29', '2026-11-06 11:19:29'),
(23, 'App\\Models\\User', 4, 'auth_token', '66fdccff7b634e4b4a3eee7c0ff5ee89ede235521bab1ca0ccd139b2f067d979', '[\"*\"]', NULL, NULL, '2026-11-06 11:19:29', '2026-11-06 11:19:29'),
(24, 'App\\Models\\User', 4, 'auth_token', '455eb1f2ad9c349101d2a39d3aa7cd916c56a296e598796f0a04008b89ac2e38', '[\"*\"]', NULL, NULL, '2026-11-06 11:19:30', '2026-11-06 11:19:30'),
(25, 'App\\Models\\User', 4, 'auth_token', '45a416394d92d073d95d592a3c89523092fc4802c8cd63a1fb86d095ea27917f', '[\"*\"]', NULL, NULL, '2026-11-06 11:19:30', '2026-11-06 11:19:30'),
(26, 'App\\Models\\User', 4, 'auth_token', '8a1090d7030b5a88b66e153a84f069ecca1c152a03984a72451b599c0aeaeee5', '[\"*\"]', NULL, NULL, '2026-11-06 11:19:31', '2026-11-06 11:19:31'),
(27, 'App\\Models\\User', 4, 'auth_token', '4cead2da64ac56980fe8075aa0268af4636128d956a94ef28693516d0e82a618', '[\"*\"]', NULL, NULL, '2026-11-06 11:19:31', '2026-11-06 11:19:31'),
(28, 'App\\Models\\User', 4, 'auth_token', 'bac6cfd453c5ffd76761adda1822376caeabf9fdb9b49500d15958be76393fba', '[\"*\"]', NULL, NULL, '2026-11-06 11:19:32', '2026-11-06 11:19:32'),
(29, 'App\\Models\\User', 4, 'auth_token', 'ba9d42c7f7b0b037c476e12ad1faccf9a6cd23e0547c7a762388ad8babe70652', '[\"*\"]', NULL, NULL, '2026-11-06 11:19:32', '2026-11-06 11:19:32'),
(30, 'App\\Models\\User', 4, 'auth_token', 'd7cc47147dd60409a61339f8e71f5474d2812cbce40e740d87f49971b64a2bc9', '[\"*\"]', NULL, NULL, '2026-11-06 11:19:33', '2026-11-06 11:19:33'),
(31, 'App\\Models\\User', 4, 'auth_token', '395b4234ee8e44a5099873f50207ba812c5f09132d6f2462a11832407d5fa95e', '[\"*\"]', '2026-11-06 11:19:33', NULL, '2026-11-06 11:19:33', '2026-11-06 11:19:33'),
(32, 'App\\Models\\User', 4, 'auth_token', '8b2f7990c941542f958599ddfce52a7c4c5609bcd977d5a794f0849237bc8ddc', '[\"*\"]', NULL, NULL, '2026-11-06 11:19:34', '2026-11-06 11:19:34'),
(33, 'App\\Models\\User', 4, 'auth_token', '24d338e20b2477e24484c6fdd9d013c80d1818b06cb00a193c3b981199e4377f', '[\"*\"]', '2026-11-06 11:19:34', NULL, '2026-11-06 11:19:34', '2026-11-06 11:19:34'),
(34, 'App\\Models\\User', 4, 'auth_token', '906bf820b6b7d5d42b36fb922373bf82849998c60fdc8b0c18fbc854c19065a1', '[\"*\"]', NULL, NULL, '2026-11-06 11:19:35', '2026-11-06 11:19:35'),
(35, 'App\\Models\\User', 4, 'auth_token', '88c2abe6a86faf1294079c812bb9febbfb5b980a1f47a59b22c7b31336235d3d', '[\"*\"]', '2026-11-06 11:19:35', NULL, '2026-11-06 11:19:35', '2026-11-06 11:19:35'),
(36, 'App\\Models\\User', 4, 'auth_token', '1c036ea2e65a96b66fae777646baf9ba64368ebd0e131324105fec0ebaef77c2', '[\"*\"]', NULL, NULL, '2026-11-06 11:19:36', '2026-11-06 11:19:36'),
(37, 'App\\Models\\User', 4, 'auth_token', '122660ae3340350b089c02775b81016b31b9506bb745ca41774d4471919ed729', '[\"*\"]', NULL, NULL, '2026-11-06 11:19:36', '2026-11-06 11:19:36'),
(38, 'App\\Models\\User', 4, 'auth_token', '45d59bd744414038af075d7cad0a09a28b8c8e667baa986a520eb88447b2fa93', '[\"*\"]', NULL, NULL, '2026-11-06 11:19:37', '2026-11-06 11:19:37'),
(39, 'App\\Models\\User', 4, 'auth_token', '2913fce6a44f4ab34bb2cdfe777110fbb111c783e7db118698c933fa38f6bbec', '[\"*\"]', '2026-11-06 11:19:37', NULL, '2026-11-06 11:19:37', '2026-11-06 11:19:37'),
(40, 'App\\Models\\User', 4, 'auth_token', '63a3e3b4180a4da39cc2a70d3ee7926c41ef5e59e7dbb1c7ddf8e45991bb7165', '[\"*\"]', NULL, NULL, '2026-11-06 11:38:03', '2026-11-06 11:38:03'),
(41, 'App\\Models\\User', 4, 'auth_token', 'aa75ddd57e6c28f61dba30adb76c34bde4bf43d3d7d69e1d3197717d52033842', '[\"*\"]', NULL, NULL, '2026-11-06 11:38:03', '2026-11-06 11:38:03'),
(42, 'App\\Models\\User', 4, 'auth_token', '45f19a5e8174ffe0c50f7911ac833d4a66c008a37619006d2ba01d15698d853f', '[\"*\"]', NULL, NULL, '2026-11-06 11:38:04', '2026-11-06 11:38:04'),
(43, 'App\\Models\\User', 4, 'auth_token', '7ba4c4c2d059c43504c7ce8ba4fd833cbe3233ae6778efaf02d2a6a63c18c5ba', '[\"*\"]', NULL, NULL, '2026-11-06 11:38:04', '2026-11-06 11:38:04'),
(44, 'App\\Models\\User', 4, 'auth_token', '0f9d18a46355c7ec909b8e77bff861ee39f463e13801417874d6f982948e55a6', '[\"*\"]', NULL, NULL, '2026-11-06 11:38:05', '2026-11-06 11:38:05'),
(45, 'App\\Models\\User', 4, 'auth_token', '094f98e4040342e8b778212da176288fb90c61d0a5cf095ca289ae75f079ce8a', '[\"*\"]', NULL, NULL, '2026-11-06 11:38:05', '2026-11-06 11:38:05'),
(46, 'App\\Models\\User', 4, 'auth_token', '17f9106f6b01a558d8b8d9d33744110b3caca5a4dde67fdd04f799cd22f38e50', '[\"*\"]', NULL, NULL, '2026-11-06 11:38:06', '2026-11-06 11:38:06'),
(47, 'App\\Models\\User', 4, 'auth_token', '3fad8bc2918b71e602322db07bbf090083bc08705c8b13097ac358f748bbacdc', '[\"*\"]', NULL, NULL, '2026-11-06 11:38:06', '2026-11-06 11:38:06'),
(48, 'App\\Models\\User', 4, 'auth_token', '037a043cbeabc24f82f40241de71dac9c8635b147f255343aab824be65fc2d6d', '[\"*\"]', NULL, NULL, '2026-11-06 11:38:07', '2026-11-06 11:38:07'),
(49, 'App\\Models\\User', 4, 'auth_token', '3c5ce08164cca0e3c6d7b53c4df97e61a353a24a50880353016b772f05fcb810', '[\"*\"]', NULL, NULL, '2026-11-06 11:38:07', '2026-11-06 11:38:07'),
(50, 'App\\Models\\User', 4, 'auth_token', '268cd1718f773d96daad5ab5d6d9d3721b69af7921e689f1e6fc217852298429', '[\"*\"]', NULL, NULL, '2026-11-06 11:38:08', '2026-11-06 11:38:08'),
(51, 'App\\Models\\User', 4, 'auth_token', '0d792b34e91ac391a67ce6e8237b6fbf06dba822cfc88671de0287e4d8316555', '[\"*\"]', '2026-11-06 11:38:09', NULL, '2026-11-06 11:38:09', '2026-11-06 11:38:09'),
(52, 'App\\Models\\User', 4, 'auth_token', 'd386889848664e8bd230e3910a3728aac35c859811318d3123b23103426ba863', '[\"*\"]', NULL, NULL, '2026-11-06 11:38:09', '2026-11-06 11:38:09'),
(53, 'App\\Models\\User', 4, 'auth_token', 'd0d2beb631d2d402f09a2cfc8a65898f62c754efbfa3c62539a8d9e12ba28a21', '[\"*\"]', '2026-11-06 11:38:10', NULL, '2026-11-06 11:38:10', '2026-11-06 11:38:10'),
(54, 'App\\Models\\User', 4, 'auth_token', '116b2342c8382f4201ad131ebc24c320b7be5f0cbf6aa4f8a60e8c5951060012', '[\"*\"]', NULL, NULL, '2026-11-06 11:38:10', '2026-11-06 11:38:10'),
(55, 'App\\Models\\User', 4, 'auth_token', '7cb572d10a37fc2b84c6ee9357b4292b596cd7ef5cfc00a5da5eaaac7698ec82', '[\"*\"]', '2026-11-06 11:38:11', NULL, '2026-11-06 11:38:11', '2026-11-06 11:38:11'),
(56, 'App\\Models\\User', 4, 'auth_token', '5f945e0777ad34dcbe58f10c38ad2de98c99e409e852ee81bc522cb0e80b1409', '[\"*\"]', NULL, NULL, '2026-11-06 11:38:11', '2026-11-06 11:38:11'),
(57, 'App\\Models\\User', 4, 'auth_token', '4ab0006f49132a7f19949a44871b5d46b5541c90d5e95a181e9b4762f385da75', '[\"*\"]', NULL, NULL, '2026-11-06 11:38:12', '2026-11-06 11:38:12'),
(58, 'App\\Models\\User', 4, 'auth_token', '07ca5b288d956b5ced6fbbf62b95ae78f9dd12e151d4d57eec5af5c1295b3342', '[\"*\"]', NULL, NULL, '2026-11-06 11:38:12', '2026-11-06 11:38:12'),
(59, 'App\\Models\\User', 4, 'auth_token', 'eb6c5bd2d91e24c969f5f85a37a24077cb0c5575201114a46e328fffcbe5a4b8', '[\"*\"]', '2026-11-06 11:38:13', NULL, '2026-11-06 11:38:13', '2026-11-06 11:38:13');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `posts`
--

CREATE TABLE `posts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL DEFAULT 'Tin tức công nghệ',
  `post_category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `summary` text DEFAULT NULL,
  `content` longtext NOT NULL,
  `thumbnail` varchar(255) DEFAULT NULL,
  `author_name` varchar(255) NOT NULL DEFAULT 'Ban Biên Tập Bảo Công Studio',
  `reading_time` varchar(255) NOT NULL DEFAULT '5 phút đọc',
  `views` bigint(20) UNSIGNED NOT NULL DEFAULT 0,
  `product_id` bigint(20) UNSIGNED DEFAULT NULL,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `is_visible` tinyint(1) NOT NULL DEFAULT 1,
  `allow_comments` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `posts`
--

INSERT INTO `posts` (`id`, `title`, `slug`, `category`, `post_category_id`, `summary`, `content`, `thumbnail`, `author_name`, `reading_time`, `views`, `product_id`, `is_featured`, `is_visible`, `allow_comments`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Đánh giá chi tiết Samsung Galaxy S24 Ultra: Ông vua Flagship Android 2026', 'danh-gia-chi-tiet-samsung-galaxy-s24-ultra', 'Đánh giá Flagship', 1, 'Galaxy S24 Ultra khẳng định vị thế dẫn đầu phân khúc smartphone cao cấp với khung viền Titanium chuẩn hàng không, màn hình phẳng Gorilla Armor chống chói 2.600 nits, bút S-Pen quyền năng và hệ sinh thái Galaxy AI tiếng Việt đỉnh cao.', '> **ĐIỂM NHẤN NHANH TỪ BAN BIÊN TẬP (KEY TAKEAWAYS):**\n> - **Khung viền Titanium cấp độ hàng không:** Thiết kế màn hình phẳng hoàn toàn, cầm đầm tay, chống trầy xước và bám vân tay vượt trội.\n> - **Màn hình Dynamic AMOLED 2X 2.600 nits:** Kính Corning Gorilla Armor giảm 75% phản xạ ánh sáng mặt trời, nhìn ngoài trời nắng gắt cực rõ.\n> - **Snapdragon 8 Gen 3 for Galaxy:** Buồng tản nhiệt buồng hơi lớn gấp 1.9 lần, FPS ổn định tuyệt đối ở Genshin Impact.\n> - **Hệ thống Galaxy AI tiếng Việt độc quyền:** Khoanh vùng tìm kiếm Circle to Search, Trợ lý ghi âm tóm tắt cuộc họp và Dịch cuộc gọi trực tiếp theo thời gian thực.\n\n## 1. Thiết kế phẳng vuông vức với khung viền Titanium sang trọng\n\nSamsung đã chính thức lắng nghe người dùng khi từ bỏ hoàn toàn các cạnh cong quyến rũ nhưng dễ chạm nhầm của các thế hệ trước để chuyển sang thiết kế màn hình phẳng hoàn toàn trên Galaxy S24 Ultra. Quyết định này giúp tối ưu hóa diện tích hiển thị, dán kính cường lực dễ dàng hơn và đặc biệt là khi dùng bút S-Pen viết vẽ ở sát mép viền không còn bị trượt tay khó chịu.\n\nKhung viền máy được gia công từ chất liệu Titanium cấp độ hàng không với lớp hoàn thiện nhám mờ satin tinh tế. Trải nghiệm cầm nắm thực tế cho thấy máy đầm tay, chắc chắn, các cạnh vát kim cương nhẹ không gây cấn lòng bàn tay dù kích thước máy lên tới 6.8 inch. Trọng lượng máy đạt mức 232g, phân bổ trọng tâm rất cân bằng giúp việc sử dụng liên tục trong nhiều giờ không bị mỏi cổ tay.\n\n![Cận cảnh khung viền Titanium satin nhám mờ và màn hình phẳng không viền của Samsung Galaxy S24 Ultra](https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=1200&q=80)\n\n## 2. Màn hình Dynamic AMOLED 2X sáng 2.600 nits với kính chống chói Gorilla Armor\n\nNếu phải chọn ra một nâng cấp đáng giá nhất trên Galaxy S24 Ultra so với toàn bộ thế giới smartphone hiện nay, đó chắc chắn phải là lớp kính bảo vệ Corning Gorilla Armor hoàn toàn mới. Không chỉ tăng khả năng chống trầy xước gấp 4 lần, lớp phủ quang học nano trên kính này có khả năng hấp thụ và triệt tiêu đến 75% ánh sáng phản xạ từ môi trường xung quanh.\n\nKhi mang máy ra ngoài trời nắng gắt buổi trưa tại TP.HCM, màn hình vẫn hiển thị đen sâu thẳm, độ tương phản giữ nguyên vẹn mà không hề bị bóng gương hay phản chiếu hình ảnh khuôn mặt người dùng như trên các smartphone dùng kính thông thường. Kết hợp cùng độ sáng đỉnh lên tới 2.600 nits và công nghệ Vision Booster cải tiến, trải nghiệm đọc báo, xem video HDR ngoài trời của S24 Ultra là hoàn hảo không có đối thủ.\n\n![Màn hình Dynamic AMOLED 2X 6.8 inch hiển thị rực rỡ và chống bóng gương tuyệt hảo dưới ánh sáng mạnh](https://images.unsplash.com/photo-1580910051074-3eb694886505?w=1200&q=80)\n\n## 3. Hệ sinh thái Galaxy AI tiếng Việt: Trợ lý thông minh đích thực\n\nGalaxy S24 Ultra không chỉ đơn thuần là cuộc đua cấu hình phần cứng mà là phát súng mở màn cho kỷ nguyên Smartphone AI thực thụ. Đáng khen ngợi nhất là Samsung đã hỗ trợ trọn vẹn gói ngôn ngữ Tiếng Việt chuẩn xác ngay từ ngày đầu xuất xưởng mà không cần chờ đợi.\n\n- **Circle to Search (Khoanh tròn để tìm kiếm):** Bất cứ khi nào bắt gặp một đôi giày, một chiếc đồng hồ hay địa danh trên màn hình, bạn chỉ cần giữ nút Home và khoanh tròn, Google sẽ trả về kết quả tìm kiếm tức thì.\n- **Trợ lý Ghi âm & Tóm tắt cuộc họp:** Ứng dụng Ghi âm tự động nhận diện từng giọng nói khác nhau, bóc băng thành văn bản tiếng Việt chuẩn ngữ pháp và tóm tắt thành các gạch đầu dòng ngắn gọn trong 3 giây.\n- **Phiên dịch trực tiếp cuộc gọi hai chiều (Live Translate):** Dịch thuật giọng nói trực tiếp qua lại giữa tiếng Việt và tiếng Anh, tiếng Hàn, tiếng Nhật mà không cần kết nối mạng Internet.\n\n## 4. Hệ thống Camera 200MP và ống kính Quad Telephoto zoom quang học đỉnh cao\n\nCụm camera sau của Galaxy S24 Ultra vẫn giữ nguyên độ phân giải khủng 200MP ở cảm biến chính, kết hợp camera góc siêu rộng 12MP, camera tele 3x 10MP và điểm nhấn là camera tiềm vọng 50MP zoom quang 5x (kích thước điểm ảnh lớn hơn 60% và hỗ trợ chống rung OIS biên độ rộng gấp đôi thế hệ trước).\n\n![Hệ thống 4 ống kính camera chuyên nghiệp với cảm biến 200MP và ống kính tiềm vọng zoom quang học](https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=1200&q=80)\n\nTrong điều kiện chụp thực tế, ống kính 5x 50MP mới mang lại độ sắc nét và dải tương phản động vượt trội hoàn toàn so với ống kính 10x 10MP cũ. Nhờ độ phân giải cao kết hợp cảm biến điểm ảnh lớn, máy có thể crop cảm biến để cho ra ảnh zoom 10x chất lượng quang học tuyệt hảo mà không hề bị bệt màu hay vỡ hạt. Chế độ chụp chân dung ở tiêu cự 5x tạo ra hiệu ứng nén hậu cảnh tự nhiên, tách bạch chủ thể sắc sảo như chụp từ ống kính máy ảnh cơ chuyên nghiệp.\n\n## 5. Bảng thông số kỹ thuật chi tiết & Hộp Tổng kết Đánh giá\n\n| Hạng mục phần cứng | Thông số kỹ thuật chi tiết trên Galaxy S24 Ultra |\n|---|---|\n| **Màn hình** | 6.8 inch Dynamic AMOLED 2X, QHD+ (3120 x 1440), 1-120Hz, 2.600 nits, kính Gorilla Armor |\n| **Vi xử lý CPU** | Qualcomm Snapdragon 8 Gen 3 for Galaxy (4nm TSMC), GPU Adreno 750 |\n| **Bộ nhớ RAM & ROM** | 12GB RAM LPDDR5X, Bộ nhớ trong 256GB / 512GB / 1TB chuẩn UFS 4.0 |\n| **Camera sau** | 200MP (f/1.7, OIS) + 50MP Periscope (5x, f/3.4, OIS) + 10MP Tele (3x) + 12MP Ultra-wide |\n| **Pin & Sạc** | 5.000 mAh, Sạc nhanh có dây 45W, Sạc không dây 15W, Sạc ngược không dây |\n| **Chất liệu & Độ bền** | Khung viền Titanium, kính Gorilla Armor trước sau, chuẩn kháng nước bụi IP68 |\n\n> **TỔNG KẾT ĐÁNH GIÁ (VERDICT BOX): 9.6 / 10 ĐIỂM**\n> - **Ưu điểm:** Khung viền Titanium bền bỉ; màn hình chống chói Gorilla Armor đỉnh nhất thế giới; hệ thống Galaxy AI tiếng Việt thực dụng cao; camera zoom 5x/10x sắc nét; cam kết hỗ trợ cập nhật phần mềm và bảo mật lên tới 7 năm.\n> - **Nhược điểm:** Tốc độ sạc nhanh 45W chưa có đột phá so với các đối thủ Android từ Trung Quốc; thân máy khá to và đầm đối với người có bàn tay nhỏ.', 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1200&q=80', 'Ban Biên Tập Bảo Công Studio', '8 phút đọc', 1854, 5, 1, 1, 1, '2026-11-04 10:34:25', '2026-11-06 11:12:02', NULL),
(2, 'So sánh camera iPhone 16 Pro Max và Xiaomi 14 Ultra trong điều kiện thiếu sáng', 'so-sanh-camera-iphone-16-pro-max-va-xiaomi-14-ultra', 'Đánh giá Flagship', 1, 'Hai đại diện ưu tú nhất của nhiếp ảnh di động đối đầu trong bài kiểm tra chụp đêm khắc nghiệt: Cảm biến 1 inch hợp tác cùng Leica liệu có áp đảo được thuật toán xử lý Photonic Engine thế hệ mới của Apple?', '> **ĐIỂM NHẤN NHANH TỪ BAN BIÊN TẬP (KEY TAKEAWAYS):**\n> - **Xiaomi 14 Ultra:** Sở hữu cảm biến 1 inch Sony LYT-900 cùng khẩu độ biến thiên vật lý f/1.63 - f/4.0 và lớp tráng phủ quang học Leica Summilux đỉnh cao.\n> - **iPhone 16 Pro Max:** Cảm biến 48MP Fusion thế hệ 2 với lớp phủ hạt chống lóa nano mới, nút Camera Control xúc giác và thuật toán Photonic Engine chân thực.\n> - **Trải nghiệm chụp đêm:** Xiaomi tái hiện chiều sâu điện ảnh đầy cảm xúc, trong khi iPhone cho độ ổn định quay video 4K 120fps HDR vượt trội không đối thủ.\n\n## 1. Cuộc chiến cảm biến: Phần cứng khủng đối đầu Thuật toán đỉnh cao\n\nKhi bước vào cuộc đua nhiếp ảnh ban đêm, kích thước vật lý của cảm biến đóng vai trò quyết định đến lượng photon ánh sáng thu nhận được. Xiaomi 14 Ultra được trang bị cảm biến Sony LYT-900 kích thước 1 inch khổng lồ kết hợp cùng khẩu độ vật lý có thể đóng mở mượt mà từ f/1.63 đến f/4.0. Đi kèm đó là hệ thống thấu kính Leica Summilux cao cấp giúp hạn chế tối đa quang sai và hiện tượng tán xạ ánh sáng.\n\nPhía bên kia chiến tuyến, Apple trang bị cho iPhone 16 Pro Max cảm biến 48MP Fusion thế hệ thứ hai với tốc độ đọc dữ liệu nhanh gấp đôi. Dù kích thước cảm biến chỉ đạt khoảng 1/1.28 inch, sức mạnh vi xử lý Apple A18 Pro kết hợp cùng hệ thống xử lý hình ảnh Deep Fusion và Photonic Engine cho phép máy phân tích hàng chục khung hình phơi sáng khác nhau ở cấp độ từng điểm ảnh trong chớp mắt.\n\n![Cụm ống kính tròn đồ sộ với cảm biến 1 inch hợp tác cùng Leica trên siêu phẩm Xiaomi 14 Ultra](https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=1200&q=80)\n\n## 2. Thử nghiệm chụp thực tế: Phố đêm Bùi Viện và bến Bạch Đằng\n\nTrong bài thử nghiệm thực tế tại các con phố đêm ngập tràn ánh đèn neon và biển hiệu rực rỡ, sự khác biệt về triết lý màu sắc giữa hai thương hiệu lộ rõ ngay từ bức ảnh đầu tiên:\n\n- **Xiaomi 14 Ultra (Leica Authentic):** Ảnh mang tone màu đậm đà, độ tương phản vùng sáng/vùng tối rất gắt gao theo phong cách máy ảnh film cổ điển. Ánh sáng từ các bóng đèn đường có quầng sáng vàng ấm áp, các góc tối được giữ nguyên màu đen huyền bí chứ không bị thuật toán cố tình kéo sáng gượng gạo.\n- **iPhone 16 Pro Max:** Phong cách ảnh thiên về độ trung thực và dải tương phản động (HDR) tự nhiên. Vùng trời đêm được khử nhiễu mịn màng, các chi tiết trong bóng râm dưới tán cây được tái hiện rõ ràng mà không làm mất đi không khí tĩnh lặng của màn đêm.\n\n![Bức ảnh chụp phơi sáng ban đêm thể hiện chi tiết vùng tối và tương phản kinh điển của ống kính quang học](https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1200&q=80)\n\n## 3. Khả năng kiểm soát bóng ma (Ghosting) và tốc độ bắt nét\n\nMột trong những phiền toái lớn nhất trên các thế hệ iPhone trước đây là hiện tượng phản chiếu ánh sáng xanh (Lens Flare/Ghosting) khi chĩa thẳng ống kính vào đèn xe máy hoặc cột đèn cao áp. Trên iPhone 16 Pro Max, Apple đã phủ thêm lớp tráng chống lóa hạt nano cấp độ nguyên tử lên từng thấu kính, giúp hiện tượng bóng ma giảm thiểu khoảng 60%.\n\nTuy nhiên, Xiaomi 14 Ultra với thấu kính Leica Summilux 8 lớp tráng phủ ALD vẫn thể hiện sự vượt trội về độ trong trẻo quang học. Tốc độ lấy nét laser đa điểm của Xiaomi trong bóng tối cực kỳ dứt khoát, gần như bấm chụp là máy lưu ảnh ngay lập tức mà không cần giữ tay chờ Night Mode đếm giây.\n\n## 4. Khả năng quay video thiếu sáng: Apple vẫn giữ vững ngai vàng\n\nNếu ở phần chụp ảnh tĩnh, Xiaomi 14 Ultra chiếm ưu thế nhờ cảm biến 1 inch thì khi chuyển sang chế độ quay video, iPhone 16 Pro Max lập tức chứng minh đẳng cấp độc tôn của mình:\n\n- Khả năng quay video 4K 120fps Dolby Vision HDR mượt mà đến kinh ngạc.\n- Khả năng chuyển tiêu cự mượt giữa các ống kính mà không hề bị giật khung hình hay nhảy tone màu.\n- Hệ thống 4 micro chuẩn phòng thu thu âm tiếng động ban đêm cực kỳ tách bạch, lọc gió hiệu quả.\n\n## 5. Bảng chấm điểm so sánh từng hạng mục nhiếp ảnh ban đêm\n\n| Tiêu chí đánh giá ban đêm | iPhone 16 Pro Max (Thang điểm 10) | Xiaomi 14 Ultra (Thang điểm 10) |\n|---|---|---|\n| **Độ chi tiết và khử nhiễu ảnh tĩnh** | 9.0 / 10 | 9.7 / 10 (Thắng) |\n| **Màu sắc & Chiều sâu cảm xúc** | 8.8 / 10 | 9.6 / 10 (Thắng) |\n| **Kiểm soát lóa đèn (Anti-flare)** | 8.5 / 10 | 9.2 / 10 (Thắng) |\n| **Chân dung đêm (Night Portrait)** | 9.0 / 10 | 9.5 / 10 (Thắng) |\n| **Quay video đêm (Night Video)** | 9.8 / 10 (Thắng áp đảo) | 8.6 / 10 |\n| **Tốc độ chụp lưu ảnh (Shutter Lag)** | 9.5 / 10 | 9.4 / 10 |\n\n> **TỔNG KẾT ĐÁNH GIÁ (VERDICT BOX):**\n> - **Chọn Xiaomi 14 Ultra:** Nếu bạn là tín đồ của nhiếp ảnh đường phố, mê đắm chất màu Leica đậm chất nghệ thuật và muốn sở hữu cảm biến 1 inch đỉnh cao nhất của thế giới smartphone.\n> - **Chọn iPhone 16 Pro Max:** Nếu bạn cần một thiết bị ổn định tuyệt đối, vừa chụp đẹp vừa quay video chuyên nghiệp phục vụ sáng tạo nội dung TikTok/YouTube mọi lúc mọi nơi.', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&q=80', 'Ban Biên Tập Bảo Công Studio', '7 phút đọc', 1420, 1, 1, 1, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL),
(3, '5 mẹo tối ưu pin và giải phóng bộ nhớ cho điện thoại Gaming mượt mà nhất', '5-meo-toi-uu-pin-va-giai-phong-bo-nho-cho-dien-thoai-gaming', 'Mẹo & Thủ thuật', 3, 'Bí kíp tinh chỉnh phần mềm chuyên sâu từ đội ngũ kỹ thuật viên Bảo Công Studio giúp duy trì 120 FPS ổn định, giảm nhiệt độ máy từ 4-6 độ C và kéo dài tuổi thọ cell pin khi chiến game nặng.', '> **ĐIỂM NHẤN NHANH TỪ BAN BIÊN TẬP (KEY TAKEAWAYS):**\n> - **Bypass Charging (Sạc nhánh):** Cấp nguồn trực tiếp cho bo mạch chủ, bỏ qua việc sạc vào pin giúp triệt tiêu hoàn toàn hiện tượng quá nhiệt khi cắm sạc chơi game.\n> - **Khóa FPS thích ứng:** Tránh tình trạng drop giật khung hình đột ngột khi giao tranh tổng ở Genshin Impact hay Liên Quân Mobile.\n> - **Dọn dẹp RAM ảo Swap:** Tắt tính năng RAM ảo gây nghẽn tốc độ đọc ghi chip nhớ UFS 4.0.\n> - **Tắt Background Sync:** Ngăn chặn các ứng dụng mạng xã hội đánh thức CPU khi đang tập trung leo rank.\n\n## 1. Kích hoạt tính năng Sạc Nhánh (Bypass Charging / Direct Power)\n\nSai lầm phổ biến nhất của các game thủ di động là vừa cắm sạc nhanh công suất lớn (67W - 120W) vừa chơi game. Dòng điện đi vào viên pin sẽ sinh nhiệt rất lớn, cộng hưởng cùng nhiệt lượng tỏa ra từ vi xử lý Snapdragon 8 Gen 3 khiến máy nhanh chóng chạm ngưỡng nhiệt 45 độ C. Lúc này, cơ chế Thermal Throttling sẽ ép xung CPU xuống thấp, gây ra hiện tượng giật lag, rớt FPS thảm hại.\n\nGiải pháp hoàn hảo là bật tính năng **Sạc nhánh (Bypass Charging)** có sẵn trong Game Space của các dòng máy như Realme GT5 Pro, ROG Phone hay Black Shark. Khi kích hoạt, dòng điện từ củ sạc sẽ đi thẳng nuôi bo mạch và màn hình mà không nạp vào pin. Nhiệt độ máy giảm ngay lập tức từ 4 đến 6 độ C, FPS duy trì thẳng tắp suốt trận đấu mà pin hoàn toàn không bị chai phồng!\n\n![Kỹ thuật viên kiểm thử nhiệt độ trên máy chơi game trang bị công nghệ tản nhiệt buồng hơi hiện đại](https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1200&q=80)\n\n## 2. Tắt tính năng Mở Rộng RAM Ảo (RAM Plus / Dynamic RAM)\n\nHầu hết các hãng smartphone hiện nay đều quảng cáo tính năng mở rộng thêm 8GB - 12GB RAM ảo lấy từ bộ nhớ trong. Tuy nhiên đối với các tác vụ đòi hỏi băng thông cực cao như gaming, tốc độ đọc ghi của bộ nhớ trong dù là UFS 4.0 vẫn chậm hơn hàng chục lần so với chuẩn RAM vật lý LPDDR5X.\n\nKhi hệ điều hành hoán đổi dữ liệu giữa RAM thật và RAM ảo trên bộ nhớ trong, hiện tượng nghẽn cổ chai (Micro-stutter) sẽ xảy ra, khiến game thi thoảng bị khựng nhẹ 0.5 giây rất khó chịu. Với dung lượng RAM vật lý có sẵn từ 12GB đến 16GB, bạn hãy vào **Cài đặt > Chăm sóc thiết bị > RAM Plus** và chuyển sang chế độ **TẮT (OFF)** để tận hưởng độ mượt thuần túy từ chip nhớ gốc.\n\n## 3. Khóa tần số quét màn hình ở mức 90Hz hoặc 120Hz cố định\n\nMàn hình tần số quét cao 144Hz hay 165Hz là điểm cộng lớn, nhưng rất ít tựa game hiện nay hỗ trợ thực tế vượt quá 120 FPS. Việc để màn hình chạy ở 144Hz trong khi game chỉ xuất hình 60 FPS sẽ khiến GPU phải làm việc gấp đôi để render khung hình đệm lặp lại, tiêu hao pin vô ích.\n\nHãy vào cài đặt hiển thị của trò chơi hoặc cài ứng dụng Game Booster để ghim cứng tần số quét màn hình đồng bộ với tốc độ FPS của game (ví dụ: Liên Quân Mobile khóa 60Hz/60FPS, PUBG Mobile khóa 90Hz/90FPS, Tốc Chiến khóa 120Hz/120FPS). Điều này giúp tiết kiệm tới 25% dung lượng pin trong mỗi buổi leo rank.\n\n![Giao diện tùy chỉnh thông số GPU và tần số quét thích ứng trên hệ điều hành smartphone chuyên game](https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&q=80)\n\n## 4. Tắt dịch vụ đồng bộ ngầm và quyền truy cập vị trí không cần thiết\n\nKhi bạn đang combat căng thẳng, nếu các ứng dụng như Facebook, TikTok hay Google Photos đột ngột kích hoạt sao lưu ảnh ngầm lên đám mây, băng thông mạng Wi-Fi và tài nguyên CPU sẽ bị chiếm dụng đột ngột khiến ping nhảy vọt từ 20ms lên 400ms.\n\nTrước khi vào game, hãy bật chế độ **Không làm phiền khi chơi game (Do Not Disturb)** và tạm thời tắt GPS Vị trí. Các kỹ thuật viên tại Bảo Công Studio khuyên bạn nên đưa các app mạng xã hội ít dùng vào danh sách **Ứng dụng ngủ sâu (Deep Sleep)** để đảm bảo chúng không bao giờ tự ý chạy ngầm.\n\n## 5. Bảng tổng hợp thiết lập tối ưu gaming đề xuất\n\n| Thiết lập cấu hình | Trạng thái khuyến nghị | Hiệu quả thực tế mang lại |\n|---|---|---|\n| **Bypass Charging (Sạc nhánh)** | BẬT (ON) khi cắm sạc chơi game | Giảm 4 - 6°C nhiệt độ máy, chống chai pin 100% |\n| **RAM Plus (RAM ảo)** | TẮT (OFF) hoàn toàn | Triệt tiêu hiện tượng khựng khung hình (Micro-stutter) |\n| **Tần số quét màn hình** | Cố định 90Hz hoặc 120Hz | Tiết kiệm 20% - 25% pin so với mức 144Hz |\n| **Độ sáng màn hình** | Cố định ở mức 65% - 75% | Giảm tải nhiệt độ tấm nền OLED, chống burn-in |\n| **Ứng dụng ngầm (Background Apps)** | Đưa vào danh sách Ngủ sâu | Giữ ổn định ping mạng Wi-Fi/4G dưới 30ms |\n\n> **LỜI KHUYÊN TỪ KỸ THUẬT VIÊN BẢO CÔNG STUDIO:**\n> Nếu thiết bị của bạn bị nóng nhanh sau 30 phút chơi game dù đã tối ưu phần mềm, hãy mang máy đến showroom Bảo Công Studio để được kiểm tra và thay keo tản nhiệt hoặc vệ sinh buồng hơi hoàn toàn miễn phí nhé!', 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1200&q=80', 'Bộ Phận Kỹ Thuật Bảo Công Studio', '6 phút đọc', 984, 16, 0, 1, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL),
(4, 'Chính sách Thu cũ đổi mới trợ giá lên đến 5 triệu đồng tại Bảo Công Studio', 'chinh-sach-thu-cu-doi-moi-tro-gia-len-den-5-trieu-dong', 'Khuyến mãi & Sự kiện', 4, 'Chương trình Trade-in lên đời Flagship 2026 với quy trình thẩm định 5 bước minh bạch, chấp nhận mọi tình trạng máy cũ và mức trợ giá độc quyền lên tới 5.000.000 VNĐ tiền mặt.', '> **ĐIỂM NHẤN NHANH TỪ BAN BIÊN TẬP (KEY TAKEAWAYS):**\n> - **Thu mua tất cả dòng máy:** Chấp nhận iPhone, Samsung, Xiaomi, iPad kể cả máy xách tay, trầy xước, chai pin hoặc hết bảo hành.\n> - **Định giá công khai trong 5 phút:** Ứng dụng phần mềm chẩn đoán chuyên dụng, thang điểm trừ lỗi minh bạch không ép giá.\n> - **Trợ giá kép lên đến 5 triệu đồng:** Cộng trực tiếp vào giá trị máy cũ khi lên đời iPhone 16 Series hoặc Galaxy S24 Ultra.\n> - **Trả góp 0% cho phần chênh lệch:** Không cần trả trước 1 đồng, nhận máy mới nguyên seal ngay sau khi ký hợp đồng.\n\n## 1. Tại sao chương trình Trade-in tại Bảo Công Studio được khách hàng tin chọn?\n\nNỗi lo lớn nhất của khách hàng khi đi bán lại máy cũ ở các cửa hàng thông thường là bị nhân viên \'vạch lá tìm sâu\', viện đủ lý do trầy xước viền hoặc pin 85% để ép giá xuống mức rẻ mạt. Thấu hiểu điều đó, Bảo Công Studio đã xây dựng bộ tiêu chuẩn thẩm định công khai minh bạch:\n\n- **Cam kết không ép giá:** Thang điểm hao mòn được công khai trực tiếp trên màn hình iPad trước mặt khách hàng.\n- **Không phân biệt xuất xứ:** Thu mua toàn bộ máy chính hãng VN/A lẫn máy xách tay Mỹ LL/A, Nhật J/A, Hàn Quốc KH/A.\n- **Hỗ trợ chuyển dữ liệu tận tình:** Kỹ thuật viên sao lưu 100% danh bạ, tin nhắn Zalo, hình ảnh sang máy mới an toàn và hỗ trợ khôi phục cài đặt gốc xóa sạch dữ liệu máy cũ chống rò rỉ thông tin cá nhân.\n\n![Khách hàng trải nghiệm quy trình kiểm tra và định giá máy thu cũ đổi mới tại showroom Bảo Công Studio](https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1200&q=80)\n\n## 2. Bảng khung mức trợ giá lên đời áp dụng tháng này\n\n| Dòng máy mới bạn muốn lên đời | Mức trợ giá thêm trên giá thu máy cũ | Quà tặng kèm theo khi Trade-in |\n|---|---|---|\n| **iPhone 16 Pro / 16 Pro Max** | Trợ giá trực tiếp **3.000.000 VNĐ** | Tặng củ sạc nhanh Apple 20W + Kính cường lực KingKong |\n| **Samsung Galaxy S24 Ultra / Z Fold6** | Trợ giá cực sốc **5.000.000 VNĐ** | Tặng gói bảo hành VIP 1 đổi 1 trong 12 tháng |\n| **Xiaomi 14 Ultra / Gaming Phones** | Trợ giá thêm **2.000.000 VNĐ** | Tặng sạc dự phòng Anker 65W High-Speed |\n| **iPad Pro M4 / Galaxy Tab S9 Ultra** | Trợ giá thêm **2.500.000 VNĐ** | Tặng bao da thông minh Smart Folio cao cấp |\n\n## 3. Quy trình 3 bước Thu cũ đổi mới siêu tốc trong 5 phút\n\n1. **Bước 1 - Định giá sơ bộ trực tuyến:** Khách hàng điền thông tin đời máy và tình trạng tại trang Hỗ trợ của website để nhận mức giá thu ước lượng trong 30 giây.\n2. **Bước 2 - Thẩm định chức năng tại Showroom:** Kỹ thuật viên kiểm tra màn hình cảm ứng, Face ID, camera và thời lượng pin bằng phần mềm đo chuyên sâu trong 5 phút.\n3. **Bước 3 - Bù trừ chênh lệch & Đập hộp máy mới:** Khách hàng thanh toán khoản tiền chênh lệch (hỗ trợ chuyển đổi trả góp 0% lãi suất qua 28 ngân hàng liên kết) và mang ngay chiếc Flagship nguyên seal về nhà!\n\n![Kỹ thuật viên hỗ trợ chuyển toàn bộ dữ liệu danh bạ và hình ảnh sang thiết bị mới cho khách hàng](https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=1200&q=80)\n\n> **THÔNG TIN LIÊN HỆ ĐỊNH GIÁ MÁY NHANH:**\n> Khách hàng có thể mang máy đến trực tiếp showroom Bảo Công Studio tại **123 Đường Ba Tháng Hai, Phường 11, Quận 10, TP.HCM** hoặc liên hệ hotline CSKH **1900 8888** để nhận báo giá ưu tiên ngay hôm nay!', 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1200&q=80', 'Phòng Marketing Bảo Công Studio', '5 phút đọc', 2300, 1, 0, 1, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL),
(5, 'Trên tay iPad Pro M4: Sức mạnh đồ họa đỉnh cao với màn hình Ultra Retina XDR Tandem OLED', 'tren-tay-ipad-pro-m4-suc-manh-do-hoa-dinh-cao', 'Tin tức công nghệ', 2, 'Mẫu máy tính bảng mỏng nhất lịch sử Apple với độ dày chỉ 5.1mm, sức mạnh xử lý trí tuệ nhân tạo từ con chip M4 tiến trình 3nm và tấm nền Tandem OLED 2 lớp sáng 1.600 nits đỉnh cao đồ họa.', '> **ĐIỂM NHẤN NHANH TỪ BAN BIÊN TẬP (KEY TAKEAWAYS):**\n> - **Độ mỏng kỷ lục 5.1mm:** Mỏng hơn cả một chiếc iPod Nano, khung nhôm tái chế 100% siêu cứng cáp.\n> - **Công nghệ Tandem OLED:** Ghép 2 tấm nền OLED xếp chồng lên nhau giúp đạt độ sáng toàn màn hình 1.000 nits và 1.600 nits khi xem HDR.\n> - **Vi xử lý Apple M4:** NPU 38 nghìn tỷ phép tính mỗi giây, tốc độ render Octane nhanh hơn gấp 4 lần so với iPad Pro M2.\n> - **Apple Pencil Pro mới:** Bổ sung cảm biến bóp (Squeeze), xoay thân bút (Barrel Roll) và phản hồi rung Haptic chân thực.\n\n## 1. Thiết kế siêu mỏng 5.1mm: Kiệt tác kỹ nghệ cơ khí của Apple\n\nCảm giác đầu tiên khi nhấc chiếc iPad Pro 11 inch M4 lên khỏi mặt bàn là sự ngỡ ngàng tột độ về độ mỏng và trọng lượng. Với độ dày chỉ đúng 5.1mm đối với bản 13 inch và 5.3mm đối với bản 11 inch, đây chính thức là thiết bị mỏng nhất mà Apple từng chế tạo trong toàn bộ lịch sử của mình.\n\nMặc dù mỏng đến khó tin, kết cấu khung vỏ nhôm của máy lại cực kỳ cứng cáp nhờ bộ khung sườn bằng kim loại gia cường bên trong bo mạch. Hệ thống tản nhiệt được cải tiến bằng việc chèn các lá đồng graphit xung quanh logo quả táo phía sau, giúp hiệu suất tản nhiệt tăng thêm 20% so với thế hệ M2.\n\n![Độ mỏng siêu thực chỉ 5.1mm của iPad Pro M4 khi đặt cạnh cây bút chì viết thông thường](https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=1200&q=80)\n\n## 2. Màn hình Ultra Retina XDR: Đột phá từ công nghệ Tandem OLED hai lớp\n\nTrước đây, nhược điểm lớn nhất của màn hình OLED truyền thống trên thiết bị kích thước lớn là khó đạt được độ sáng cao mà không làm giảm tuổi thọ điểm ảnh hữu cơ. Apple đã giải quyết bài toán hóc búa này bằng công nghệ **Tandem OLED** độc quyền: xếp chồng hai tấm nền OLED phát sáng lên nhau.\n\nKết quả là iPad Pro M4 đạt độ sáng toàn màn hình lên tới 1.000 nits ở mọi nội dung SDR/HDR thông thường và bùng nổ lên 1.600 nits ở các điểm sáng cực đại khi xem phim HDR. Độ tương phản đạt 2.000.000:1, sắc đen sâu tuyệt đối không có hiện tượng hở sáng viền (Blooming) như trên công nghệ Mini-LED cũ. Các nhà làm phim và họa sĩ kỹ thuật số giờ đây có một chiếc màn hình chuẩn tham chiếu màu sắc di động hoàn hảo nhất.\n\n![Tấm nền Tandem OLED tái hiện dải màu DCI-P3 chuẩn điện ảnh và độ tương phản đen sâu thẳm](https://images.unsplash.com/photo-1561154464-82e9adf32764?w=1200&q=80)\n\n## 3. Sức mạnh vượt thời đại của vi xử lý Apple M4 tiến trình 3nm thế hệ hai\n\nNhảy cóc thẳng từ thế hệ chip M2 lên M4 mà bỏ qua M3, Apple đã trang bị cho iPad Pro một con quái vật hiệu năng thực thụ. Được sản xuất trên tiến trình 3nm thế hệ thứ hai của TSMC, chip M4 sở hữu 10 nhân CPU (4 nhân hiệu năng cao + 6 nhân tiết kiệm điện) và 10 nhân GPU hỗ trợ công nghệ dò tia phần cứng (Hardware-accelerated Ray Tracing) và đổ bóng lưới (Mesh Shading).\n\nThử nghiệm dựng video 4K đa luồng ProRes trên ứng dụng Final Cut Pro cho iPad, thời gian render file nhanh hơn gấp 4 lần so với chip M2. Đặc biệt, bộ xử lý thần kinh NPU đạt tốc độ 38 TOPS, sẵn sàng cho các tính năng Apple Intelligence xử lý hình ảnh và văn bản tức thì.\n\n## 4. Bảng so sánh thông số giữa iPad Pro M4 và iPad Pro M2\n\n| Tiêu chí so sánh | iPad Pro M4 (2024 - 2026) | iPad Pro M2 (Thế hệ trước) |\n|---|---|---|\n| **Độ dày thân máy** | **5.1 mm** (Bản 13\") / **5.3 mm** (Bản 11\") | 6.4 mm (Bản 12.9\") / 5.9 mm (Bản 11\") |\n| **Công nghệ màn hình** | **Ultra Retina XDR Tandem OLED 2 lớp** | Liquid Retina XDR Mini-LED |\n| **Độ sáng đỉnh HDR** | **1.600 nits** (Độ sáng toàn màn hình 1.000 nits) | 1.600 nits (Toàn màn hình 600 nits) |\n| **Vi xử lý Chipset** | **Apple M4** (3nm gen 2, NPU 38 TOPS) | Apple M2 (5nm, NPU 15.8 TOPS) |\n| **Bút cảm ứng hỗ trợ** | **Apple Pencil Pro** (Squeeze, Haptic, Barrel Roll) | Apple Pencil 2 |\n\n> **TỔNG KẾT ĐÁNH GIÁ (VERDICT BOX): 9.8 / 10 ĐIỂM**\n> iPad Pro M4 là đỉnh cao công nghệ tablet hiện nay. Nếu bạn là kiến trúc sư, chuyên viên thiết kế đồ họa 3D, dựng phim hoặc người dùng tìm kiếm sự hoàn mỹ tuyệt đối, chiếc máy này hoàn toàn xứng đáng với mức đầu tư của bạn.', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=1200&q=80', 'Ban Biên Tập Bảo Công Studio', '7 phút đọc', 1650, 11, 0, 1, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL),
(6, 'Đánh giá camera OPPO Find X7 Ultra: Đỉnh cao nhiếp ảnh di động với 2 ống kính tiềm vọng', 'danh-gia-camera-oppo-find-x7-ultra', 'Đánh giá Flagship', 1, 'Chiếc smartphone đầu tiên trên thế giới trang bị hệ thống Dual-Periscope tele kép phối hợp cùng hệ màu danh tiếng Hasselblad, định nghĩa lại chuẩn mực chụp ảnh chân dung xóa phông cao cấp.', '> **ĐIỂM NHẤN NHANH TỪ BAN BIÊN TẬP (KEY TAKEAWAYS):**\n> - **Hệ thống camera Tele kép (Dual-Periscope):** Gồm 1 camera tiềm vọng 65mm (zoom 3x cảm biến 1/1.56 inch) và 1 camera tiềm vọng 135mm (zoom 6x cảm biến Sony IMX858).\n> - **Cảm biến chính 1 inch Sony LYT-900:** Khả năng thu sáng vượt trội và dải dynamic range 14 EV.\n> - **Chế độ màu Hasselblad Portrait:** Xóa phông quang học chuyển tiếp mềm mại, bóc tách sợi tóc và tái hiện tone da trắng hồng tự nhiên.\n\n## 1. Đột phá với 2 ống kính tiềm vọng tele trong cùng một thân máy\n\nCác thế hệ flagship trước đây luôn phải đánh đổi: nếu chọn tiêu cự zoom 3x thì chụp ảnh tầm xa 10x sẽ bị vỡ hạt, còn nếu chọn zoom 5x hoặc 10x thì chụp chân dung trong nhà ở khoảng cách 2 mét lại quá chật hẹp. OPPO đã giải quyết triệt để vấn đề này trên Find X7 Ultra bằng việc tích hợp cùng lúc **hai cụm camera tiềm vọng riêng biệt**:\n\n- Camera tele 3x (tiêu cự 65mm) sử dụng cảm biến lớn Sony IMX890 kích thước 1/1.56 inch chuyên trị thể loại ảnh chân dung đường phố và chụp đồ ăn.\n- Camera tele 6x (tiêu cự 135mm) sử dụng cảm biến Sony IMX858 chuyên dùng để săn ảnh phong cảnh xa, kiến trúc và cận cảnh chim muông.\n\n![Cụm camera tròn lấy cảm hứng từ mặt đồng hồ cơ cao cấp phối hợp cùng thương hiệu máy ảnh Hasselblad](https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=1200&q=80)\n\n## 2. Trải nghiệm chụp chân dung Hasselblad: Đỉnh cao tách bạch chủ thể\n\nKhi chuyển sang chế độ Chân dung (Portrait Mode), sự kết hợp giữa thuật toán OPPO HyperTone và bộ giả lập màu sắc Hasselblad mang lại những bức ảnh với bokeh xoay và bokeh bong bóng y hệt như chụp từ các ống kính huyền thoại Hasselblad XCD 80mm.\n\nTone da người được xử lý mịn màng nhưng vẫn giữ nguyên từng lỗ chân lông và sợi tóc mai tự nhiên. Độ chuyển tiếp giữa vùng nét và vùng mờ (DoF Falloff) diễn ra êm ái, không hề có hiện tượng viền áo bị cắt sắc nhọn giả tạo như các thuật toán xóa phông rẻ tiền khác.\n\n![Bức ảnh chân dung chụp từ ống kính tele 3x thể hiện bokeh quang học mịn màng và màu da người tự nhiên](https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&q=80)\n\n## 3. Bảng thông số cụm 4 camera 50MP trên OPPO Find X7 Ultra\n\n| Ống kính | Cảm biến sử dụng | Tiêu cự & Khẩu độ | Tính năng nổi bật |\n|---|---|---|---|\n| **Camera chính** | 50MP Sony LYT-900 (1 inch) | 23mm, f/1.8, OIS | Dải tương phản động 14 EV, quay video 4K Dolby Vision |\n| **Camera góc siêu rộng** | 50MP Sony LYT-600 (1/1.95\") | 14mm, f/2.0, AF | Chụp macro cận cảnh 3.5cm, góc nhìn rộng 123 độ |\n| **Camera Tele tiềm vọng 1** | 50MP Sony IMX890 (1/1.56\") | 65mm (3x), f/2.6, OIS | Cảm biến tele lớn nhất phân khúc, xóa phông chân dung |\n| **Camera Tele tiềm vọng 2** | 50MP Sony IMX858 (1/2.51\") | 135mm (6x), f/4.3, OIS | Tiêu cự viễn vọng, zoom lai chất lượng cao 120x |\n\n> **TỔNG KẾT ĐÁNH GIÁ (VERDICT BOX): 9.5 / 10 ĐIỂM**\n> OPPO Find X7 Ultra là chiếc smartphone có cụm camera tele toàn diện và thông minh nhất hiện nay. Máy mang lại trải nghiệm nhiếp ảnh sáng tạo không giới hạn từ cận cảnh đến siêu xa.', 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=1200&q=80', 'Ban Biên Tập Bảo Công Studio', '6 phút đọc', 1120, 8, 0, 1, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL),
(7, 'Hướng dẫn kiểm tra iPhone cũ Like New chuẩn 100% không lo dính máy dựng hay màn linh kiện', 'huong-dan-kiem-tra-iphone-cu-like-new-chuan-100', 'Mẹo & Thủ thuật', 3, 'Cẩm nang 7 bước kiểm tra phần cứng iPhone cũ từ kỹ thuật viên trưởng Bảo Công Studio: Test màn hình zin, kiểm tra áp suất chống nước, lịch sử linh kiện Apple và phát hiện máy câu SIM ghép ẩn.', '> **ĐIỂM NHẤN NHANH TỪ BAN BIÊN TẬP (KEY TAKEAWAYS):**\n> - **Kiểm tra ốc đít & khay SIM:** Phát hiện ngay máy đã từng bị cậy mở để thay linh kiện bên trong.\n> - **Test màn hình Zin & True Tone:** Cách phân biệt màn hình GX/OLED linh kiện rẻ tiền với màn hình nguyên bản Apple.\n> - **Check Lịch sử linh kiện (Parts & Service History):** Tận dụng tính năng phát hiện phần cứng có sẵn trong cài đặt iOS.\n> - **Kiểm tra iCloud ẩn và SIM ghép:** Đảm bảo máy quốc tế vĩnh viễn không bị khóa mạng bất ngờ sau khi reset dòng 2.\n\n## 1. Kiểm tra hình thức bên ngoài: Soi kỹ 2 ốc đáy và viền màn hình\n\nBước đầu tiên và quan trọng nhất khi cầm trên tay một chiếc iPhone cũ là quan sát hai con ốc sao ở cạnh cổng sạc dưới đáy máy. Trên một chiếc máy nguyên bản chưa qua sửa chữa, 2 con ốc này phải có màu sắc đồng nhất với khung viền, các cạnh khía sao sắc nét, không có vết toét đầu ren hoặc xước kim loại do tua vít cọ xát.\n\nTiếp theo, hãy vuốt nhẹ ngón tay quanh viền tiếp giáp giữa màn hình kính và khung thép/nhôm. Nếu màn hình zin, đường ráp sẽ khít rịt và liền mạch. Ngược lại, nếu máy đã bị ép kính hoặc thay màn lô, đường ron nhựa sẽ có cảm giác cấn tay, gợn sóng hoặc lộ vết keo dán lem nhem.\n\n![Kỹ thuật viên soi kính lúp kiểm tra độ nguyên bản của ốc sao cạnh đáy và khay sim trên iPhone](https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200&q=80)\n\n## 2. Kiểm tra màn hình cảm ứng, True Tone và điểm chết điểm sáng\n\nMàn hình là linh kiện đắt giá nhất trên một chiếc iPhone (chiếm tới 35% giá trị máy). Hãy thực hiện 3 bài test sau:\n\n1. **Test cảm ứng toàn diện:** Bấm giữ một biểu tượng icon ứng dụng trên màn hình chính cho rung lên, sau đó rê icon này di chuyển chậm rãi khắp mọi ngóc ngách, 4 cạnh viền và 4 góc màn hình. Nếu icon bị rớt giữa chừng ở bất kỳ điểm nào, màn hình đã bị đứt đường cảm ứng (liệt cảm ứng).\n2. **Kiểm tra True Tone:** Kéo thanh độ sáng ở Trung tâm điều khiển (Control Center), bấm giữ icon độ sáng và kiểm tra xem nút **True Tone** có bật tắt được không. Màn hình lô thay thế ngoài tiệm thường sẽ bị mất tính năng True Tone này.\n3. **Soi điểm chết:** Mở một bức ảnh màu trắng tuyền và màu đen tuyền toàn màn hình để kiểm tra xem có điểm đốm ố vàng, hở sáng hay đốm mực đen nào không.\n\n## 3. Khai thác mục \'Lịch sử linh kiện và dịch vụ\' trên hệ điều hành iOS\n\nTừ phiên bản iOS 15.2 trở lên, Apple đã cung cấp công cụ tự phát hiện linh kiện thay thế cực kỳ thông minh:\n\n- Truy cập **Cài đặt > Cài đặt chung > Giới thiệu (Settings > General > About)**.\n- Nếu màn hình, camera hoặc pin đã bị thay thế, hệ thống sẽ hiển thị mục **\'Lịch sử linh kiện và dịch vụ\'**.\n- Nếu thấy dòng chữ xanh *\\u0027Linh kiện chính hãng Apple (Genuine Apple Part)\\u0027*, bạn có thể an tâm. Nhưng nếu xuất hiện cảnh báo đỏ *\\u0027Linh kiện không xác định (Unknown Part)\\u0027*, điều đó chứng tỏ chiếc máy này đã bị tráo linh kiện rẻ tiền từ bên thứ ba.\n\n![Giao diện mục Cài đặt chung kiểm tra thông tin xuất xứ máy quốc tế và tình trạng linh kiện trên iOS](https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=1200&q=80)\n\n## 4. Kiểm tra iCloud ẩn và bắt buộc Reset dòng 2 tại chỗ\n\nRất nhiều trường hợp người mua ham rẻ dính phải máy dính iCloud ẩn (máy bị đánh cắp hoặc trả góp bùng tiền, bị thợ dùng phần mềm ẩn tài khoản iCloud tạm thời). Nếu mua về sử dụng một thời gian rồi khôi phục cài đặt gốc, máy sẽ bị khóa vĩnh viễn thành \'cục gạch\'.\n\nTrước khi giao tiền, bạn hãy yêu cầu người bán vào **Cài đặt > Cài đặt chung > Chuyển hoặc đặt lại iPhone > Xóa tất cả nội dung và cài đặt (Reset dòng 2)**. Sau khi máy khởi động lại về màn hình kích hoạt \'Hello\', bạn lắp thẻ SIM của mình vào và kích hoạt bình thường. Nếu máy vào được màn hình chính mà không đòi hỏi mật khẩu Apple ID cũ, chiếc máy đó hoàn toàn sạch sẽ!\n\n## 5. Bảng checklist 7 bước kiểm tra nhanh iPhone Like New\n\n| Bước kiểm tra | Chi tiết thao tác cần làm | Tiêu chuẩn máy Zin đạt yêu cầu |\n|---|---|---|\n| **1. Ốc đít & Khay SIM** | Soi 2 ốc sao và kiểm tra khay sim có trùng IMEI | Ốc sắc nét không toét, khay sim có gioăng cao su chống nước |\n| **2. Cảm ứng & True Tone** | Rê icon khắp 4 góc màn hình, bật tắt True Tone | Không rớt icon, màu màn hình ngả vàng dịu khi bật True Tone |\n| **3. Lịch sử linh kiện** | Cài đặt > Cài đặt chung > Giới thiệu | Không có cảnh báo đỏ \'Linh kiện không xác định\' |\n| **4. Face ID & Camera** | Quét khuôn mặt 3 vòng, quay video 4K cả 2 camera | Nhận diện khuôn mặt dưới 0.5s, video thu âm mic rõ ràng |\n| **5. Cảm biến tiệm cận & Loa** | Gọi thử 900, áp tay vào tai nghe xem màn hình tắt không | Màn hình tự tắt khi áp tai, loa trong và loa ngoài ấm rõ |\n| **6. Dung lượng Pin & Chu kỳ sạc** | Cài đặt > Pin > Tình trạng pin | Dung lượng tối đa từ 85% trở lên, không báo bảo trì |\n| **7. Reset dòng 2 tại chỗ** | Xóa tất cả nội dung và cài đặt | Kích hoạt vào màn hình chính bình thường, không dính iCloud |\n\n> **CAM KẾT CHẤT LƯỢNG TẠI BẢO CÔNG STUDIO:**\n> Mua iPhone Like New tại Bảo Công Studio, bạn được miễn trừ 100% mọi rủi ro với chính sách **Bảo hành 1 đổi 1 trong 12 tháng** và cam kết đền tiền gấp đôi nếu phát hiện máy đã qua sửa chữa thay vỏ!', 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=1200&q=80', 'Bộ Phận Kỹ Thuật Bảo Công Studio', '9 phút đọc', 3102, 3, 0, 1, 0, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL),
(8, 'Top 5 phụ kiện sạc nhanh GaN và tai nghe Bluetooth chống ồn đáng sở hữu nhất đầu năm 2026', 'top-5-phu-kien-sac-nhanh-gan-va-tai-nghe-bluetooth-chong-on', 'Tin tức công nghệ', 2, 'Tổng hợp danh sách các củ sạc công nghệ Gallium Nitride (GaN) siêu nhỏ gọn, cáp dù siêu bền bỉ và tai nghe chống ồn chủ động ANC được cộng đồng công nghệ bình chọn cao nhất.', '> **ĐIỂM NHẤN NHANH TỪ BAN BIÊN TẬP (KEY TAKEAWAYS):**\n> - **Công nghệ Gallium Nitride (GaN V):** Giúp củ sạc công suất 65W thu nhỏ chỉ bằng 1/3 kích thước củ sạc truyền thống, tỏa nhiệt cực thấp.\n> - **Cáp bọc dù Kevlar chống đứt gãy:** Chịu được hơn 30.000 lần uốn cong, hỗ trợ truyền tải điện năng Power Delivery 100W.\n> - **Tai nghe chống ồn ANC thích ứng:** Lọc sạch 98% tiếng ồn xe cộ ngoài phố, mang lại không gian làm việc tĩnh lặng đỉnh cao.\n\n## 1. Củ sạc nhanh Anker GaNPrime 65W 3 cổng: Một củ sạc cho mọi thiết bị\n\nThời kỳ bạn phải mang theo 3 củ sạc khác nhau cho laptop, iPad và điện thoại khi đi công tác đã chính thức khép lại. Nhờ ứng dụng vật liệu bán dẫn Gallium Nitride thế hệ mới, củ sạc Anker GaNPrime 65W sở hữu kích thước siêu nhỏ gọn chỉ tương đương một quả trứng gà nhưng lại có thể cung cấp đồng thời 2 cổng USB-C và 1 cổng USB-A.\n\nHệ thống điều phối nguồn thông minh PowerIQ 4.0 tự động phân bổ dòng sạc: khi bạn cắm sạc cho cả MacBook Air (45W) và iPhone (20W), củ sạc sẽ phân phối công suất tối ưu nhất để cả 2 thiết bị đều sạc nhanh mà thân củ sạc chỉ ấm nhẹ an toàn.\n\n![Củ sạc công nghệ GaN siêu nhỏ gọn với nhiều cổng kết nối sạc cùng lúc cho laptop và smartphone](https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=1200&q=80)\n\n## 2. Tai nghe Apple AirPods Pro 2 MagSafe USB-C: Chuẩn mực chống ồn chủ động\n\nAirPods Pro 2 phiên bản nâng cấp cổng sạc USB-C tiếp tục là chiếc tai nghe True Wireless toàn diện nhất cho người dùng hệ sinh thái Apple. Nhờ con chip H2 mạnh mẽ, tính năng Khử tiếng ồn chủ động (Active Noise Cancellation) có khả năng triệt tiêu tiếng ồn động cơ xe buýt, tiếng gõ bàn phím văn phòng gấp 2 lần so với thế hệ trước.\n\nĐặc biệt, tính năng **Âm thanh thích ứng (Adaptive Audio)** tự động hòa trộn giữa chế độ xuyên âm và chống ồn dựa trên môi trường xung quanh bạn. Khi bạn bắt đầu trò chuyện với người đối diện, tính năng **Nhận biết cuộc trò chuyện (Conversation Awareness)** sẽ tự động hạ nhỏ âm lượng nhạc và khuếch đại giọng nói của người đối diện cực kỳ tiện lợi.\n\n![Tai nghe chống ồn không dây AirPods Pro 2 với hộp sạc MagSafe chuẩn kết nối Type-C hiện đại](https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=1200&q=80)\n\n## 3. Sạc dự phòng Anker GaN 20.000mAh 65W tích hợp màn hình LCD thông minh\n\nNếu bạn là người thường xuyên di chuyển ngoài đường hoặc đi phượt, sạc dự phòng dung lượng 20.000mAh có công suất ra 65W là vật bất ly thân. Màn hình kỹ thuật số thông minh phía trước hiển thị chính xác % pin còn lại, công suất sạc vào/ra theo thời gian thực và thời gian dự kiến để sạc đầy. Dung lượng 20.000mAh đủ để sạc đầy iPhone 16 Pro Max khoảng 4 lần hoặc sạc đầy 1 chiếc MacBook Air một cách trọn vẹn.\n\n## 4. Bảng tổng hợp Top 5 phụ kiện công nghệ đáng mua nhất\n\n| Tên phụ kiện chính hãng | Công suất / Tính năng nổi bật | Mức giá niêm yết tại Bảo Công Studio |\n|---|---|---|\n| **Củ sạc Anker GaNPrime 65W (3 Cổng)** | Sạc nhanh 65W GaN, 2 Type-C + 1 USB-A, chân gập | 990.000 VNĐ |\n| **Tai nghe Apple AirPods Pro 2 USB-C** | Chip H2, Chống ồn ANC x2, Chuẩn kháng bụi IP54 | 5.290.000 VNĐ (Sale sốc) |\n| **Sạc dự phòng Anker GaN 20.000mAh 65W** | Màn hình LCD, sạc được cho cả laptop và máy tính bảng | 1.490.000 VNĐ |\n| **Cáp sạc Type-C to C Dù Siêu Bền 100W (2m)** | Bọc dù Kevlar chống rối, truyền tải 100W PD | 290.000 VNĐ |\n| **Củ sạc nhanh Apple 20W USB-C Chính Hãng** | Chuẩn sạc Power Delivery 20W cho iPhone và iPad | 490.000 VNĐ |\n\n> **ƯU ĐÃI KHI MUA KÈM SMARTPHONE TẠI BẢO CÔNG STUDIO:**\n> Khách hàng mua điện thoại hoặc máy tính bảng bất kỳ tại Bảo Công Studio sẽ được giảm giá thêm 20% cho toàn bộ phụ kiện sạc cáp và tai nghe trong danh sách trên!', 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=1200&q=80', 'Phòng Phụ Kiện Bảo Công Studio', '5 phút đọc', 890, 19, 0, 1, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `post_categories`
--

CREATE TABLE `post_categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `status` tinyint(4) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `post_categories`
--

INSERT INTO `post_categories` (`id`, `name`, `slug`, `description`, `sort_order`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Đánh giá Flagship', 'danh-gia-flagship', 'Đánh giá chi tiết, mổ xẻ phần cứng và trải nghiệm thực tế các dòng smartphone cao cấp đầu bảng.', 1, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(2, 'Tin tức công nghệ', 'tin-tuc-cong-nghe', 'Cập nhật tin tức công nghệ mới nhất, xu hướng AI di động và thông số rò rỉ các thế hệ thiết bị tiếp theo.', 2, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(3, 'Mẹo & Thủ thuật', 'meo-va-thu-thuat', 'Hướng dẫn tối ưu pin, cài đặt tính năng ẩn và các mẹo sử dụng smartphone mượt mà không nóng máy.', 3, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(4, 'Khuyến mãi & Sự kiện', 'khuyen-mai-va-su-kien', 'Chương trình trợ giá thu cũ đổi mới, flash sale phụ kiện chính hãng và các ưu đãi hấp dẫn.', 4, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `post_comments`
--

CREATE TABLE `post_comments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `post_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `author_name` varchar(255) NOT NULL,
  `author_email` varchar(255) DEFAULT NULL,
  `content` text NOT NULL,
  `admin_reply` text DEFAULT NULL,
  `is_visible` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `post_comments`
--

INSERT INTO `post_comments` (`id`, `post_id`, `user_id`, `author_name`, `author_email`, `content`, `admin_reply`, `is_visible`, `created_at`, `updated_at`) VALUES
(1, 1, 4, 'Trần Minh Hoàng', 'hoang.tm@gmail.com', 'Màn hình S24 Ultra chống chói ngoài trời thực sự quá ấn tượng, mình đã ra trải nghiệm tại showroom Bảo Công Studio và quyết định trade-in máy cũ lên luôn!', 'Cảm ơn bạn Hoàng đã tin tưởng ủng hộ Bảo Công Studio! Chúc bạn có những trải nghiệm tuyệt vời cùng cụm camera zoom 5x và hệ sinh thái Galaxy AI nhé.', 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(2, 1, NULL, 'Lê Thu Trang', 'thutrang.le@gmail.com', 'Tính năng dịch trực tiếp cuộc gọi bằng tiếng Việt có cần phải đăng ký gói cước hay trả phí hàng tháng không shop ơi?', 'Chào bạn Trang, tính năng Live Translate tiếng Việt được tích hợp sẵn miễn phí hoàn toàn trên Galaxy S24 Ultra và hoạt động độc lập ngay trên thiết bị mà không phát sinh thêm chi phí nào bạn nhé!', 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(3, 1, NULL, 'Nguyễn Quốc Cường', 'cuongnq.tech@gmail.com', 'Cho mình hỏi S24 Ultra bản 256GB tại showroom hiện còn sẵn những màu nào vậy ạ?', 'Chào bạn Cường, hiện showroom đang sẵn hàng đầy đủ 4 màu: Xám Titan, Đen Titan, Tím Titan và Vàng Titan bạn nhé. Mời bạn ghé showroom 123 Đường Ba Tháng Hai để trải nghiệm máy trực tiếp ạ.', 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(4, 2, 4, 'Phạm Văn Long', 'longpv@gmail.com', 'Bài so sánh rất công tâm và chi tiết! Cảm biến 1 inch của Leica chụp đêm công nhận có chất nghệ thuật riêng, nhưng quay video thì iPhone 16 Pro Max vẫn quá đỉnh.', 'Dạ đúng vậy anh Long, mỗi dòng máy đều có một thế mạnh riêng biệt phục vụ đúng nhu cầu của từng nhóm người dùng. Cảm ơn anh đã theo dõi chuyên mục bài viết của Bảo Công Studio ạ!', 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(5, 2, NULL, 'Vũ Đình Khang', 'khang.vd@gmail.com', 'Shop có nhận đặt trước Xiaomi 14 Ultra bản quốc tế không, giá đợt này thế nào ạ?', 'Chào bạn Khang, Xiaomi 14 Ultra bản 512GB Leica đang có sẵn tại showroom với mức giá 29.990.000đ kèm gói bảo hành VIP 12 tháng 1 đổi 1 bạn nhé!', 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(6, 3, NULL, 'Hoàng Gia Huy', 'huygaming99@gmail.com', 'Mẹo sạc nhánh Bypass Charging hiệu quả thực sự! Máy mình vừa cắm sạc chơi liên tục 2 tiếng mà nhiệt độ chỉ 38 độ, không còn bị tụt FPS như trước nữa.', 'Tuyệt vời quá bạn Huy ơi! Chúc bạn leo rank thần tốc và luôn giữ máy mát mẻ mượt mà nhé!', 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(7, 4, NULL, 'Đặng Thanh Tâm', 'thanhtam.dang@gmail.com', 'Mình có chiếc iPhone 13 Pro Max bị trầy xước viền thì mức thu cũ lên đời iPhone 16 Pro Max được trợ giá bao nhiêu vậy shop?', 'Chào bạn Tâm, iPhone 13 Pro Max sẽ được định giá minh bạch theo tình trạng thực tế và được cộng trực tiếp thêm 3.000.000đ trợ giá từ shop ạ. Bạn mang máy qua showroom để kỹ thuật viên kiểm tra báo giá chi tiết trong 5 phút nhé!', 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(8, 5, NULL, 'Nguyễn Bảo Ngọc', 'ngoc.nb@gmail.com', 'Màn hình Tandem OLED trên iPad Pro M4 đẹp mê hồn! Mình làm vẽ minh họa Digital Art thấy màu sắc chuẩn xác tuyệt đối, bút Apple Pencil Pro gõ nhẹ phản hồi rung rất đã tay.', 'Cảm ơn bạn Ngọc đã chia sẻ đánh giá thực tế từ góc nhìn chuyên gia hội họa! iPad Pro M4 thực sự là đỉnh cao cho anh em làm sáng tạo nghệ thuật.', 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `products`
--

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `sale_price` decimal(10,2) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `brand_id` bigint(20) UNSIGNED DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `status` tinyint(4) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `views` bigint(20) UNSIGNED NOT NULL DEFAULT 0,
  `featured` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `products`
--

INSERT INTO `products` (`id`, `name`, `slug`, `price`, `sale_price`, `description`, `image`, `category_id`, `brand_id`, `stock`, `status`, `created_at`, `updated_at`, `deleted_at`, `sku`, `views`, `featured`) VALUES
(1, 'iPhone 16 Pro Max 256GB', 'iphone-16-pro-max-256gb', 34990000.00, 33490000.00, 'iPhone 16 Pro Max với chip A18 Pro, nút điều khiển Camera Control đột phá, màn hình 6.9 inch siêu lớn, viền mỏng nhất lịch sử Apple.', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80', 1, 1, 24, 1, '2026-11-04 10:34:25', '2026-11-06 08:53:37', NULL, 'IP16PM-256', 0, 1),
(2, 'iPhone 16 Pro 128GB', 'iphone-16-pro-128gb', 28990000.00, NULL, 'iPhone 16 Pro kích thước 6.3 inch cầm vừa tay, khung viền titan siêu nhẹ cấp 5, camera tele 5x Tetraprism cao cấp.', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80', 1, 1, 30, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL, 'IP16P-128', 0, 1),
(3, 'iPhone 15 Pro Max 256GB', 'iphone-15-pro-max-256gb', 29990000.00, NULL, 'iPhone 15 Pro Max trang bị chip A17 Pro mạnh mẽ, camera zoom quang học 5x, thiết kế viền titan tự nhiên sang trọng.', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80', 1, 1, 14, 1, '2026-11-04 10:34:25', '2026-11-06 11:11:57', NULL, 'IP15PM-256', 0, 0),
(4, 'iPhone 15 128GB', 'iphone-15-128gb', 19990000.00, NULL, 'iPhone 15 sở hữu màn hình Dynamic Island thời thượng, cổng USB-C tiện lợi và camera chính 48MP sắc nét gấp 4 lần.', 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80', 1, 1, 40, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL, 'IP15-128', 0, 0),
(5, 'Samsung Galaxy S24 Ultra 256GB', 'samsung-galaxy-s24-ultra-256gb', 31990000.00, 28990000.00, 'Galaxy S24 Ultra trang bị quyền năng Galaxy AI đỉnh cao, bút S-Pen ghi chú tức thì, màn hình phẳng chống chói hàng đầu.', 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80', 1, 2, 20, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL, 'SS-S24U-256', 0, 1),
(6, 'Samsung Galaxy Z Fold6 256GB', 'samsung-galaxy-z-fold6-256gb', 43990000.00, 41490000.00, 'Galaxy Z Fold6 thiết kế siêu mỏng nhẹ, bản lề FlexHinge bền bỉ, màn hình trong 7.6 inch đa nhiệm mượt mà cùng Galaxy AI.', 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80', 1, 2, 10, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL, 'SS-ZFOLD6-256', 0, 1),
(7, 'Samsung Galaxy Z Flip6 256GB', 'samsung-galaxy-z-flip6-256gb', 28990000.00, NULL, 'Galaxy Z Flip6 gập hộp phấn nhỏ gọn sang trọng, màn hình ngoài Flex Window 3.4 inch độc đáo và camera 50MP cải tiến.', 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=600&auto=format&fit=crop&q=80', 1, 2, 18, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL, 'SS-ZFLIP6-256', 0, 0),
(8, 'OPPO Find X7 Ultra 256GB', 'oppo-find-x7-ultra-256gb', 26990000.00, NULL, 'OPPO Find X7 Ultra camera kép tiềm vọng đầu tiên trên thế giới kết hợp màu sắc điện ảnh Hasselblad và mặt lưng da cao cấp.', 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&auto=format&fit=crop&q=80', 1, 4, 15, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL, 'OP-FX7U-256', 0, 0),
(9, 'Vivo X100 Pro 256GB', 'vivo-x100-pro-256gb', 23990000.00, NULL, 'Vivo X100 Pro chuyên gia chụp đêm và chân dung với thấu kính ZEISS APO, chip xử lý hình ảnh Vivo V3 6nm hiệu năng cao.', 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600&auto=format&fit=crop&q=80', 1, 5, 22, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL, 'VV-X100P-256', 0, 0),
(10, 'OPPO Reno12 Pro 5G 256GB', 'oppo-reno12-pro-5g-256gb', 18990000.00, NULL, 'OPPO Reno12 Pro 5G thiết kế mỏng nhẹ dòng Reno thế hệ mới, tích hợp bộ công cụ nhiếp ảnh AI thông minh và sạc nhanh SuperVOOC 80W.', 'https://images.unsplash.com/photo-1575695342320-d2d2d2f9b73f?w=600&auto=format&fit=crop&q=80', 1, 4, 20, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL, 'OP-R12P-256', 0, 0),
(11, 'iPad Pro 11 inch M4 256GB Wi-Fi', 'ipad-pro-11-inch-m4-256gb-wi-fi', 28990000.00, 26990000.00, 'iPad Pro M4 mỏng kỷ lục 5.3mm, màn hình Ultra Retina XDR công nghệ Tandem OLED đột phá, chip M4 hiệu năng trí tuệ nhân tạo vượt trội.', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80', 2, 1, 18, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL, 'IPD-M4-256', 0, 1),
(12, 'iPad Air 11 inch M2 128GB Wi-Fi', 'ipad-air-11-inch-m2-128gb-wi-fi', 16990000.00, NULL, 'iPad Air trang bị chip M2 mạnh mẽ, hỗ trợ Apple Pencil Pro, màn hình Liquid Retina sắc nét đáp ứng toàn diện nhu cầu học tập và sáng tạo.', 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&auto=format&fit=crop&q=80', 2, 1, 25, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL, 'IPD-AIR-128', 0, 0),
(13, 'Samsung Galaxy Tab S9 Ultra 256GB', 'samsung-galaxy-tab-s9-ultra-256gb', 32990000.00, NULL, 'Galaxy Tab S9 Ultra màn hình Dynamic AMOLED 2X siêu khủng 14.6 inch, chuẩn kháng nước bụi IP68 và kèm sẵn bút S-Pen chuyên nghiệp.', 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=600&auto=format&fit=crop&q=80', 2, 2, 12, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL, 'SS-TABS9U-256', 0, 1),
(14, 'Xiaomi 14 Ultra 512GB Leica', 'xiaomi-14-ultra-512gb-leica', 29990000.00, NULL, 'Xiaomi 14 Ultra với cụm 4 camera Leica Summilux cảm biến 1 inch thế hệ mới, thấu kính quang học đỉnh cao cho chất ảnh sống động.', 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop&q=80', 3, 3, 12, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL, 'MI-14U-512', 0, 1),
(15, 'Xiaomi 14T Pro 256GB 120W', 'xiaomi-14t-pro-256gb-120w', 16990000.00, 15490000.00, 'Xiaomi 14T Pro chip Dimensity 9300+, sạc 120W siêu tốc trong 19 phút, màn hình CrystalRes 144Hz chuyên phục vụ game thủ.', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80', 3, 3, 35, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL, 'XM-14TP-256', 0, 0),
(16, 'Realme GT5 Pro 256GB Snapdragon 8 Gen 3', 'realme-gt5-pro-256gb-snapdragon-8-gen-3', 15990000.00, NULL, 'Realme GT5 Pro chiến binh gaming chip Snapdragon 8 Gen 3, tản nhiệt buồng hơi 12000mm² và pin trâu 5400mAh sạc 100W.', 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&auto=format&fit=crop&q=80', 3, 6, 28, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL, 'RM-GT5P-256', 0, 0),
(17, 'Tai nghe Apple AirPods Pro 2 MagSafe USB-C', 'tai-nghe-apple-airpods-pro-2-magsafe-usb-c', 5990000.00, 5290000.00, 'AirPods Pro 2 trang bị chip H2, khả năng chủ động khử tiếng ồn ANC gấp 2 lần, âm thanh thích ứng và hộp sạc chuẩn USB-C có loa định vị.', 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80', 4, 1, 50, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL, 'APP-PRO2-USBC', 0, 1),
(18, 'Củ sạc nhanh Apple 20W USB-C Chính Hãng', 'cu-sac-nhanh-apple-20w-usb-c-chinh-hang', 550000.00, 490000.00, 'Củ sạc chính hãng Apple công suất 20W công nghệ sạc nhanh PD, tương thích tối ưu cho toàn bộ dòng iPhone, iPad và Apple Watch.', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80', 4, 1, 80, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL, 'APP-20W-USBC', 0, 0),
(19, 'Sạc dự phòng Anker GaN 20.000mAh 65W High-Speed', 'sac-du-phong-anker-gan-20000mah-65w-high-speed', 1490000.00, NULL, 'Pin dự phòng dung lượng chuẩn 20.000mAh công suất sạc nhanh 65W chuẩn GaN, sạc cùng lúc 3 thiết bị và hỗ trợ sạc cả Laptop MacBook.', 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=600&auto=format&fit=crop&q=80', 4, 2, 35, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL, 'AK-PB-20K-65W', 0, 0),
(20, 'Cáp sạc Type-C to C Dù Siêu Bền 100W 2m', 'cap-sac-type-c-to-c-du-sieu-ben-100w-2m', 290000.00, NULL, 'Cáp bọc sợi dù Kevlar siêu bền bỉ chống đứt gãy, chiều dài 2 mét, hỗ trợ dòng truyền tải tối đa 100W và truyền dữ liệu tốc độ cao.', 'https://images.unsplash.com/photo-1509741102003-ca64bfe5f069?w=600&auto=format&fit=crop&q=80', 4, 3, 100, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL, 'CB-C2C-100W', 0, 0),
(21, 'IPhone 18 Pro Max', 'iphone-18-pro-max', 30000000.00, 25000000.00, 'Test', 'http://localhost:8000/uploads/images/1793981188_134243217794939906.jpg', 1, 1, 2, 1, '2026-11-06 09:07:42', '2026-11-06 09:12:43', '2026-11-06 09:12:43', NULL, 0, 0),
(22, 'test', 'test', 30000000.00, 28000000.00, 'test', 'http://localhost:8000/uploads/images/1793981618_134243217794939906.jpg', 1, 1, 2, 1, '2026-11-06 09:13:42', '2026-11-06 09:13:42', NULL, NULL, 0, 0);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `promotions`
--

CREATE TABLE `promotions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `discount_type` varchar(20) NOT NULL DEFAULT 'fixed',
  `discount_value` decimal(15,2) NOT NULL,
  `max_discount_amount` decimal(15,2) DEFAULT NULL,
  `min_order_value` decimal(15,2) NOT NULL DEFAULT 0.00,
  `usage_limit` int(11) NOT NULL DEFAULT 100,
  `used_count` int(11) NOT NULL DEFAULT 0,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `status` tinyint(4) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `promotions`
--

INSERT INTO `promotions` (`id`, `code`, `name`, `discount_type`, `discount_value`, `max_discount_amount`, `min_order_value`, `usage_limit`, `used_count`, `start_date`, `end_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 'BAOCONG500K', 'Giảm 500.000₫ cho Flagship cao cấp', 'fixed', 500000.00, 500000.00, 15000000.00, 100, 14, '2026-10-30 17:34:25', '2026-12-04 17:34:25', 1, '2026-11-04 10:34:25', '2026-11-06 11:11:56'),
(2, 'WELCOME10', 'Ưu đãi thành viên mới giảm 10% (Tối đa 1 triệu)', 'percent', 10.00, 1000000.00, 5000000.00, 200, 25, '2026-10-25 17:34:25', '2027-01-03 17:34:25', 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(3, 'VIP2026', 'Tri ân khách hàng VIP giảm trực tiếp 1.500.000₫', 'fixed', 1500000.00, 1500000.00, 25000000.00, 50, 8, '2026-11-02 17:34:25', '2026-12-19 17:34:25', 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(4, 'FREESHIP', 'Miễn phí vận chuyển toàn quốc cho đơn từ 500.000₫', 'fixed', 30000.00, 30000.00, 500000.00, 500, 110, '2026-10-20 17:34:25', '2027-02-02 17:34:25', 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `reviews`
--

CREATE TABLE `reviews` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `reviewer_name` varchar(255) NOT NULL,
  `reviewer_email` varchar(255) DEFAULT NULL,
  `rating` tinyint(4) NOT NULL DEFAULT 5,
  `comment` text NOT NULL,
  `admin_reply` text DEFAULT NULL,
  `status` tinyint(4) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `reviews`
--

INSERT INTO `reviews` (`id`, `product_id`, `user_id`, `reviewer_name`, `reviewer_email`, `rating`, `comment`, `admin_reply`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 4, 'Trần Hoàng Nam', 'nam.th@gmail.com', 5, 'Máy Titan Sa Mạc màu ngoài đời siêu đẹp! Nút Camera Control chụp ảnh rất tiện lợi, pin trâu dùng cả ngày xem phim lướt web không lo hết.', 'Bảo Công Mobile cảm ơn bạn Nam rất nhiều! Chúc bạn có những bức ảnh thật ưng ý cùng siêu phẩm iPhone 16 Pro Max ạ!', 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL),
(2, 1, NULL, 'Lê Thu Trang', 'trangle@gmail.com', 5, 'Đóng gói cực kỳ cẩn thận, nguyên seal chính hãng VN/A. Kích hoạt bảo hành điện tử chuẩn Apple. Shop giao hỏa tốc 2 tiếng rất uy tín!', 'Dạ shop cảm ơn chị Trang đã tin tưởng Bảo Công Mobile. Cần hỗ trợ phụ kiện cứ nhắn shop nhé chị!', 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL),
(3, 1, NULL, 'Ngô Gia Huy', 'huyngo.tech@gmail.com', 4, 'Hiệu năng A18 Pro quá khủng, chơi game nặng siêu mượt. Chỉ có điều máy hơi nặng một chút khi cầm 1 tay lúc nằm.', 'Cảm ơn phản hồi chi tiết của anh Huy ạ! Phiên bản Pro Max màn hình lớn 6.9 inch phục vụ giải trí đỉnh cao nên khung máy sẽ đầm tay hơn ạ.', 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL),
(4, 2, NULL, 'Phạm Văn Hùng', 'hung.pham@outlook.com', 5, 'Kích thước 6.3 inch cầm vừa vặn tay nhất từ trước đến nay. Màn hình ProMotion 120Hz mượt mà tuyệt đối.', 'Cảm ơn anh Hùng đã ủng hộ shop ạ!', 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL),
(5, 3, NULL, 'Vũ Minh Anh', 'minhanh.vu@gmail.com', 5, 'Màu hồng pastel xinh xỉu, loa ngoài nghe rất ấm và to. Giá khuyến mãi ở Bảo Công Mobile rẻ hơn các chuỗi khác gần 2 triệu.', NULL, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL),
(6, 5, 4, 'Trần Văn An', 'an.tran@gmail.com', 5, 'Bút S-Pen ký tài liệu với vẽ vời công việc cực đỉnh. Tính năng Galaxy AI khoanh vùng tìm kiếm và dịch trực tiếp cuộc gọi rất đáng giá.', 'Bảo Công Mobile cảm ơn anh An! Chúc anh làm việc hiệu quả và thành công cùng Galaxy S24 Ultra!', 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL),
(7, 5, NULL, 'Đinh Khắc Vinh', 'vinh.dinh@yahoo.com', 5, 'Màn hình chống chói Gorilla Armor đỉnh thật sự, ra nắng gắt xem văn bản rõ mồn một. Zoom 100x chụp mặt trăng nét căng.', NULL, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL),
(8, 6, NULL, 'Lâm Tuấn Kiệt', 'kiet.lam@gmail.com', 5, 'Bản lề gập khít hơn đời trước rất nhiều, màn hình ngoài gõ phím thoải mái không bị chật. Mở ra đa nhiệm 3 ứng dụng mượt mà.', 'Cảm ơn anh Kiệt! Gói bảo hiểm Samsung Care+ tặng kèm đã kích hoạt đầy đủ cho anh rồi ạ.', 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL),
(9, 7, NULL, 'Nguyễn Mai Phương', 'phuong.mai@gmail.com', 5, 'Gập lại bé tí nhét vừa túi xách nhỏ. FlexCam chụp ảnh tự sướng không cần gậy selfie rất tiện lợi!', NULL, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL),
(10, 15, NULL, 'Hoàng Đình Bách', 'bach.hd@gmail.com', 5, 'Ống kính Leica chụp tông màu chân dung rất có chiều sâu. Sạc nhanh 120W đúng 19 phút là đầy 100% pin, quá bá đạo!', 'Dạ cảm ơn anh Bách! Xiaomi 14T Pro là sự kết hợp tuyệt vời với Leica đó ạ.', 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL),
(11, 15, NULL, 'Phan Quốc Việt', 'viet.pq@gmail.com', 4, 'Chip Dimensity 9300+ mát mẻ, cân tốt mọi tựa game max cấu hình. Giá phân khúc cận cao cấp mà tính năng tiệm cận flagship.', NULL, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL),
(12, 10, NULL, 'Bùi Thị Hà', 'habui@gmail.com', 5, 'Máy nhỏ gọn mà camera Leica chụp xuất sắc, viền màn hình siêu mỏng nhìn rất tinh tế và hiện đại.', NULL, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL),
(13, 11, NULL, 'Đỗ Cẩm Ly', 'camly.do@gmail.com', 5, 'Màn hình ngoài dọc dùng được hầu hết các app như Zalo, Youtube, TikTok. Camera Hasselblad màu rất chuẩn.', 'Bảo Công Mobile cảm ơn bạn Ly nhiều ạ!', 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL),
(14, 16, NULL, 'Nguyễn Duy Mạnh', 'manh.nd@gmail.com', 5, 'Cấu hình Snapdragon 8 Gen 3 với camera tiềm vọng tele Sony IMX890 mà giá chỉ 14 triệu quá hời!', NULL, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL),
(15, 4, NULL, 'Trịnh Gia Huy', 'huytrinh.art@gmail.com', 5, 'Màn hình Tandem OLED hiển thị màu đen sâu thẳm, độ sáng rực rỡ. Dùng vẽ Apple Pencil Pro với Procreate cực kỳ chuẩn xác.', 'Dạ cảm ơn bạn Huy đã đánh giá, chúc bạn sáng tạo nhiều tác phẩm nghệ thuật tuyệt đẹp nhé!', 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL),
(16, 8, NULL, 'Lê Mỹ Duyên', 'duyen.le@gmail.com', 4, 'Tặng kèm sẵn bút S-Pen theo hộp nên tiết kiệm được một khoản, kháng nước IP68 dùng rất yên tâm.', NULL, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL),
(17, 2, NULL, 'Dương Hoàng Yến', 'hoangyen@gmail.com', 5, 'Nhân viên tư vấn nhiệt tình, có hỗ trợ trả góp 0% duyệt hồ sơ nhanh trong 10 phút. Đã dán màn hình miễn phí.', 'Dạ cảm ơn chị Yến! Rất hân hạnh được phục vụ chị trong những lần mua hàng tiếp theo ạ!', 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL),
(18, 6, NULL, 'Võ Quốc Bảo', 'baovo@gmail.com', 5, 'Giao diện One UI mượt mà, kết hợp phụ kiện ốp lưng bút S-Pen rất tiện cho công việc ký hợp đồng từ xa.', NULL, 1, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL),
(19, 3, 4, 'Khách Hàng Thân Thiết', 'user@gmail.com', 5, 'Máy chính hãng nguyên seal, giao hàng rất nhanh tại Bảo Công Studio!', NULL, 1, '2026-11-06 10:58:16', '2026-11-06 10:58:24', '2026-11-06 10:58:24'),
(20, 3, 4, 'Khách Hàng Thân Thiết', 'user@gmail.com', 5, 'Máy chính hãng nguyên seal, giao hàng rất nhanh tại Bảo Công Studio!', NULL, 1, '2026-11-06 11:11:54', '2026-11-06 11:12:01', '2026-11-06 11:12:01');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `settings`
--

CREATE TABLE `settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `site_name` varchar(255) NOT NULL DEFAULT 'Bảo Công Studio',
  `logo` varchar(500) DEFAULT NULL,
  `favicon` varchar(500) DEFAULT NULL,
  `hotline` varchar(50) NOT NULL DEFAULT '1900 8888',
  `email` varchar(100) NOT NULL DEFAULT 'cskh@baocongstudio.vn',
  `address` varchar(500) NOT NULL DEFAULT '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
  `working_hours` varchar(100) NOT NULL DEFAULT '8h00 - 21h30 (Thứ 2 - Chủ Nhật)',
  `facebook_url` varchar(500) DEFAULT NULL,
  `youtube_url` varchar(500) DEFAULT NULL,
  `zalo_url` varchar(500) DEFAULT NULL,
  `tiktok_url` varchar(500) DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `meta_keywords` varchar(500) DEFAULT NULL,
  `copyright_text` varchar(255) NOT NULL DEFAULT '© 2026 Bảo Công Studio. All rights reserved.',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `settings`
--

INSERT INTO `settings` (`id`, `site_name`, `logo`, `favicon`, `hotline`, `email`, `address`, `working_hours`, `facebook_url`, `youtube_url`, `zalo_url`, `tiktok_url`, `meta_title`, `meta_description`, `meta_keywords`, `copyright_text`, `created_at`, `updated_at`) VALUES
(1, 'Bảo Công Studio', '/images/logo.png', '/favicon.ico', '1900 8888', 'cskh@baocongstudio.vn', '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh', '8h00 - 21h30 (Thứ 2 - Chủ Nhật)', 'https://facebook.com/baocongstudio', 'https://youtube.com/@baocongstudio', 'https://zalo.me/19008888', 'https://tiktok.com/@baocongstudio', 'Bảo Công Studio - Hệ Thống Thiết Bị Di Động & Phụ Kiện Hàng Đầu', 'Hệ thống bán lẻ thiết bị di động, tablet & phụ kiện công nghệ chính hãng hàng đầu. Tiên phong trải nghiệm mua sắm thông minh và chính sách 1 đổi 1.', 'dien thoai, iphone, samsung, ipad, bao cong studio', '© 2026 Bảo Công Studio. All rights reserved.', '2026-11-04 10:34:25', '2026-11-04 10:34:25');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `stock_movements`
--

CREATE TABLE `stock_movements` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(50) NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `type` varchar(20) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_cost` decimal(15,2) NOT NULL DEFAULT 0.00,
  `stock_before` int(11) NOT NULL DEFAULT 0,
  `stock_after` int(11) NOT NULL DEFAULT 0,
  `supplier_or_reason` varchar(255) NOT NULL,
  `note` text DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `stock_movements`
--

INSERT INTO `stock_movements` (`id`, `code`, `product_id`, `type`, `quantity`, `unit_cost`, `stock_before`, `stock_after`, `supplier_or_reason`, `note`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'NK-20261001-A101', 1, 'import', 50, 30500000.00, 15, 65, 'Apple Việt Nam (Nhập khẩu chính ngạch)', 'Lô hàng máy màu Titan Sa Mạc và Titan Tự Nhiên đợt 1', 'Quản Trị Viên Bảo Công (admin)', '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(2, 'NK-20261005-B202', 5, 'import', 30, 24500000.00, 10, 40, 'Samsung Vina Electronics', 'Nhập bổ sung phiên bản 256GB màu Xám Titan phục vụ khuyến mãi', 'Quản Trị Viên Hệ Thống (admin)', '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(3, 'NK-20261010-C303', 3, 'import', 20, 23800000.00, 5, 25, 'FPT Synnex Distributor', 'Lô iPad màn hình Tandem OLED chính hãng', 'Quản Trị Viên Bảo Công (admin)', '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(4, 'XK-20261018-X001', 5, 'export', 2, 24500000.00, 40, 38, 'Xuất trả nhà cung cấp (Lỗi cấn móp vỏ hộp khi vận chuyển)', 'Đã lập biên bản bàn giao đơn vị vận chuyển Viettel Post', 'Quản Trị Viên Hệ Thống (admin)', '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(5, 'XK-20261022-X002', 8, 'export', 1, 750000.00, 35, 34, 'Xuất hủy hàng lỗi kỹ thuật linh kiện nguồn', 'Thiết bị cắm sạc chập chờn, bàn giao phòng bảo hành Anker tiêu hủy', 'Quản Trị Viên Bảo Công (admin)', '2026-11-04 10:34:25', '2026-11-04 10:34:25');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `support_tickets`
--

CREATE TABLE `support_tickets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `order_code` varchar(100) DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `admin_notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `support_tickets`
--

INSERT INTO `support_tickets` (`id`, `user_id`, `name`, `phone`, `email`, `order_code`, `subject`, `message`, `status`, `admin_notes`, `created_at`, `updated_at`) VALUES
(1, 4, 'Trần Văn An', '0912345678', 'an.tran@gmail.com', 'BC-20261002', 'Cần tư vấn chính sách Thu cũ đổi mới lên iPhone 16 Pro Max', 'Mình vừa mua chiếc Samsung S24 Ultra tại shop nhưng muốn đổi sang iPhone 16 Pro Max để đồng bộ với MacBook. Cho mình hỏi thủ tục thu cũ đổi mới và mức giá bù trừ hiện tại nhé.', 'processing', 'Đã phân công chuyên viên CSKH gọi điện hỗ trợ tư vấn chính sách đổi máy trong 30 ngày.', '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(2, NULL, 'Lê Hoàng Long', '0978901234', 'long.le@gmail.com', 'BC-20261004', 'Kiểm tra tình trạng vận chuyển đơn hàng hỏa tốc', 'Đơn hàng BC-20261004 của mình cần nhận gấp trong sáng mai để kịp đi công tác. Nhờ shop hỗ trợ hối bên bưu tá Viettel Post giúp mình.', 'resolved', 'Đã liên hệ trưởng bưu cục điều phối giao ưu tiên lúc 8h30 sáng.', '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(3, NULL, 'Nguyễn Thị Bích', '0934567890', 'bichnguyen@gmail.com', 'BC-20261003', 'Hỏi về gói bảo hành VIP rơi vỡ màn hình', 'Mình muốn hỏi thêm về quyền lợi gói bảo hành VIP 1 đổi 1 trong 12 tháng, nếu vô tình làm rơi nứt mặt kính lưng thì có được thay thế linh kiện Apple chính hãng không?', 'pending', NULL, '2026-11-04 10:34:25', '2026-11-04 10:34:25'),
(4, NULL, 'Đặng Quốc Khánh', '0909887766', 'khanh.dq@gmail.com', NULL, 'Tư vấn xuất hóa đơn VAT điện tử cho công ty', 'Công ty mình có nhu cầu đặt mua 5 máy iPad Pro M4 và xuất hóa đơn VAT điện tử cho doanh nghiệp. Vui lòng gửi báo giá chiết khấu số lượng lớn qua email khanh.dq@gmail.com giúp mình.', 'pending', NULL, '2026-11-04 10:34:25', '2026-11-04 10:34:25');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'customer',
  `status` tinyint(4) NOT NULL DEFAULT 1,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `avatar` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `phone`, `address`, `role`, `status`, `remember_token`, `created_at`, `updated_at`, `deleted_at`, `avatar`) VALUES
(1, 'Quản Trị Viên Bảo Công', 'admin@baocong.com', NULL, '$2y$12$szhKXtqbs3a1FuOO9q0EtuDhqCeligoQU13q3rfeUTH0twA86tUaK', '0988888888', '123 Đường Ba Tháng Hai, Phường 11, Quận 10, TP.HCM', 'admin', 1, NULL, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL, NULL),
(2, 'Quản Trị Viên Hệ Thống', 'admin@example.com', NULL, '$2y$12$OS5xvAlk2.GKqmw2NRlgLOk6j2Jh0k4.us/RH6oivDTOpZagY6QuG', '0977777777', '456 Đường Cách Mạng Tháng Tám, Quận 3, TP.HCM', 'admin', 1, NULL, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL, NULL),
(3, 'Đỗ Gia Bảo (Admin)', 'huydh6278@gmail.com', NULL, '$2y$12$RdezAihBYQ.s42mdeUsZIehNYYKQCkwSVlC.Bae9duvmm6S3GPIQy', '0966666666', 'TP. Hồ Chí Minh', 'admin', 1, NULL, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL, NULL),
(4, 'Khách Hàng Thân Thiết', 'user@gmail.com', NULL, '$2y$12$6t169jHXhLD9hPA2iVVsAeMW2BAJfSG7geJWt5XUVSgb/Gqbn63fq', '0901234567', 'Số 789 Đường Nguyễn Thị Minh Khai, Phường Bến Nghé, Quận 1, TP.HCM', 'customer', 1, NULL, '2026-11-04 10:34:25', '2026-11-04 10:34:25', NULL, NULL);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `banners`
--
ALTER TABLE `banners`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Chỉ mục cho bảng `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Chỉ mục cho bảng `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `carts_user_id_unique` (`user_id`);

--
-- Chỉ mục cho bảng `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cart_product_unique` (`cart_id`,`product_id`),
  ADD KEY `cart_items_product_id_foreign` (`product_id`);

--
-- Chỉ mục cho bảng `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Chỉ mục cho bảng `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Chỉ mục cho bảng `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `menus`
--
ALTER TABLE `menus`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `orders_order_code_unique` (`order_code`),
  ADD KEY `orders_user_id_foreign` (`user_id`);

--
-- Chỉ mục cho bảng `order_details`
--
ALTER TABLE `order_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_details_order_id_foreign` (`order_id`),
  ADD KEY `order_details_product_id_foreign` (`product_id`);

--
-- Chỉ mục cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_items_order_id_foreign` (`order_id`),
  ADD KEY `order_items_product_id_foreign` (`product_id`);

--
-- Chỉ mục cho bảng `order_status_histories`
--
ALTER TABLE `order_status_histories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_status_histories_order_id_foreign` (`order_id`);

--
-- Chỉ mục cho bảng `pages`
--
ALTER TABLE `pages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pages_slug_unique` (`slug`);

--
-- Chỉ mục cho bảng `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Chỉ mục cho bảng `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Chỉ mục cho bảng `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `posts_slug_unique` (`slug`),
  ADD KEY `posts_product_id_foreign` (`product_id`),
  ADD KEY `posts_post_category_id_foreign` (`post_category_id`);

--
-- Chỉ mục cho bảng `post_categories`
--
ALTER TABLE `post_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `post_categories_slug_unique` (`slug`);

--
-- Chỉ mục cho bảng `post_comments`
--
ALTER TABLE `post_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `post_comments_post_id_foreign` (`post_id`),
  ADD KEY `post_comments_user_id_foreign` (`user_id`);

--
-- Chỉ mục cho bảng `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `products_slug_unique` (`slug`),
  ADD KEY `products_category_id_foreign` (`category_id`),
  ADD KEY `products_brand_id_foreign` (`brand_id`);

--
-- Chỉ mục cho bảng `promotions`
--
ALTER TABLE `promotions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `promotions_code_unique` (`code`);

--
-- Chỉ mục cho bảng `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reviews_product_id_foreign` (`product_id`),
  ADD KEY `reviews_user_id_foreign` (`user_id`);

--
-- Chỉ mục cho bảng `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Chỉ mục cho bảng `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `stock_movements_code_unique` (`code`),
  ADD KEY `stock_movements_product_id_foreign` (`product_id`);

--
-- Chỉ mục cho bảng `support_tickets`
--
ALTER TABLE `support_tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `support_tickets_user_id_foreign` (`user_id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `banners`
--
ALTER TABLE `banners`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `brands`
--
ALTER TABLE `brands`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `carts`
--
ALTER TABLE `carts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `menus`
--
ALTER TABLE `menus`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT cho bảng `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT cho bảng `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `order_details`
--
ALTER TABLE `order_details`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT cho bảng `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `order_status_histories`
--
ALTER TABLE `order_status_histories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT cho bảng `pages`
--
ALTER TABLE `pages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT cho bảng `posts`
--
ALTER TABLE `posts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `post_categories`
--
ALTER TABLE `post_categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `post_comments`
--
ALTER TABLE `post_comments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT cho bảng `promotions`
--
ALTER TABLE `promotions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT cho bảng `settings`
--
ALTER TABLE `settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `stock_movements`
--
ALTER TABLE `stock_movements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `support_tickets`
--
ALTER TABLE `support_tickets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Ràng buộc đối với các bảng kết xuất
--

--
-- Ràng buộc cho bảng `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `carts_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ràng buộc cho bảng `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_cart_id_foreign` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Ràng buộc cho bảng `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ràng buộc cho bảng `order_details`
--
ALTER TABLE `order_details`
  ADD CONSTRAINT `order_details_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_details_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL;

--
-- Ràng buộc cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL;

--
-- Ràng buộc cho bảng `order_status_histories`
--
ALTER TABLE `order_status_histories`
  ADD CONSTRAINT `order_status_histories_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Ràng buộc cho bảng `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `posts_post_category_id_foreign` FOREIGN KEY (`post_category_id`) REFERENCES `post_categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `posts_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL;

--
-- Ràng buộc cho bảng `post_comments`
--
ALTER TABLE `post_comments`
  ADD CONSTRAINT `post_comments_post_id_foreign` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `post_comments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ràng buộc cho bảng `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_brand_id_foreign` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `products_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Ràng buộc cho bảng `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ràng buộc cho bảng `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD CONSTRAINT `stock_movements_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Ràng buộc cho bảng `support_tickets`
--
ALTER TABLE `support_tickets`
  ADD CONSTRAINT `support_tickets_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
