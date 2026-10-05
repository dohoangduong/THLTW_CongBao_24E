<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Http\Resources\CategoryResource; 
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * GET /api/categories - Lấy danh sách danh mục
     */
    public function index()
    {
        $categories = Category::active()
            ->whereNull('parent_id')
            ->with(['children' => fn ($q) => $q->active()])
            ->orderBy('sort_order')
            ->get();

        return CategoryResource::collection($categories);
    }

    /**
     * GET /api/categories/{id} - Xem chi tiết 1 danh mục
     */
    public function show($id)
    {
        $category = Category::with('children')->findOrFail($id);
            
        return new CategoryResource($category);
    }

    /**
     * POST /api/categories - Thêm danh mục mới
     */
    public function store(Request $request)
    {
        // 1. Kiểm tra quyền Admin
        $user = auth('sanctum')->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'message' => 'Lỗi: Chỉ có Admin mới được phép thêm danh mục!'
            ], 403);
        }

        // 2. Validate và Lưu (Nếu có StoreCategoryRequest thì bạn thay vào giống Product)
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|integer',
            'sort_order' => 'nullable|integer'
        ]);

        $category = Category::create($validated);
        
        return response()->json([
            'message' => 'Thêm danh mục thành công',
            'data' => new CategoryResource($category)
        ], 201);
    }

    /**
     * PUT /api/categories/{id} - Sửa danh mục
     */
    public function update(Request $request, $id)
    {
        // 1. Kiểm tra quyền Admin
        $user = auth('sanctum')->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'message' => 'Lỗi: Chỉ có Admin mới được phép sửa danh mục!'
            ], 403);
        }

        $category = Category::findOrFail($id);
        
        // 2. Validate và Cập nhật
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'parent_id' => 'nullable|integer',
            'sort_order' => 'nullable|integer'
        ]);

        $category->update($validated);

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