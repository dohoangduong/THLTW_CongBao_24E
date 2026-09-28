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
   public function index()
    {
        $products = Product::where('status', 1)
            ->with(['category', 'brand']) 
            ->orderBy('id', 'desc')
            ->get();

        // Sửa dòng return thành:
        return ProductResource::collection($products);
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