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
    // 1. THÊM MỚI (Create)
public function store(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'price' => 'required|numeric',
        'category_id' => 'required|exists:categories,id',
        'brand_id' => 'required|exists:brands,id',
    ]);

    $product = Product::create($validated);

    return response()->json([
        'message' => 'Thêm sản phẩm thành công!',
        'data' => new ProductResource($product)
    ], 201);
}

// 2. CẬP NHẬT / SỬA (Update)
public function update(Request $request, $id)
{
    $product = Product::findOrFail($id);

    $validated = $request->validate([
        'name' => 'sometimes|required|string|max:255',
        'price' => 'sometimes|required|numeric',
    ]);

    $product->update($validated);

    return response()->json([
        'message' => 'Cập nhật thành công!',
        'data' => new ProductResource($product)
    ]);
}

// 3. XÓA (Delete)
public function destroy($id)
{
    $product = Product::findOrFail($id);
    $product->delete();

    return response()->json([
        'message' => 'Xóa sản phẩm thành công!'
    ]);
}
}