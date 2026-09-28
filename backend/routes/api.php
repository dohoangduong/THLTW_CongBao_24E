<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\AuthController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// API cho Danh mục (Categories)
Route::get('/categories', [CategoryController::class, 'index']);

// Tuyến đường có sẵn của hệ thống (lấy thông tin user)
// Tuyến đường có sẵn của hệ thống (lấy thông tin user)
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Routes bảo vệ (Phải truyền Token `Bearer <token>` ở Header)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    });