<?php

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
Route::get('/products/{id}', [ProductController::class, 'show']); // Xem chi tiết 1 sản phẩm