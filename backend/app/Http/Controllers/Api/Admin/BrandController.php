<?php

namespace App\Http\Controllers\Api\Admin;

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
        // Xóa bỏ ->active()
        $brands = Brand::orderBy('id', 'desc')->get();
        
        return BrandResource::collection($brands);
    }
    
    public function show($id)
    {
        // Xóa bỏ ->active()
        $brand = Brand::findOrFail($id);
        
        return new BrandResource($brand);
    }

    /**
     * POST /api/brands - Thêm mới
     */
    public function store(StoreBrandRequest $request)
    {
        // 1. Kiểm tra quyền Admin trước khi Thêm
        $user = auth('sanctum')->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'message' => 'Lỗi: Chỉ có Admin mới được phép thêm thương hiệu mới!'
            ], 403);
        }

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
        // 1. Kiểm tra quyền Admin trước khi Sửa
        $user = auth('sanctum')->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'message' => 'Lỗi: Chỉ có Admin mới được phép sửa thông tin thương hiệu!'
            ], 403);
        }

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
        // 1. Kiểm tra quyền Admin trước khi Xóa
        $user = auth('sanctum')->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'message' => 'Lỗi: Chỉ có Admin mới được phép xóa thương hiệu!'
            ], 403);
        }

        $brand = Brand::findOrFail($id);
        $brand->delete();

        return response()->json([
            'message' => 'Xóa thương hiệu thành công'
        ]);
    }
}