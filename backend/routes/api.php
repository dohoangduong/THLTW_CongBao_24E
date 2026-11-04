<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Controllers cho thư mục Admin (Danh mục, Thương hiệu, Sản phẩm)
use App\Http\Controllers\Api\Admin\CategoryController;
use App\Http\Controllers\Api\Admin\BrandController;
use App\Http\Controllers\Api\Admin\ProductController;

// Controllers quản trị Đơn hàng, Người dùng, Đánh giá, Hỗ trợ, Bài viết
use App\Http\Controllers\Api\Admin\AdminOrderController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\Admin\AdminReviewController;
use App\Http\Controllers\Api\Admin\AdminSupportTicketController;
use App\Http\Controllers\Api\Admin\AdminPostController;
use App\Http\Controllers\Api\Admin\AdminPostCommentController;

// Các controllers mở rộng mới: Cấu hình, Banner, Menu, Trang đơn, Chủ đề bài viết, Khuyến mãi, Kho hàng
use App\Http\Controllers\Api\Admin\AdminSettingController;
use App\Http\Controllers\Api\Admin\AdminBannerController;
use App\Http\Controllers\Api\Admin\AdminMenuController;
use App\Http\Controllers\Api\Admin\AdminPageController;
use App\Http\Controllers\Api\Admin\AdminPostCategoryController;
use App\Http\Controllers\Api\Admin\AdminPromotionController;
use App\Http\Controllers\Api\Admin\AdminStockController;

// Controllers cho khách hàng & người dùng thông thường
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\SupportTicketController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\UploadController;

/*
|--------------------------------------------------------------------------
| API Routes - Website Bán Điện Thoại Bảo Công Mobile
|--------------------------------------------------------------------------
*/

// =========================================================
// 1. PUBLIC ROUTES (Không cần đăng nhập)
// =========================================================

// Đăng ký, Đăng nhập & Quên mật khẩu
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);

// Cấu hình thông tin Website (FUNC-ADM-CONFIG-01)
Route::get('/settings', [AdminSettingController::class, 'getSettings']);

// Banner trang chủ (FUNC-ADM-BANNER-01..04)
Route::get('/banners', [AdminBannerController::class, 'publicBanners']);

// Menu điều hướng Header & Footer (FUNC-ADM-MENU-01..04)
Route::get('/menus', [AdminMenuController::class, 'publicMenus']);

// Trang đơn / Trang tĩnh (FUNC-PAGE-U-01)
Route::get('/pages', [AdminPageController::class, 'publicPages']);
Route::get('/pages/{slug}', [AdminPageController::class, 'publicPage']);

// Chủ đề bài viết (FUNC-ADM-PCAT-01..04)
Route::get('/post-categories', [AdminPostCategoryController::class, 'publicCategories']);

// Khuyến mãi / Mã giảm giá (FUNC-ADM-PROMO-01..04 & FUNC-ORDER-02)
Route::get('/promotions', [AdminPromotionController::class, 'publicPromotions']);
Route::post('/promotions/apply', [AdminPromotionController::class, 'applyPromotion']);

// Danh mục (Categories)
Route::get('/categories/trash', [CategoryController::class, 'trash']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);

// Thương hiệu (Brands)
Route::get('/brands/trash', [BrandController::class, 'trash']);
Route::get('/brands', [BrandController::class, 'index']);
Route::get('/brands/{id}', [BrandController::class, 'show']);

// Sản phẩm (Products)
Route::get('/products/trash', [ProductController::class, 'trash']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::post('/products/{id}/reviews', [ProductController::class, 'storeReview']);

// Hỗ trợ & Liên hệ (Support Tickets & Contacts)
Route::post('/support-tickets', [SupportTicketController::class, 'store']);
Route::post('/contacts', [SupportTicketController::class, 'store']);

// Bài viết công nghệ (Posts & Thảo luận người dùng)
Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/{id}', [PostController::class, 'show']);
Route::post('/posts/{id}/comments', [PostController::class, 'storeComment']);

// Tải ảnh trực tiếp từ máy tính lên Server (PNG, JPG/JPEG <= 10MB)
Route::post('/upload-image', [UploadController::class, 'uploadImage']);
Route::post('/admin/upload-image', [UploadController::class, 'uploadImage']);


// =========================================================
// 2. PROTECTED ROUTES - Khách hàng & Người dùng thông thường
// =========================================================
Route::middleware('auth:sanctum')->group(function () {

    // Quản lý tài khoản cá nhân
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'changePassword']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Giỏ hàng (Cart)
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add', [CartController::class, 'add']);
    Route::put('/cart/{id}', [CartController::class, 'update']);
    Route::delete('/cart/{id}', [CartController::class, 'remove']);
    Route::delete('/cart', [CartController::class, 'clear']);

    // Đơn hàng của khách hàng (Orders)
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::put('/orders/{id}/cancel', [OrderController::class, 'cancel']);
});


