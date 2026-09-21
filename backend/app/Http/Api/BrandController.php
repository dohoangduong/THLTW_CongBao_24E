<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class BrandController extends Controller
{
    /**
     * GET /api/brands - Danh sách thương hiệu đang hoạt động
     */
    public function index()
    {
        // Sử dụng scopeActive giống như CategoryController mẫu
        $brands = Brand::active()->orderBy('id', 'desc')->get();

        return response()->json(['data' => $brands]);
    }
    
    /**
     * GET /api/brands/{id} - Chi tiết 1 thương hiệu
     */
    public function show($id)
    {
        $brand = Brand::active()->findOrFail($id);
        
        return response()->json(['data' => $brand]);
    }
}