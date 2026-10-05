<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\ProductController;


// =========================
// API cho Danh mục
// =========================

Route::get('/categories', [CategoryController::class, 'index']);


// =========================
// API cho Thương hiệu
// =========================

Route::get('/brands', [BrandController::class, 'index']);
Route::get('/brands/{id}', [BrandController::class, 'show']);
Route::post('/brands', [BrandController::class, 'store']);
Route::put('/brands/{id}', [BrandController::class, 'update']);
Route::delete('/brands/{id}', [BrandController::class, 'destroy']);


// =========================
// API cho Sản phẩm
// =========================

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::post('/products', [ProductController::class, 'store']);
Route::put('/products/{id}', [ProductController::class, 'update']);
Route::delete('/products/{id}', [ProductController::class, 'destroy']);


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
});