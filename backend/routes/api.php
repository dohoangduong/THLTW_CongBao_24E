<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Controllers cho thư mục Admin (Danh mục, Thương hiệu, Sản phẩm)
use App\Http\Controllers\Api\Admin\CategoryController;
use App\Http\Controllers\Api\Admin\BrandController;
use App\Http\Controllers\Api\Admin\ProductController;

// Controllers quản trị Đơn hàng và Người dùng
use App\Http\Controllers\Api\Admin\AdminOrderController;
use App\Http\Controllers\Api\Admin\AdminUserController;

// Controllers cho khách hàng & người dùng thông thường
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProfileController;

/*
|--------------------------------------------------------------------------
| API Routes - Website Bán Điện Thoại Bảo Công Mobile
|--------------------------------------------------------------------------
*/

// =========================================================
// 1. PUBLIC ROUTES (Không cần đăng nhập)
// =========================================================

// Đăng ký & Đăng nhập
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

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
    Route::delete('/admin/users/{id}', [AdminUserController::class, 'destroy']);
});