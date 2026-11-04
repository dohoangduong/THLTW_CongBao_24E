<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class AdminPageController extends Controller
{
    /**
     * Public API: Lấy danh sách trang đơn công khai (status = 1)
     * GET /api/pages
     */
    public function publicPages(): JsonResponse
    {
        $pages = Page::where('status', 1)
            ->select('id', 'title', 'slug', 'summary', 'created_at', 'updated_at')
            ->orderBy('id', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $pages,
        ]);
    }

    /**
     * Public API: Xem nội dung chi tiết trang tĩnh theo slug (FUNC-PAGE-U-01)
     * GET /api/pages/{slug}
     */
    public function publicPage($slug): JsonResponse
    {
        $page = Page::where('slug', $slug)
            ->where('status', 1)
            ->first();

        if (!$page) {
            return response()->json([
                'success' => false,
                'message' => 'Trang hoặc bản ghi không tồn tại hoặc đã bị ẩn!',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $page,
        ]);
    }

    /**
     * Admin: Danh sách các trang đơn
     * GET /api/admin/pages
     */
    public function index(Request $request): JsonResponse
    {
        $query = Page::orderBy('id', 'desc');

        if ($request->filled('status')) {
            $query->where('status', (int) $request->status);
        }

        if ($request->filled('q')) {
            $q = $request->q;
            $query->where(function ($w) use ($q) {
                $w->where('title', 'like', "%{$q}%")
                  ->orWhere('slug', 'like', "%{$q}%")
                  ->orWhere('summary', 'like', "%{$q}%");
            });
        }

        if ($request->boolean('all')) {
            return response()->json(['data' => $query->get()]);
        }

        $perPage = (int) $request->input('per_page', 10);
        return response()->json($query->paginate($perPage));
    }

    /**
     * Admin: Thêm trang đơn mới
     * POST /api/admin/pages
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'   => 'required|string|max:255',
            'slug'    => 'nullable|string|max:255|unique:pages,slug',
            'summary' => 'nullable|string|max:1000',
            'content' => 'required|string',
            'status'  => 'nullable|in:0,1',
        ], [
            'title.required'   => 'Vui lòng nhập tiêu đề trang đơn!',
            'slug.unique'      => 'Đường dẫn tĩnh (Slug) này đã tồn tại, vui lòng chọn tên khác!',
            'content.required' => 'Vui lòng nhập nội dung chi tiết cho trang đơn!',
        ]);

        $slug = !empty($validated['slug']) ? Str::slug($validated['slug']) : Str::slug($validated['title']);
        // Đảm bảo không trùng slug
        $originalSlug = $slug;
        $counter = 1;
        while (Page::where('slug', $slug)->exists()) {
            $slug = "{$originalSlug}-{$counter}";
            $counter++;
        }

        $page = Page::create([
            'title'   => $validated['title'],
            'slug'    => $slug,
            'summary' => $validated['summary'] ?? null,
            'content' => $validated['content'],
            'status'  => isset($validated['status']) ? (int) $validated['status'] : 1,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Thêm trang đơn thành công!',
            'data'    => $page,
        ], 201);
    }

    /**
     * Admin: Xem chi tiết trang đơn
     * GET /api/admin/pages/{id}
     */
    public function show($id): JsonResponse
    {
        $page = is_numeric($id) ? Page::find($id) : Page::where('slug', $id)->first();
        if (!$page) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy trang đơn'], 404);
        }

        return response()->json(['success' => true, 'data' => $page]);
    }

    /**
     * Admin: Cập nhật trang đơn
     * PUT /api/admin/pages/{id}
     */
    public function update(Request $request, $id): JsonResponse
    {
        $page = Page::findOrFail($id);

        $validated = $request->validate([
            'title'   => 'required|string|max:255',
            'slug'    => 'nullable|string|max:255|unique:pages,slug,' . $id,
            'summary' => 'nullable|string|max:1000',
            'content' => 'required|string',
            'status'  => 'nullable|in:0,1',
        ], [
            'title.required'   => 'Vui lòng nhập tiêu đề trang đơn!',
            'slug.unique'      => 'Đường dẫn tĩnh (Slug) này đã tồn tại trên hệ thống!',
            'content.required' => 'Vui lòng nhập nội dung chi tiết cho trang đơn!',
        ]);

        $slug = !empty($validated['slug']) ? Str::slug($validated['slug']) : Str::slug($validated['title']);

        $page->update([
            'title'   => $validated['title'],
            'slug'    => $slug,
            'summary' => $validated['summary'] ?? null,
            'content' => $validated['content'],
            'status'  => isset($validated['status']) ? (int) $validated['status'] : $page->status,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật trang đơn thành công!',
            'data'    => $page,
        ]);
    }

    /**
     * Admin: Xóa trang đơn
     * DELETE /api/admin/pages/{id}
     */
    public function destroy($id): JsonResponse
    {
        $page = Page::findOrFail($id);
        $page->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa trang đơn thành công!',
        ]);
    }
}

