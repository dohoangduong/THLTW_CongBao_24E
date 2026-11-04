<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdminBannerController extends Controller
{
    /**
     * Public API lấy danh sách Banner hiển thị ngoài trang chủ (status = 1)
     * GET /api/banners
     */
    public function publicBanners(): JsonResponse
    {
        $banners = Banner::where('status', 1)
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $banners,
        ]);
    }

    /**
     * Admin: Danh sách Banner có tìm kiếm, lọc và phân trang
     * GET /api/admin/banners
     */
    public function index(Request $request): JsonResponse
    {
        $query = Banner::orderBy('sort_order', 'asc')->orderBy('id', 'desc');

        if ($request->filled('position')) {
            $query->where('position', $request->position);
        }

        if ($request->filled('status')) {
            $query->where('status', (int) $request->status);
        }

        if ($request->filled('q')) {
            $q = $request->q;
            $query->where(function ($w) use ($q) {
                $w->where('title', 'like', "%{$q}%")
                  ->orWhere('subtitle', 'like', "%{$q}%");
            });
        }

        if ($request->boolean('all')) {
            return response()->json(['data' => $query->get()]);
        }

        $perPage = (int) $request->input('per_page', 10);
        return response()->json($query->paginate($perPage));
    }

    /**
     * Admin: Thêm Banner mới
     * POST /api/admin/banners
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'subtitle'    => 'nullable|string|max:500',
            'badge_text'  => 'nullable|string|max:100',
            'image'       => 'required|string|max:500',
            'link_url'    => 'nullable|string|max:500',
            'button_text' => 'nullable|string|max:100',
            'position'    => 'required|in:main_hero,sub_banner',
            'sort_order'  => 'nullable|integer',
            'status'      => 'nullable|in:0,1',
        ], [
            'title.required'    => 'Vui lòng nhập tiêu đề Banner!',
            'image.required'    => 'Vui lòng tải ảnh lên hoặc nhập URL hình ảnh Banner!',
            'position.required' => 'Vui lòng chọn vị trí hiển thị của Banner!',
        ]);

        $banner = Banner::create([
            'title'       => $validated['title'],
            'subtitle'    => $validated['subtitle'] ?? null,
            'badge_text'  => $validated['badge_text'] ?? null,
            'image'       => $validated['image'],
            'link_url'    => $validated['link_url'] ?? '/products',
            'button_text' => $validated['button_text'] ?? 'Khám phá ngay',
            'position'    => $validated['position'],
            'sort_order'  => (int) ($validated['sort_order'] ?? 0),
            'status'      => isset($validated['status']) ? (int) $validated['status'] : 1,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Thêm Banner thành công!',
            'data'    => $banner,
        ], 201);
    }

    /**
     * Admin: Xem chi tiết Banner
     * GET /api/admin/banners/{id}
     */
    public function show($id): JsonResponse
    {
        $banner = Banner::findOrFail($id);
        return response()->json(['success' => true, 'data' => $banner]);
    }

    /**
     * Admin: Cập nhật Banner
     * PUT /api/admin/banners/{id}
     */
    public function update(Request $request, $id): JsonResponse
    {
        $banner = Banner::findOrFail($id);

        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'subtitle'    => 'nullable|string|max:500',
            'badge_text'  => 'nullable|string|max:100',
            'image'       => 'required|string|max:500',
            'link_url'    => 'nullable|string|max:500',
            'button_text' => 'nullable|string|max:100',
            'position'    => 'required|in:main_hero,sub_banner',
            'sort_order'  => 'nullable|integer',
            'status'      => 'nullable|in:0,1',
        ]);

        $banner->update([
            'title'       => $validated['title'],
            'subtitle'    => $validated['subtitle'] ?? null,
            'badge_text'  => $validated['badge_text'] ?? null,
            'image'       => $validated['image'],
            'link_url'    => $validated['link_url'] ?? '/products',
            'button_text' => $validated['button_text'] ?? 'Khám phá ngay',
            'position'    => $validated['position'],
            'sort_order'  => (int) ($validated['sort_order'] ?? $banner->sort_order),
            'status'      => isset($validated['status']) ? (int) $validated['status'] : $banner->status,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật Banner thành công!',
            'data'    => $banner,
        ]);
    }

    /**
     * Admin: Xóa Banner
     * DELETE /api/admin/banners/{id}
     */
    public function destroy($id): JsonResponse
    {
        $banner = Banner::findOrFail($id);
        $banner->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa Banner thành công!',
        ]);
    }
}

