<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Http\Resources\CategoryResource; 
use Illuminate\Http\Request;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;

class CategoryController extends Controller
{
    /**
     * GET /api/categories - Lấy danh sách danh mục
     */
    public function index()
    {
        $categories = Category::active()
            ->orderBy('id', 'desc')
            ->get();

        return CategoryResource::collection($categories);
    }

    /**
     * GET /api/categories/{id} - Xem chi tiết 1 danh mục
     */
    public function show($id)
    {
        $category = Category::findOrFail($id);
            
        return new CategoryResource($category);
    }

    /**
     * POST /api/categories - Thêm danh mục mới
     */
    public function store(StoreCategoryRequest $request)
    {
        // 1. Kiểm tra quyền Admin
        $user = auth('sanctum')->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'message' => 'Lỗi: Chỉ có Admin mới được phép thêm danh mục!'
            ], 403);
        }

        $data = $request->validated();
        if (empty($data['slug'])) {
            $data['slug'] = \Illuminate\Support\Str::slug($data['name']);
        }
        $category = Category::create($data);
        
        return response()->json([
            'message' => 'Thêm danh mục thành công',
            'data' => new CategoryResource($category)
        ], 201);
    }

    /**
     * PUT /api/categories/{id} - Sửa danh mục
     */
    public function update(UpdateCategoryRequest $request, $id)
    {
        // 1. Kiểm tra quyền Admin
        $user = auth('sanctum')->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'message' => 'Lỗi: Chỉ có Admin mới được phép sửa danh mục!'
            ], 403);
        }

        $data = $request->validated();
        if (isset($data['name']) && empty($data['slug'])) {
            $data['slug'] = \Illuminate\Support\Str::slug($data['name']);
        }

        $category = Category::findOrFail($id);
        $category->update($data);

        return response()->json([
            'message' => 'Cập nhật danh mục thành công',
            'data' => new CategoryResource($category)
        ]);
    }

    /**
     * DELETE /api/categories/{id} - Xóa danh mục
     */
    public function destroy($id)
    {
        // 1. Kiểm tra quyền Admin
        $user = auth('sanctum')->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'message' => 'Lỗi: Chỉ có Admin mới được phép xóa danh mục!'
            ], 403);
        }

        $category = Category::findOrFail($id);
        $category->delete();

        return response()->json([
            'message' => 'Xóa danh mục thành công'
        ]);
    }
}