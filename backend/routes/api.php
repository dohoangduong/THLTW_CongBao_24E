<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Đã cập nhật lại đúng đường dẫn Controller trỏ vào thư mục Admin
use App\Http\Controllers\Api\Admin\CategoryController;
use App\Http\Controllers\Api\Admin\BrandController;
use App\Http\Controllers\Api\Admin\ProductController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// =========================================================
// 1. PUBLIC ROUTES (Khách hàng xem - Không cần đăng nhập)
// =========================================================

// Danh mục (Categories)
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']); // Bổ sung API xem chi tiết danh mục

// Thương hiệu (Brands)
Route::get('/brands', [BrandController::class, 'index']);
Route::get('/brands/{id}', [BrandController::class, 'show']);

// Sản phẩm (Products)
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);


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
    
});