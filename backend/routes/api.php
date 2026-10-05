<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Controllers cho thư mục Admin
use App\Http\Controllers\Api\Admin\CategoryController;
use App\Http\Controllers\Api\Admin\BrandController;
use App\Http\Controllers\Api\Admin\ProductController;

// Controllers cho các chức năng chung (Khách hàng)
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// =========================================================
// 1. PUBLIC ROUTES (Không cần đăng nhập)
// =========================================================

// Đăng ký & Đăng nhập
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Danh mục (Categories)
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);

// Thương hiệu (Brands)
Route::get('/brands', [BrandController::class, 'index']);
Route::get('/brands/{id}', [BrandController::class, 'show']);

// Sản phẩm (Products)
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);


// =========================================================
// 2. PROTECTED ROUTES (Bắt buộc phải có Token đăng nhập)
// =========================================================
Route::middleware('auth:sanctum')->group(function () {

    // -----------------------------------------------------
    // API QUẢN TRỊ VIÊN (ADMIN) - Thêm/Sửa/Xóa
    // -----------------------------------------------------
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

    Route::post('/brands', [BrandController::class, 'store']);
    Route::put('/brands/{id}', [BrandController::class, 'update']);
    Route::delete('/brands/{id}', [BrandController::class, 'destroy']);

    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);


    // -----------------------------------------------------
    // API KHÁCH HÀNG / NGƯỜI DÙNG CƠ BẢN
    // -----------------------------------------------------
    
    // Quản lý tài khoản
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Quản lý Giỏ hàng (Cart)
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add', [CartController::class, 'add']);
    Route::put('/cart/{id}', [CartController::class, 'update']);
    Route::delete('/cart/{id}', [CartController::class, 'remove']);
    Route::delete('/cart', [CartController::class, 'clear']);

});