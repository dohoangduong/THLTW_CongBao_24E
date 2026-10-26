<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Controllers cho thư mục Admin (bản có sẵn của nhóm: xóa mềm, ẩn/hiện, khôi phục, upload ảnh)
use App\Http\Controllers\Api\Admin\BrandController;
use App\Http\Controllers\Api\Admin\CategoryController;
use App\Http\Controllers\Api\Admin\ProductController;

// Controllers quản trị dùng cho giao diện /admin (danh sách phân trang, tìm kiếm, thêm/sửa/xóa)
use App\Http\Controllers\Api\Admin\AdminBrandController;
use App\Http\Controllers\Api\Admin\AdminCategoryController;
use App\Http\Controllers\Api\Admin\AdminOrderController;
use App\Http\Controllers\Api\Admin\AdminProductController;
use App\Http\Controllers\Api\Admin\AdminUserController;

// Controllers cho khách hàng
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProfileController;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// =========================================================
// 1. PUBLIC ROUTES (Không cần đăng nhập)
// =========================================================

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Khách chỉ thấy mục đang hiển thị. Admin gọi kèm ?admin=1 (và Bearer token) để thấy tất cả.
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);

Route::get('/brands', [BrandController::class, 'index']);
Route::get('/brands/{id}', [BrandController::class, 'show']);

// Dữ liệu trang chủ: sản phẩm mới / đang giảm giá / nổi bật
Route::get('/home', [ProductController::class, 'home']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);


// =========================================================
// 2. PROTECTED ROUTES (Bắt buộc phải có Token đăng nhập)
// =========================================================
Route::middleware('auth:sanctum')->group(function () {

    // -----------------------------------------------------
    // API KHÁCH HÀNG / NGƯỜI DÙNG CƠ BẢN
    // -----------------------------------------------------

    // Quản lý tài khoản
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [ProfileController::class, 'update']);                       // Sửa thông tin cá nhân
    Route::put('/profile/password', [ProfileController::class, 'changePassword']);      // Đổi mật khẩu
    Route::post('/logout', [AuthController::class, 'logout']);

    // Quản lý Giỏ hàng (Cart)
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add', [CartController::class, 'add']);
    Route::put('/cart/{id}', [CartController::class, 'update']);
    Route::delete('/cart/{id}', [CartController::class, 'remove']);
    Route::delete('/cart', [CartController::class, 'clear']);

    // Đơn hàng của tôi
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);                          // Đặt hàng từ giỏ
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::put('/orders/{id}/cancel', [OrderController::class, 'cancel']);              // Tự hủy đơn đang chờ xác nhận
});


// =========================================================
// 3. ADMIN ROUTES (Phải đăng nhập VÀ có role = admin)
// =========================================================
Route::middleware(['auth:sanctum', 'admin'])->group(function () {

    // -----------------------------------------------------
    // Bản có sẵn của nhóm.
    // Lưu ý: sửa dữ liệu có upload ảnh -> frontend gửi POST kèm _method=PUT,
    // Laravel sẽ tự hiểu đó là request PUT.
    // -----------------------------------------------------

    // Danh mục
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::patch('/categories/{id}/toggle-status', [CategoryController::class, 'toggleStatus']);   // Ẩn / hiện
    Route::post('/categories/{id}/restore', [CategoryController::class, 'restore']);               // Khôi phục
    Route::delete('/categories/{id}/force', [CategoryController::class, 'forceDelete']);           // Xóa vĩnh viễn
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);                     // Xóa mềm

    // Thương hiệu
    Route::post('/brands', [BrandController::class, 'store']);
    Route::put('/brands/{id}', [BrandController::class, 'update']);
    Route::patch('/brands/{id}/toggle-status', [BrandController::class, 'toggleStatus']);
    Route::post('/brands/{id}/restore', [BrandController::class, 'restore']);
    Route::delete('/brands/{id}/force', [BrandController::class, 'forceDelete']);
    Route::delete('/brands/{id}', [BrandController::class, 'destroy']);

    // Sản phẩm
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::patch('/products/{id}/toggle-status', [ProductController::class, 'toggleStatus']);
    Route::post('/products/{id}/restore', [ProductController::class, 'restore']);
    Route::delete('/products/{id}/force', [ProductController::class, 'forceDelete']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    // -----------------------------------------------------
    // API cho giao diện quản trị Next.js (tiền tố /api/admin/...)
    // -----------------------------------------------------
    Route::prefix('admin')->group(function () {

        // Tổng quan + dữ liệu cho ô chọn
        Route::get('/stats', [AdminOrderController::class, 'stats']);
        Route::get('/options', [AdminProductController::class, 'options']);

        // Đơn hàng
        Route::get('/orders', [AdminOrderController::class, 'index']);
        Route::get('/orders/{id}', [AdminOrderController::class, 'show']);
        Route::put('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);

        // Người dùng
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::get('/users/{id}', [AdminUserController::class, 'show']);
        Route::put('/users/{id}', [AdminUserController::class, 'update']);
        Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);

        // Danh mục
        Route::get('/categories', [AdminCategoryController::class, 'index']);
        Route::post('/categories', [AdminCategoryController::class, 'store']);
        Route::put('/categories/{id}', [AdminCategoryController::class, 'update']);
        Route::delete('/categories/{id}', [AdminCategoryController::class, 'destroy']);

        // Thương hiệu
        Route::get('/brands', [AdminBrandController::class, 'index']);
        Route::post('/brands', [AdminBrandController::class, 'store']);
        Route::put('/brands/{id}', [AdminBrandController::class, 'update']);
        Route::delete('/brands/{id}', [AdminBrandController::class, 'destroy']);

        // Sản phẩm
        Route::get('/products', [AdminProductController::class, 'index']);
        Route::post('/products', [AdminProductController::class, 'store']);
        Route::put('/products/{id}', [AdminProductController::class, 'update']);
        Route::delete('/products/{id}', [AdminProductController::class, 'destroy']);
    });
});