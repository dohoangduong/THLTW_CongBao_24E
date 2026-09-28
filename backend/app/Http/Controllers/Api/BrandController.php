<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Http\Resources\BrandResource;
use App\Http\Requests\StoreBrandRequest;
use App\Http\Requests\UpdateBrandRequest;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class BrandController extends Controller
{
    /**
     * GET /api/brands - Danh sách thương hiệu đang hoạt động
     */
    public function index()
    {
        $brands = Brand::active()->orderBy('id', 'desc')->get();
        
        return BrandResource::collection($brands);
    }
    
    /**
     * GET /api/brands/{id} - Chi tiết 1 thương hiệu
     */
    public function show($id)
    {
        $brand = Brand::active()->findOrFail($id);
        
        return new BrandResource($brand);
    }

    /**
     * POST /api/brands - Thêm mới
     */
    public function store(StoreBrandRequest $request)
    {
        // Dữ liệu đã được kiểm tra qua StoreBrandRequest
        $brand = Brand::create($request->validated());
        
        return response()->json([
            'message' => 'Thêm thương hiệu thành công',
            'data' => new BrandResource($brand)
        ], 201);
    }

    /**
     * PUT /api/brands/{id} - Sửa (Cập nhật)
     */
    public function update(UpdateBrandRequest $request, $id)
    {
        $brand = Brand::findOrFail($id);
        $brand->update($request->validated());

        return response()->json([
            'message' => 'Cập nhật thương hiệu thành công',
            'data' => new BrandResource($brand)
        ]);
    }

    /**
     * DELETE /api/brands/{id} - Xóa
     */
    public function destroy($id)
    {
        $brand = Brand::findOrFail($id);
        $brand->delete();

        return response()->json([
            'message' => 'Xóa thương hiệu thành công'
        ]);
    }
}