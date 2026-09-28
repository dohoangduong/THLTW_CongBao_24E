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
        $brands = Brand::active()->orderBy('id', 'desc')->get();
        // Sửa dòng return thành:
        return BrandResource::collection($brands);
    }
    
    /**
     * GET /api/brands/{id} - Chi tiết 1 thương hiệu
     */
    public function show($id)
    {
        $brand = Brand::active()->findOrFail($id);
        
        return response()->json(['data' => $brand]);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
        ]);

        $brand = Brand::create($validated);

        return response()->json([
            'message' => 'Thêm thương hiệu thành công!',
            'data'    => new BrandResource($brand)
        ], 201);
    }

    // CẬP NHẬT / SỬA (Update)
    public function update(Request $request, $id)
    {
        $brand = Brand::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'nullable|string|max:255',
        ]);

        $brand->update($validated);

        return response()->json([
            'message' => 'Cập nhật thương hiệu thành công!',
            'data'    => new BrandResource($brand)
        ]);
    }

    // XÓA (Delete)
    public function destroy($id)
    {
        $brand = Brand::findOrFail($id);
        $brand->delete();

        return response()->json([
            'message' => 'Xóa thương hiệu thành công!'
        ]);
    }
}