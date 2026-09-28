<?php

namespace App\Http\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Http\Resources\CategoryResource;

class CategoryController extends Controller
{
    
    public function index()
    {
        $categories = Category::with('children')->get();
        return CategoryResource::collection($categories);
    }
    public function show($id)
    {
        $category = Category::findOrFail($id);
        return new CategoryResource($category);
    }

    // THÊM MỚI (Create)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
        ]);

        $category = Category::create($validated);

        return response()->json([
            'message' => 'Thêm danh mục thành công!',
            'data'    => new CategoryResource($category)
        ], 201);
    }

    // CẬP NHẬT / SỬA (Update)
    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'nullable|string|max:255',
        ]);

        $category->update($validated);

        return response()->json([
            'message' => 'Cập nhật danh mục thành công!',
            'data'    => new CategoryResource($category)
        ]);
    }

    // XÓA (Delete)
    public function destroy($id)
    {
        $category = Category::findOrFail($id);
        $category->delete();

        return response()->json([
            'message' => 'Xóa danh mục thành công!'
        ]);
    }
}