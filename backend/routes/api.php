<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Api\CategoryController;
use App\Http\Api\BrandController;
use App\Http\Api\ProductController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// API cho Danh mục (Categories)
Route::get('/categories', [CategoryController::class, 'index']);

// API cho Thương hiệu (Brands)
Route::get('/brands', [BrandController::class, 'index']);

// API cho Sản phẩm (Products)
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

// Tuyến đường có sẵn của hệ thống (lấy thông tin user)
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});