// =========================================================
// 3. STAFF & ADMIN ROUTES (Nhân viên: Admin hoặc Manager)
// =========================================================
Route::middleware(['auth:sanctum', 'staff'])->group(function () {

    // Cấu hình website
    Route::get('/admin/settings', [AdminSettingController::class, 'getSettings']);
    Route::put('/admin/settings', [AdminSettingController::class, 'updateSettings']);

    // Quản lý Banners
    Route::get('/admin/banners', [AdminBannerController::class, 'index']);
    Route::post('/admin/banners', [AdminBannerController::class, 'store']);
    Route::get('/admin/banners/{id}', [AdminBannerController::class, 'show']);
    Route::put('/admin/banners/{id}', [AdminBannerController::class, 'update']);
    Route::delete('/admin/banners/{id}', [AdminBannerController::class, 'destroy']);

    // Quản lý Menus
    Route::get('/admin/menus', [AdminMenuController::class, 'index']);
    Route::post('/admin/menus', [AdminMenuController::class, 'store']);
    Route::get('/admin/menus/{id}', [AdminMenuController::class, 'show']);
    Route::put('/admin/menus/{id}', [AdminMenuController::class, 'update']);
    Route::delete('/admin/menus/{id}', [AdminMenuController::class, 'destroy']);

    // Quản lý Trang đơn (Pages)
    Route::get('/admin/pages', [AdminPageController::class, 'index']);
    Route::post('/admin/pages', [AdminPageController::class, 'store']);
    Route::get('/admin/pages/{id}', [AdminPageController::class, 'show']);
    Route::put('/admin/pages/{id}', [AdminPageController::class, 'update']);
    Route::delete('/admin/pages/{id}', [AdminPageController::class, 'destroy']);

    // Quản lý Chủ đề bài viết (Post Categories)
    Route::get('/admin/post-categories', [AdminPostCategoryController::class, 'index']);
    Route::post('/admin/post-categories', [AdminPostCategoryController::class, 'store']);
    Route::get('/admin/post-categories/{id}', [AdminPostCategoryController::class, 'show']);
    Route::put('/admin/post-categories/{id}', [AdminPostCategoryController::class, 'update']);
    Route::delete('/admin/post-categories/{id}', [AdminPostCategoryController::class, 'destroy']);

    // Quản lý Mã khuyến mãi (Promotions / Coupons)
    Route::get('/admin/promotions', [AdminPromotionController::class, 'index']);
    Route::post('/admin/promotions', [AdminPromotionController::class, 'store']);
    Route::get('/admin/promotions/{id}', [AdminPromotionController::class, 'show']);
    Route::put('/admin/promotions/{id}', [AdminPromotionController::class, 'update']);
    Route::delete('/admin/promotions/{id}', [AdminPromotionController::class, 'destroy']);

    // Quản lý Kho hàng (Stock Management)
    Route::get('/admin/stock/stats', [AdminStockController::class, 'stats']);
    Route::get('/admin/stock/movements', [AdminStockController::class, 'movements']);
    Route::get('/admin/stock/inventory', [AdminStockController::class, 'inventory']);
    Route::post('/admin/stock/import', [AdminStockController::class, 'storeImport']);
    Route::post('/admin/stock/export', [AdminStockController::class, 'storeExport']);

    // Danh mục
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);
    Route::put('/categories/{id}/restore', [CategoryController::class, 'restore']);
    Route::delete('/categories/{id}/force-delete', [CategoryController::class, 'forceDelete']);

    // Thương hiệu
    Route::post('/brands', [BrandController::class, 'store']);
    Route::put('/brands/{id}', [BrandController::class, 'update']);
    Route::delete('/brands/{id}', [BrandController::class, 'destroy']);
    Route::put('/brands/{id}/restore', [BrandController::class, 'restore']);
    Route::delete('/brands/{id}/force-delete', [BrandController::class, 'forceDelete']);

    // Sản phẩm
    Route::post('/products', [ProductController::class, 'store']);
    Route::match(['put', 'post'], '/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    Route::put('/products/{id}/restore', [ProductController::class, 'restore']);
    Route::delete('/products/{id}/force-delete', [ProductController::class, 'forceDelete']);

    // -----------------------------------------------------
    // Quản lý Đơn hàng (Cả Admin và Manager đều có quyền)
    // -----------------------------------------------------
    Route::get('/admin/stats', [AdminOrderController::class, 'stats']);

    Route::get('/admin/orders/trash', [AdminOrderController::class, 'trash']);
    Route::post('/admin/orders/{id}/restore', [AdminOrderController::class, 'restore']);
    Route::delete('/admin/orders/{id}/force', [AdminOrderController::class, 'forceDelete']);

    Route::get('/admin/orders', [AdminOrderController::class, 'index']);
    Route::get('/admin/orders/{id}', [AdminOrderController::class, 'show']);
    Route::put('/admin/orders/{id}', [AdminOrderController::class, 'update']);
    Route::put('/admin/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);
    Route::delete('/admin/orders/{id}', [AdminOrderController::class, 'destroy']);

    // -----------------------------------------------------
    // Quản lý Đánh giá sản phẩm (Reviews)
    // -----------------------------------------------------
    Route::get('/admin/reviews', [AdminReviewController::class, 'index']);
    Route::put('/admin/reviews/{id}/status', [AdminReviewController::class, 'updateStatus']);
    Route::put('/admin/reviews/{id}/reply', [AdminReviewController::class, 'reply']);
    Route::delete('/admin/reviews/{id}', [AdminReviewController::class, 'destroy']);

    // -----------------------------------------------------
    // Quản lý Phiếu hỗ trợ khách hàng (Support Tickets)
    // -----------------------------------------------------
    Route::get('/admin/support-tickets', [AdminSupportTicketController::class, 'index']);
    Route::put('/admin/support-tickets/{id}', [AdminSupportTicketController::class, 'update']);
    Route::put('/admin/support-tickets/{id}/status', [AdminSupportTicketController::class, 'updateStatus']);
    Route::delete('/admin/support-tickets/{id}', [AdminSupportTicketController::class, 'destroy']);

    // -----------------------------------------------------
    // Quản lý Bài viết công nghệ (Admin Posts)
    // -----------------------------------------------------
    Route::get('/admin/posts/stats', [AdminPostController::class, 'stats']);
    Route::get('/admin/posts', [AdminPostController::class, 'index']);
    Route::post('/admin/posts', [AdminPostController::class, 'store']);
    Route::get('/admin/posts/{id}', [AdminPostController::class, 'show']);
    Route::put('/admin/posts/{id}', [AdminPostController::class, 'update']);
    Route::delete('/admin/posts/{id}', [AdminPostController::class, 'destroy']);
    Route::put('/admin/posts/{id}/toggle-visibility', [AdminPostController::class, 'toggleVisibility']);
    Route::put('/admin/posts/{id}/toggle-featured', [AdminPostController::class, 'toggleFeatured']);
    Route::put('/admin/posts/{id}/toggle-comments', [AdminPostController::class, 'toggleComments']);

    // -----------------------------------------------------
    // Quản lý Thảo luận bài viết (Admin Post Comments)
    // -----------------------------------------------------
    Route::get('/admin/post-comments/stats', [AdminPostCommentController::class, 'stats']);
    Route::get('/admin/post-comments', [AdminPostCommentController::class, 'index']);
    Route::put('/admin/post-comments/{id}/reply', [AdminPostCommentController::class, 'reply']);
    Route::put('/admin/post-comments/{id}/toggle-visibility', [AdminPostCommentController::class, 'toggleVisibility']);
    Route::delete('/admin/post-comments/{id}', [AdminPostCommentController::class, 'destroy']);
});


// =========================================================
// 4. ADMIN-ONLY ROUTES (Chỉ Quản trị viên Super Admin)
// Manager tuyệt đối KHÔNG ĐƯỢC PHÉP can thiệp vào Users!
// =========================================================
Route::middleware(['auth:sanctum', 'admin'])->group(function () {

    // Quản lý Người dùng (Users Module)
    Route::get('/admin/users/trash', [AdminUserController::class, 'trash']);
    Route::post('/admin/users/{id}/restore', [AdminUserController::class, 'restore']);
    Route::delete('/admin/users/{id}/force', [AdminUserController::class, 'forceDelete']);

    Route::get('/admin/users', [AdminUserController::class, 'index']);
    Route::post('/admin/users', [AdminUserController::class, 'store']);
    Route::get('/admin/users/{id}', [AdminUserController::class, 'show']);
    Route::put('/admin/users/{id}', [AdminUserController::class, 'update']);
    Route::put('/admin/users/{id}/toggle-status', [AdminUserController::class, 'toggleStatus']);
    Route::delete('/admin/users/{id}', [AdminUserController::class, 'destroy']);
});
