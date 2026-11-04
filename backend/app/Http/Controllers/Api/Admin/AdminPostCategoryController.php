<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\PostCategory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class AdminPostCategoryController extends Controller
{
    /**
     * Public API: Lấy danh sách chủ đề bài viết hiển thị (status = 1) kèm số lượng bài viết
     * GET /api/post-categories
     */
    public function publicCategories(): JsonResponse
    {
        $categories = PostCategory::where('status', 1)
            ->withCount(['posts' => function ($q) {
                $q->where('is_visible', true);
            }])
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $categories,
        ]);
    }

    /**
     * Admin: Danh sách chủ đề bài viết
     * GET /api/admin/post-categories
     */
    public function index(Request $request): JsonResponse
    {
        $query = PostCategory::withCount('posts')
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'desc');

        if ($request->filled('status')) {
            $query->where('status', (int) $request->status);
        }

        if ($request->filled('q')) {
            $q = $request->q;
            $query->where(function ($w) use ($q) {
                $w->where('name', 'like', "%{$q}%")
                  ->orWhere('description', 'like', "%{$q}%");
            });
        }

        if ($request->boolean('all')) {
            return response()->json(['data' => $query->get()]);
        }

        $perPage = (int) $request->input('per_page', 10);
        return response()->json($query->paginate($perPage));
    }

    /**
     * Admin: Thêm chủ đề mới
     * POST /api/admin/post-categories
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'slug'        => 'nullable|string|max:255|unique:post_categories,slug',
            'description' => 'nullable|string|max:1000',
            'sort_order'  => 'nullable|integer',
            'status'      => 'nullable|in:0,1',
        ], [
            'name.required' => 'Vui lòng nhập tên chủ đề bài viết!',
            'slug.unique'   => 'Đường dẫn tĩnh (Slug) chủ đề đã tồn tại!',
        ]);

        $slug = !empty($validated['slug']) ? Str::slug($validated['slug']) : Str::slug($validated['name']);

        $category = PostCategory::create([
            'name'        => $validated['name'],
            'slug'        => $slug,
            'description' => $validated['description'] ?? null,
            'sort_order'  => (int) ($validated['sort_order'] ?? 0),
            'status'      => isset($validated['status']) ? (int) $validated['status'] : 1,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Thêm chủ đề bài viết thành công!',
            'data'    => $category,
        ], 201);
    }

    /**
     * Admin: Chi tiết chủ đề
     * GET /api/admin/post-categories/{id}
     */
    public function show($id): JsonResponse
    {
        $category = PostCategory::withCount('posts')->findOrFail($id);
        return response()->json(['success' => true, 'data' => $category]);
    }

    /**
     * Admin: Cập nhật chủ đề
     * PUT /api/admin/post-categories/{id}
     */
    public function update(Request $request, $id): JsonResponse
    {
        $category = PostCategory::findOrFail($id);

        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'slug'        => 'nullable|string|max:255|unique:post_categories,slug,' . $id,
            'description' => 'nullable|string|max:1000',
            'sort_order'  => 'nullable|integer',
            'status'      => 'nullable|in:0,1',
        ], [
            'name.required' => 'Vui lòng nhập tên chủ đề bài viết!',
            'slug.unique'   => 'Đường dẫn tĩnh (Slug) chủ đề đã tồn tại trên hệ thống!',
        ]);

        $slug = !empty($validated['slug']) ? Str::slug($validated['slug']) : Str::slug($validated['name']);

        $category->update([
            'name'        => $validated['name'],
            'slug'        => $slug,
            'description' => $validated['description'] ?? null,
            'sort_order'  => (int) ($validated['sort_order'] ?? $category->sort_order),
            'status'      => isset($validated['status']) ? (int) $validated['status'] : $category->status,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật chủ đề bài viết thành công!',
            'data'    => $category,
        ]);
    }

    /**
     * Admin: Xóa chủ đề bài viết có kiểm tra ràng buộc (Constraint Check)
     * DELETE /api/admin/post-categories/{id}
     */
    public function destroy($id): JsonResponse
    {
        $category = PostCategory::findOrFail($id);

        $postsCount = $category->posts()->count();
        if ($postsCount > 0) {
            return response()->json([
                'success' => false,
                'message' => "Không thể xóa chủ đề này vì đang có {$postsCount} bài viết trực thuộc! Vui lòng chuyển hoặc xóa bài viết trước.",
            ], 422);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa chủ đề bài viết thành công!',
        ]);
    }
}

