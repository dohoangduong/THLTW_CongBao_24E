<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    /**
     * GET /api/products - Danh sách sản phẩm (có kèm danh mục và thương hiệu)
     */
    public function index(): AnonymousResourceCollection
    {
        // Tạm thời trả về JSON thô để test trước, sau này sẽ dùng ProductResource như CategoryResource
        $products = Product::where('status', 1)
            ->with(['category', 'brand']) // Lấy thông tin từ các bảng liên kết
            ->orderBy('id', 'desc')
            ->get();

        return response()->json(['data' => $products]);
    }
    
    /**
     * GET /api/products/{id} - Chi tiết 1 sản phẩm
     */
    public function show($id)
    {
        $product = Product::where('status', 1)
            ->with(['category', 'brand', 'images'])
            ->findOrFail($id);
            
        return response()->json(['data' => $product]);
    }
}