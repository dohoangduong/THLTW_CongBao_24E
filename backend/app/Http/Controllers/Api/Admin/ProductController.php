<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Http\Resources\ProductResource;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    /**
     * Hàm dùng chung để kiểm tra quyền Admin
     * Tránh việc lặp lại code ở nhiều hàm khác nhau
     */
    private function checkAdminAccess(): void
    {
        $user = auth('sanctum')->user();
        if (!$user || $user->role !== 'admin') {
            abort(response()->json([
                'message' => 'Lỗi: Chỉ có Admin mới được phép thực hiện hành động này!'
            ], 403));
        }
    }

    /**
     * GET /api/products - Danh sách sản phẩm (có kèm danh mục và thương hiệu)
     */
    public function index(): AnonymousResourceCollection
    {
        // Bổ sung kiểm tra quyền admin cho hàm xem danh sách (nếu cần)
        // $this->checkAdminAccess(); 

        $products = Product::with(['category', 'brand']) 
            ->orderBy('id', 'desc')
            ->paginate(15); // Thay get() bằng paginate() để tối ưu hiệu suất

        return ProductResource::collection($products);
    }
    
    /**
     * GET /api/products/{id} - Chi tiết 1 sản phẩm
     */
    public function show($id): ProductResource
    {
        $product = Product::with(['category', 'brand', 'images'])
            ->findOrFail($id);
            
        return new ProductResource($product);
    }

    /**
     * POST /api/products - Thêm mới
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        $this->checkAdminAccess(); // Gọi hàm kiểm tra quyền

        $product = Product::create($request->validated());
        
        return response()->json([
            'message' => 'Thêm sản phẩm thành công',
            'data' => new ProductResource($product)
        ], 201);
    }

    /**
     * PUT /api/products/{id} - Sửa (Cập nhật)
     */
    public function update(UpdateProductRequest $request, $id): JsonResponse
    {
        $this->checkAdminAccess(); // Gọi hàm kiểm tra quyền

        $product = Product::findOrFail($id);
        $product->update($request->validated());

        return response()->json([
            'message' => 'Cập nhật sản phẩm thành công',
            'data' => new ProductResource($product)
        ]); // Mặc định trả về status 200
    }

    /**
     * DELETE /api/products/{id} - Xóa
     */
    public function destroy($id): JsonResponse
    {
        $this->checkAdminAccess(); // Gọi hàm kiểm tra quyền

        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json([
            'message' => 'Xóa sản phẩm thành công'
        ]); // Mặc định trả về status 200
    }
}