<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Http\Resources\CategoryResource;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    // GET /api/categories - Lấy danh sách danh mục
// GET /api/categories?per_page=10
public function index(Request $request)
{
    // Lấy số lượng phần tử trên mỗi trang từ tham số URL, mặc định là 10
    $perPage = $request->input('per_page', 10);

    // Phân trang danh mục (sắp xếp ID mới nhất lên đầu)
$categories = Category::orderBy('id', 'desc')->get();
    // Trả về dữ liệu đã tự động cấu trúc chuẩn phân trang API
    return CategoryResource::collection($categories);
}
    // GET /api/categories/{id} - Xem chi tiết 1 danh mục
    public function show($id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'message' => 'Không tìm thấy danh mục!'
            ], 404);
        }

        return new CategoryResource($category);
    }

    // POST /api/categories - Thêm danh mục mới
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $category = Category::create($validated);

        return response()->json([
            'message' => 'Thêm danh mục thành công!',
            'data' => new CategoryResource($category)
        ], 201);
    }

    // PUT/PATCH /api/categories/{id} - Cập nhật danh mục
    public function update(Request $request, $id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'message' => 'Không tìm thấy danh mục!'
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $category->update($validated);

        return response()->json([
            'message' => 'Cập nhật danh mục thành công!',
            'data' => new CategoryResource($category)
        ], 200);
    }

    // DELETE /api/categories/{id} - Xóa danh mục
    public function destroy($id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'message' => 'Không tìm thấy danh mục!'
            ], 404);
        }

        $category->delete();

        return response()->json([
            'message' => 'Xóa danh mục thành công!'
        ], 200);
    }
}