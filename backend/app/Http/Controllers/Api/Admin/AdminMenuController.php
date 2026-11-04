<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdminMenuController extends Controller
{
    /**
     * Public API lấy danh sách Menu điều hướng hiển thị (status = 1)
     * GET /api/menus
     */
    public function publicMenus(): JsonResponse
    {
        $menus = Menu::where('status', 1)
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'header'  => $menus->where('position', 'header')->values(),
            'footer'  => $menus->where('position', 'footer')->values(),
            'data'    => $menus,
        ]);
    }

    /**
     * Admin: Danh sách Menu có tìm kiếm, lọc và phân trang
     * GET /api/admin/menus
     */
    public function index(Request $request): JsonResponse
    {
        $query = Menu::orderBy('position', 'asc')->orderBy('sort_order', 'asc');

        if ($request->filled('position')) {
            $query->where('position', $request->position);
        }

        if ($request->filled('status')) {
            $query->where('status', (int) $request->status);
        }

        if ($request->filled('q')) {
            $q = $request->q;
            $query->where(function ($w) use ($q) {
                $w->where('name', 'like', "%{$q}%")
                  ->orWhere('url', 'like', "%{$q}%");
            });
        }

        if ($request->boolean('all')) {
            return response()->json(['data' => $query->get()]);
        }

        $perPage = (int) $request->input('per_page', 10);
        return response()->json($query->paginate($perPage));
    }

    /**
     * Admin: Thêm Menu mới
     * POST /api/admin/menus
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'url'        => 'required|string|max:500',
            'position'   => 'required|in:header,footer',
            'sort_order' => 'nullable|integer',
            'status'     => 'nullable|in:0,1',
        ], [
            'name.required'     => 'Vui lòng nhập tên mục Menu!',
            'url.required'      => 'Vui lòng nhập đường dẫn liên kết (URL)!',
            'position.required' => 'Vui lòng chọn vị trí Menu (Header hoặc Footer)!',
        ]);

        $menu = Menu::create([
            'name'       => $validated['name'],
            'url'        => $validated['url'],
            'position'   => $validated['position'],
            'sort_order' => (int) ($validated['sort_order'] ?? 0),
            'status'     => isset($validated['status']) ? (int) $validated['status'] : 1,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Thêm mục Menu thành công!',
            'data'    => $menu,
        ], 201);
    }

    /**
     * Admin: Xem chi tiết Menu
     * GET /api/admin/menus/{id}
     */
    public function show($id): JsonResponse
    {
        $menu = Menu::findOrFail($id);
        return response()->json(['success' => true, 'data' => $menu]);
    }

    /**
     * Admin: Cập nhật Menu
     * PUT /api/admin/menus/{id}
     */
    public function update(Request $request, $id): JsonResponse
    {
        $menu = Menu::findOrFail($id);

        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'url'        => 'required|string|max:500',
            'position'   => 'required|in:header,footer',
            'sort_order' => 'nullable|integer',
            'status'     => 'nullable|in:0,1',
        ]);

        $menu->update([
            'name'       => $validated['name'],
            'url'        => $validated['url'],
            'position'   => $validated['position'],
            'sort_order' => (int) ($validated['sort_order'] ?? $menu->sort_order),
            'status'      => isset($validated['status']) ? (int) $validated['status'] : $menu->status,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật mục Menu thành công!',
            'data'    => $menu,
        ]);
    }

    /**
     * Admin: Xóa Menu
     * DELETE /api/admin/menus/{id}
     */
    public function destroy($id): JsonResponse
    {
        $menu = Menu::findOrFail($id);
        $menu->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa mục Menu thành công!',
        ]);
    }
}

