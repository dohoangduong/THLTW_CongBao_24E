<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Đã cập nhật lại đúng đường dẫn Controller sau khi dọn dẹp cấu trúc
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\ProductController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// API cho Danh mục (Categories)
Route::get('/categories', [CategoryController::class, 'index']);

// API cho Thương hiệu (Brands)
Route::get('/brands', [BrandController::class, 'index']);
Route::get('/brands/{id}', [BrandController::class, 'show']);
Route::post('/brands', [BrandController::class, 'store']);
Route::put('/brands/{id}', [BrandController::class, 'update']);
Route::delete('/brands/{id}', [BrandController::class, 'destroy']);

// API cho Sản phẩm (Products)
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::post('/products', [ProductController::class, 'store']);
Route::put('/products/{id}', [ProductController::class, 'update']);
Route::delete('/products/{id}', [ProductController::class, 'destroy']);

// Tuyến đường có sẵn của hệ thống (lấy thông tin user)
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});