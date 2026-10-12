<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBrandRequest;
use App\Http\Requests\UpdateBrandRequest;
use App\Http\Resources\BrandResource;
use App\Models\Brand;
use Illuminate\Http\Request;

class BrandController extends Controller
{
    /**
     * GET /api/brands
     *  - Khách (public):   chỉ thương hiệu đang hiển thị.
     *  - Admin (?admin=1): tất cả; thêm ?trashed=1 để xem thùng rác.
     */
    public function index(Request $request)
    {
        if ($request->boolean('admin')) {
            $this->requireAdmin();

            $query = Brand::withCount('products');

            if ($request->boolean('trashed')) {
                $query->onlyTrashed();
            }

            return BrandResource::collection($query->orderByDesc('id')->get());
        }

        return BrandResource::collection(Brand::active()->orderByDesc('id')->get());
    }

    /** GET /api/brands/{id} */
    public function show($id)
    {
        return new BrandResource(Brand::findOrFail($id));
    }

    /** POST /api/brands */
    public function store(StoreBrandRequest $request)
    {
        $data = $request->safe()->except(['image', 'remove_image']);

        if ($request->hasFile('image')) {
            $data['image'] = $this->storeImage($request->file('image'), 'brands');
        }

        $brand = Brand::create($data);

        return response()->json([
            'message' => 'Thêm thương hiệu thành công',
            'data'    => new BrandResource($brand),
        ], 201);
    }

    /** PUT /api/brands/{id} */
    public function update(UpdateBrandRequest $request, $id)
    {
        $brand = Brand::findOrFail($id);
        $data = $request->safe()->except(['image', 'remove_image']);

        if ($request->hasFile('image')) {
            $data['image'] = $this->storeImage($request->file('image'), 'brands', $brand->image);
        } elseif ($request->boolean('remove_image')) {
            $this->deleteImage($brand->image);
            $data['image'] = null;
        }

        $brand->update($data);

        return response()->json([
            'message' => 'Cập nhật thương hiệu thành công',
            'data'    => new BrandResource($brand->fresh()),
        ]);
    }

    /** PATCH /api/brands/{id}/toggle-status */
    public function toggleStatus($id)
    {
        $this->requireAdmin();

        $brand = Brand::findOrFail($id);
        $brand->update(['status' => $brand->status ? 0 : 1]);

        return response()->json([
            'message' => $brand->status ? 'Đã hiển thị thương hiệu' : 'Đã ẩn thương hiệu',
            'data'    => new BrandResource($brand),
        ]);
    }

    /** DELETE /api/brands/{id} — Xóa mềm */
    public function destroy($id)
    {
        $this->requireAdmin();

        $brand = Brand::findOrFail($id);

        if ($brand->products()->exists()) {
            return response()->json([
                'message' => 'Không thể xóa: thương hiệu còn ' . $brand->products()->count() . ' sản phẩm. Hãy chuyển hoặc xóa các sản phẩm trước.',
            ], 409);
        }

        $brand->delete();

        return response()->json(['message' => 'Đã chuyển thương hiệu vào thùng rác']);
    }

    /** POST /api/brands/{id}/restore */
    public function restore($id)
    {
        $this->requireAdmin();

        $brand = Brand::onlyTrashed()->findOrFail($id);
        $brand->restore();

        return response()->json([
            'message' => 'Khôi phục thương hiệu thành công',
            'data'    => new BrandResource($brand),
        ]);
    }

    /** DELETE /api/brands/{id}/force — Xóa vĩnh viễn */
    public function forceDelete($id)
    {
        $this->requireAdmin();

        $brand = Brand::onlyTrashed()->findOrFail($id);

        if ($brand->products()->withTrashed()->exists()) {
            return response()->json([
                'message' => 'Không thể xóa vĩnh viễn: vẫn còn sản phẩm thuộc thương hiệu này (kể cả trong thùng rác).',
            ], 409);
        }

        $this->deleteImage($brand->image);
        $brand->forceDelete();

        return response()->json(['message' => 'Đã xóa vĩnh viễn thương hiệu']);
    }
}
