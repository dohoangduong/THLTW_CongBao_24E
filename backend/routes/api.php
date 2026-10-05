<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

<<<<<<< HEAD
// Đã cập nhật lại đúng đường dẫn Controller trỏ vào thư mục Admin
use App\Http\Controllers\Api\Admin\CategoryController;
use App\Http\Controllers\Api\Admin\BrandController;
use App\Http\Controllers\Api\Admin\ProductController;
=======
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\ProductController;
>>>>>>> 5ff29a6484c7071cbe24d89411339c5ed930805e


<<<<<<< HEAD
// =========================================================
// 1. PUBLIC ROUTES (Khách hàng xem - Không cần đăng nhập)
// =========================================================

// Danh mục (Categories)
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']); // Bổ sung API xem chi tiết danh mục

// Thương hiệu (Brands)
=======
// =========================
// API cho Danh mục
// =========================

Route::get('/categories', [CategoryController::class, 'index']);


// =========================
// API cho Thương hiệu
// =========================

>>>>>>> 5ff29a6484c7071cbe24d89411339c5ed930805e
Route::get('/brands', [BrandController::class, 'index']);
Route::get('/brands/{id}', [BrandController::class, 'show']);

<<<<<<< HEAD
// Sản phẩm (Products)
=======

// =========================
// API cho Sản phẩm
// =========================

>>>>>>> 5ff29a6484c7071cbe24d89411339c5ed930805e
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);


<<<<<<< HEAD
// =========================================================
// 2. ADMIN ROUTES (Bắt buộc phải có Token đăng nhập)
// =========================================================
Route::middleware('auth:sanctum')->group(function () {
    
    // Thêm, Sửa, Xóa - Danh mục
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

    // Thêm, Sửa, Xóa - Thương hiệu
    Route::post('/brands', [BrandController::class, 'store']);
    Route::put('/brands/{id}', [BrandController::class, 'update']);
    Route::delete('/brands/{id}', [BrandController::class, 'destroy']);

    // Thêm, Sửa, Xóa - Sản phẩm
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    // Tuyến đường có sẵn của hệ thống (lấy thông tin user)
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
=======
// =========================
// Đăng ký & Đăng nhập
// =========================

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);


// =========================
// API yêu cầu đăng nhập
// =========================

Route::middleware('auth:sanctum')->group(function () {

    // Thông tin user hiện tại
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Đăng xuất
    Route::post('/logout', [AuthController::class, 'logout']);

    // Profile
    Route::get('/profile', [AuthController::class, 'profile']);


    // =========================
    // Giỏ hàng
    // =========================

    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add', [CartController::class, 'add']);
    Route::put('/cart/{id}', [CartController::class, 'update']);
    Route::delete('/cart/{id}', [CartController::class, 'remove']);
    Route::delete('/cart', [CartController::class, 'clear']);
>>>>>>> 5ff29a6484c7071cbe24d89411339c5ed930805e
});