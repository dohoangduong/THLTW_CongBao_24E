<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * GET /api/categories
     *  - Khách (public):  chỉ danh mục đang hiển thị, dạng cây cha -> con.
     *  - Admin (?admin=1): tất cả danh mục dạng phẳng; thêm ?trashed=1 để xem thùng rác.
     */
    public function index(Request $request)
    {
        if ($request->boolean('admin')) {
            $this->requireAdmin();

            $query = Category::with('parent:id,name')->withCount('products');

            if ($request->boolean('trashed')) {
                $query->onlyTrashed();
            }

            return CategoryResource::collection(
                $query->orderBy('sort_order')->orderByDesc('id')->get()
            );
        }

        $categories = Category::active()
            ->whereNull('parent_id')
            ->with(['children' => fn ($q) => $q->active()])
            ->orderBy('sort_order')
            ->get();

        return CategoryResource::collection($categories);
    }

    /** GET /api/categories/{id} */
    public function show($id)
    {
        $category = Category::with('children')->findOrFail($id);

        return new CategoryResource($category);
    }

    /** POST /api/categories */
    public function store(StoreCategoryRequest $request)
    {
        $data = $request->safe()->except(['image', 'remove_image']);

        if ($request->hasFile('image')) {
            $data['image'] = $this->storeImage($request->file('image'), 'categories');
        }

        $category = Category::create($data);   // slug được HasSlug tự sinh nếu để trống

        return response()->json([
            'message' => 'Thêm danh mục thành công',
            'data'    => new CategoryResource($category),
        ], 201);
    }

    /** PUT /api/categories/{id}  (frontend gửi POST + _method=PUT vì có upload file) */
    public function update(UpdateCategoryRequest $request, $id)
    {
        $category = Category::findOrFail($id);
        $data = $request->safe()->except(['image', 'remove_image']);

        if ($request->hasFile('image')) {
            $data['image'] = $this->storeImage($request->file('image'), 'categories', $category->image);
        } elseif ($request->boolean('remove_image')) {
            $this->deleteImage($category->image);
            $data['image'] = null;
        }

        $category->update($data);

        return response()->json([
            'message' => 'Cập nhật danh mục thành công',
            'data'    => new CategoryResource($category->fresh()),
        ]);
    }

    /** PATCH /api/categories/{id}/toggle-status — Bật / tắt hiển thị */
    public function toggleStatus($id)
    {
        $this->requireAdmin();

        $category = Category::findOrFail($id);
        $category->update(['status' => $category->status ? 0 : 1]);

        return response()->json([
            'message' => $category->status ? 'Đã hiển thị danh mục' : 'Đã ẩn danh mục',
            'data'    => new CategoryResource($category),
        ]);
    }

    /** DELETE /api/categories/{id} — Xóa mềm (chuyển vào thùng rác) */
    public function destroy($id)
    {
        $this->requireAdmin();

        $category = Category::findOrFail($id);

        if ($category->products()->exists()) {
            return response()->json([
                'message' => 'Không thể xóa: danh mục còn ' . $category->products()->count() . ' sản phẩm. Hãy chuyển hoặc xóa các sản phẩm trước.',
            ], 409);
        }

        if ($category->children()->exists()) {
            return response()->json([
                'message' => 'Không thể xóa: danh mục còn danh mục con. Hãy xóa hoặc chuyển danh mục con trước.',
            ], 409);
        }

        $category->delete();

        return response()->json(['message' => 'Đã chuyển danh mục vào thùng rác']);
    }

    /** POST /api/categories/{id}/restore — Khôi phục từ thùng rác */
    public function restore($id)
    {
        $this->requireAdmin();

        $category = Category::onlyTrashed()->findOrFail($id);
        $category->restore();

        return response()->json([
            'message' => 'Khôi phục danh mục thành công',
            'data'    => new CategoryResource($category),
        ]);
    }

    /** DELETE /api/categories/{id}/force — Xóa vĩnh viễn (chỉ áp dụng cho mục đã ở thùng rác) */
    public function forceDelete($id)
    {
        $this->requireAdmin();

        $category = Category::onlyTrashed()->findOrFail($id);

        // Cột products.category_id có khóa ngoại RESTRICT: còn sản phẩm (kể cả trong thùng rác) thì DB sẽ báo lỗi 1451
        if ($category->products()->withTrashed()->exists()) {
            return response()->json([
                'message' => 'Không thể xóa vĩnh viễn: vẫn còn sản phẩm thuộc danh mục này (kể cả trong thùng rác).',
            ], 409);
        }

        // Danh mục con (nếu có) trở thành danh mục gốc
        Category::withTrashed()->where('parent_id', $category->id)->update(['parent_id' => null]);

        $this->deleteImage($category->image);
        $category->forceDelete();

        return response()->json(['message' => 'Đã xóa vĩnh viễn danh mục']);
    }
}
