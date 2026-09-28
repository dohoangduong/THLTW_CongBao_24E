<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Http\Resources\ProductResource;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
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

        return ProductResource::collection($products);
    }
    
    /**
     * GET /api/products/{id} - Chi tiết 1 sản phẩm
     */
    public function show($id)
    {
        // Lưu ý: Nếu database chưa có bảng 'images' thì tạm thời bỏ 'images' ra khỏi with() để tránh lỗi khi test
        $product = Product::where('status', 1)
            ->with(['category', 'brand', 'images'])
            ->findOrFail($id);
            
        return new ProductResource($product);
    }

    /**
     * POST /api/products - Thêm mới
     */
    public function store(StoreProductRequest $request)
    {
        // Dữ liệu đã được kiểm tra (validate) qua StoreProductRequest
        $product = Product::create($request->validated());
        
        return response()->json([
            'message' => 'Thêm sản phẩm thành công',
            'data' => new ProductResource($product)
        ], 201);
    }

    /**
     * PUT /api/products/{id} - Sửa (Cập nhật)
     */
    public function update(UpdateProductRequest $request, $id)
    {
        $product = Product::findOrFail($id);
        $product->update($request->validated());

        return response()->json([
            'message' => 'Cập nhật sản phẩm thành công',
            'data' => new ProductResource($product)
        ]);
    }

    /**
     * DELETE /api/products/{id} - Xóa
     */
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json([
            'message' => 'Xóa sản phẩm thành công'
        ]);
    }
}