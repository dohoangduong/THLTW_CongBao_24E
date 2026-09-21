<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController; // Gọi Controller bạn vừa tạo
use App\Http\Controllers\Api\BrandController;   // Gọi Controller bạn vừa tạo
// use App\Http\Controllers\Api\CategoryController; // (Có thể Công đã gọi sẵn)

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Tuyến đường có sẵn của hệ thống (lấy thông tin user)
Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

// ----------------------------------------------------
// PHẦN API BẠN VỪA LÀM
// ----------------------------------------------------

// API cho Products (Sản phẩm)
Route::get('/products', [ProductController::class, 'index']); // Lấy danh sách sản phẩm
Route::get('/products/{id}', [ProductController::class, 'show']); // Xem chi tiết 1 sản phẩm

// API cho Brands (Thương hiệu)
Route::get('/brands', [BrandController::class, 'index']); // Lấy danh sách thương hiệu
Route::get('/brands/{id}', [BrandController::class, 'show']); // Xem chi tiết 1 thương hiệu