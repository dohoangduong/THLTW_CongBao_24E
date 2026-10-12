<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Http\Resources\BrandResource;
use App\Http\Requests\StoreBrandRequest;
use App\Http\Requests\UpdateBrandRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class BrandController extends Controller
{
    /**
     * GET /api/brands - Danh sách thương hiệu (có phân trang)
     */
    public function index(Request $request)
    {
        if ($request->boolean('all')) {
            $brands = Brand::orderBy('id', 'desc')->get();
            return BrandResource::collection($brands);
        }

        $perPage = $request->input('per_page', 10);
        $brands = Brand::orderBy('id', 'desc')->paginate($perPage);
        
        return BrandResource::collection($brands);
    }
    
    public function show($id)
    {
        $brand = Brand::findOrFail($id);
        
        return new BrandResource($brand);
    }

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
                'message' => 'Lỗi: Chỉ có Quản trị viên mới được phép xóa vĩnh viễn thương hiệu!'
            ], 403));
        }
    }

    /**
     * POST /api/brands - Thêm mới
     */
    public function store(StoreBrandRequest $request)
    {
        $this->checkStaffAccess(); // Cho phép Admin và Manager

        // Dữ liệu đã được kiểm tra qua StoreBrandRequest
        $data = $request->validated();
        if (empty($data['slug'])) {
            $data['slug'] = \Illuminate\Support\Str::slug($data['name']);
        }
        if (!isset($data['status'])) {
            $data['status'] = 1;
        } else {
            $data['status'] = (int) $data['status'];
        }

        $brand = Brand::create($data);
        
        return response()->json([
            'message' => 'Thêm thương hiệu thành công',
            'data' => new BrandResource($brand)
        ], 201);
    }

    /**
     * PUT /api/brands/{id} - Sửa (Cập nhật)
     */
    public function update(UpdateBrandRequest $request, $id)
    {
        $this->checkStaffAccess(); // Cho phép Admin và Manager

        $data = $request->validated();
        if (isset($data['name']) && empty($data['slug'])) {
            $data['slug'] = \Illuminate\Support\Str::slug($data['name']);
        }
        if (isset($data['status'])) {
            $data['status'] = (int) $data['status'];
        }

        $brand = Brand::findOrFail($id);
        $brand->update($data);

        return response()->json([
            'message' => 'Cập nhật thương hiệu thành công',
            'data' => new BrandResource($brand)
        ]);
    }

    /**
     * DELETE /api/brands/{id} - Xóa mềm thương hiệu (Soft Delete)
     */
    public function destroy($id)
    {
        $this->checkStaffAccess(); // Cho phép Admin và Manager

        $brand = Brand::findOrFail($id);

        // Kiểm tra nếu đang có sản phẩm thuộc thương hiệu này
        if ($brand->products()->count() > 0) {
            return response()->json([
                'message' => 'Không thể xóa thương hiệu này vì đang có sản phẩm thuộc thương hiệu!'
            ], 400);
        }

        $brand->delete();

        return response()->json([
            'message' => 'Đã chuyển thương hiệu vào thùng rác thành công'
        ]);
    }

    /**
     * GET /api/brands/trash - Danh sách thương hiệu trong thùng rác
     */
    public function trash()
    {
        $brands = Brand::onlyTrashed()
            ->orderBy('deleted_at', 'desc')
            ->get();

        return BrandResource::collection($brands);
    }

    /**
     * PUT /api/brands/{id}/restore - Khôi phục thương hiệu từ thùng rác
     */
    public function restore($id)
    {
        $this->checkStaffAccess(); // Cho phép Admin và Manager

        $brand = Brand::onlyTrashed()->findOrFail($id);
        $brand->restore();

        return response()->json([
            'message' => 'Khôi phục thương hiệu thành công',
            'data' => new BrandResource($brand)
        ]);
    }

    /**
     * DELETE /api/brands/{id}/force-delete - Xóa vĩnh viễn thương hiệu
     */
    public function forceDelete($id)
    {
        $this->checkAdminOnlyAccess(); // Chỉ Quản trị viên

        $brand = Brand::onlyTrashed()->findOrFail($id);

        // Kiểm tra nếu đang có sản phẩm thuộc thương hiệu này
        if ($brand->products()->count() > 0) {
            return response()->json([
                'message' => 'Không thể xóa thương hiệu này vì đang có sản phẩm thuộc thương hiệu!'
            ], 400);
        }

        $brand->forceDelete();

        return response()->json([
            'message' => 'Đã xóa vĩnh viễn thương hiệu thành công'
        ]);
    }
}