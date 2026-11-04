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
     * Hàm kiểm tra quyền Nhân viên (Admin hoặc Manager) cho các thao tác thông thường
     */
    private function checkStaffAccess(): void
    {
        $user = auth('sanctum')->user();
        if (!$user || !in_array($user->role, ['admin', 'manager'])) {
            abort(response()->json([
                'message' => 'Lỗi: Bạn không có quyền thực hiện hành động này!'
            ], 403));
        }
    }

    /**
     * Hàm kiểm tra quyền Quản trị viên (Chỉ Admin mới được xóa vĩnh viễn)
     */
    private function checkAdminOnlyAccess(): void
    {
        $user = auth('sanctum')->user();
        if (!$user || $user->role !== 'admin') {
            abort(response()->json([
                'message' => 'Lỗi: Chỉ có Quản trị viên mới được phép xóa vĩnh viễn danh mục!'
            ], 403));
        }
    }

    /**
     * GET /api/categories - Lấy danh sách danh mục (có phân trang)
     */
    public function index(Request $request)
    {
        // Nếu truyền ?all=1 thì trả về toàn bộ (dùng cho dropdown chọn danh mục)
        if ($request->boolean('all')) {
            $categories = Category::with('parent')->orderBy('id', 'desc')->get();
            return CategoryResource::collection($categories);
        }

        $perPage = $request->input('per_page', 10);
        $categories = Category::with('parent')
            ->orderBy('id', 'desc')
            ->paginate($perPage);

        return CategoryResource::collection($categories);
    }

    /**
     * GET /api/categories/{id} - Xem chi tiết 1 danh mục
     */
    public function show($id)
    {
        $category = Category::with('parent')->findOrFail($id);
            
        return new CategoryResource($category);
    }

    /**
     * POST /api/categories - Thêm danh mục mới
     */
    public function store(StoreCategoryRequest $request)
    {
        $this->checkStaffAccess(); // Cho phép Admin và Manager

        $data = $request->validated();
        if (empty($data['slug'])) {
            $data['slug'] = \Illuminate\Support\Str::slug($data['name']);
        }
        if (!isset($data['status'])) {
            $data['status'] = 1;
        } else {
            $data['status'] = (int) $data['status'];
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
        $this->checkStaffAccess(); // Cho phép Admin và Manager

        $data = $request->validated();
        if (isset($data['name']) && empty($data['slug'])) {
            $data['slug'] = \Illuminate\Support\Str::slug($data['name']);
        }
        if (isset($data['status'])) {
            $data['status'] = (int) $data['status'];
        }

        $category = Category::findOrFail($id);
        $category->update($data);

        return response()->json([
            'message' => 'Cập nhật danh mục thành công',
            'data' => new CategoryResource($category)
        ]);
    }

    /**
     * DELETE /api/categories/{id} - Xóa mềm danh mục (Soft Delete)
     */
    public function destroy($id)
    {
        $this->checkStaffAccess(); // Cho phép Admin và Manager

        $category = Category::findOrFail($id);

        // [RÀNG BUỘC MỤC 4]: Kiểm tra nếu đang có sản phẩm trực thuộc
        $productsCount = $category->products()->count();
        if ($productsCount > 0) {
            return response()->json([
                'message' => "Không thể xóa danh mục này vì đang có {$productsCount} sản phẩm trực thuộc! Vui lòng chuyển hoặc xóa sản phẩm trước."
            ], 422);
        }

        $category->delete();

        return response()->json([
            'message' => 'Đã chuyển danh mục vào thùng rác thành công'
        ]);
    }

    /**
     * GET /api/categories/trash - Lấy danh sách danh mục trong thùng rác
     */
    public function trash()
    {
        $categories = Category::onlyTrashed()
            ->orderBy('deleted_at', 'desc')
            ->get();

        return CategoryResource::collection($categories);
    }

    /**
     * PUT /api/categories/{id}/restore - Khôi phục danh mục từ thùng rác
     */
    public function restore($id)
    {
        $this->checkStaffAccess(); // Cho phép Admin và Manager

        $category = Category::onlyTrashed()->findOrFail($id);
        $category->restore();

        return response()->json([
            'message' => 'Khôi phục danh mục thành công',
            'data' => new CategoryResource($category)
        ]);
    }

    /**
     * DELETE /api/categories/{id}/force-delete - Xóa vĩnh viễn danh mục
     */
    public function forceDelete($id)
    {
        $this->checkAdminOnlyAccess(); // Chỉ Quản trị viên

        $category = Category::onlyTrashed()->findOrFail($id);

        // [RÀNG BUỘC MỤC 4]: Kiểm tra nếu đang có sản phẩm trực thuộc
        $productsCount = $category->products()->count();
        if ($productsCount > 0) {
            return response()->json([
                'message' => "Không thể xóa vĩnh viễn danh mục này vì đang có {$productsCount} sản phẩm trực thuộc! Vui lòng chuyển hoặc xóa sản phẩm trước."
            ], 422);
        }

        $category->forceDelete();

        return response()->json([
            'message' => 'Đã xóa vĩnh viễn danh mục thành công'
        ]);
    }
}