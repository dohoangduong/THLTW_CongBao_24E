<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * GET /api/products
     *  - Khách (public):   chỉ sản phẩm đang hiển thị.
     *  - Admin (?admin=1): tất cả; ?trashed=1 xem thùng rác; ?q=... tìm theo tên / SKU.
     *  - ?per_page=... (1–100, mặc định 15) và ?page=...
     */
    public function index(Request $request)
    {
        $query = Product::with(['category:id,name,slug', 'brand:id,name,slug']);

        if ($request->boolean('admin')) {
            $this->requireAdmin();

            if ($request->boolean('trashed')) {
                $query->onlyTrashed();
            }

            if ($keyword = trim((string) $request->input('q'))) {
                $query->where(function ($q) use ($keyword) {
                    $q->where('name', 'like', "%{$keyword}%")
                      ->orWhere('sku', 'like', "%{$keyword}%");
                });
            }
        } else {
            $query->active();
        }

        $perPage = min(max((int) $request->input('per_page', 15), 1), 100);

        return ProductResource::collection($query->orderByDesc('id')->paginate($perPage));
    }

    /** GET /api/products/{id} */
    public function show($id)
    {
        $product = Product::with(['category', 'brand'])->findOrFail($id);

        return new ProductResource($product);
    }

    /** POST /api/products */
    public function store(StoreProductRequest $request)
    {
        $data = $request->safe()->except(['image', 'remove_image']);

        if ($request->hasFile('image')) {
            $data['image'] = $this->storeImage($request->file('image'), 'products');
        }

        $product = Product::create($data)->load(['category', 'brand']);

        return response()->json([
            'message' => 'Thêm sản phẩm thành công',
            'data'    => new ProductResource($product),
        ], 201);
    }

    /** PUT /api/products/{id} */
    public function update(UpdateProductRequest $request, $id)
    {
        $product = Product::findOrFail($id);
        $data = $request->safe()->except(['image', 'remove_image']);

        if ($request->hasFile('image')) {
            $data['image'] = $this->storeImage($request->file('image'), 'products', $product->image);
        } elseif ($request->boolean('remove_image')) {
            $this->deleteImage($product->image);
            $data['image'] = null;
        }

        $product->update($data);

        return response()->json([
            'message' => 'Cập nhật sản phẩm thành công',
            'data'    => new ProductResource($product->fresh(['category', 'brand'])),
        ]);
    }

    /** PATCH /api/products/{id}/toggle-status — Bật / tắt hiển thị */
    public function toggleStatus($id)
    {
        $this->requireAdmin();

        $product = Product::findOrFail($id);
        $product->update(['status' => $product->status ? 0 : 1]);

        return response()->json([
            'message' => $product->status ? 'Đã hiển thị sản phẩm' : 'Đã ẩn sản phẩm',
            'data'    => new ProductResource($product->load(['category', 'brand'])),
        ]);
    }

    /** DELETE /api/products/{id} — Xóa mềm */
    public function destroy($id)
    {
        $this->requireAdmin();

        Product::findOrFail($id)->delete();

        return response()->json(['message' => 'Đã chuyển sản phẩm vào thùng rác']);
    }

    /** POST /api/products/{id}/restore */
    public function restore($id)
    {
        $this->requireAdmin();

        $product = Product::onlyTrashed()->findOrFail($id);
        $product->restore();

        return response()->json([
            'message' => 'Khôi phục sản phẩm thành công',
            'data'    => new ProductResource($product->load(['category', 'brand'])),
        ]);
    }

    /** DELETE /api/products/{id}/force — Xóa vĩnh viễn (xóa luôn file ảnh) */
    public function forceDelete($id)
    {
        $this->requireAdmin();

        $product = Product::onlyTrashed()->findOrFail($id);

        $this->deleteImage($product->image);
        $product->forceDelete();   // cart_items tự xóa theo (CASCADE), order_details giữ lại với product_id = NULL

        return response()->json(['message' => 'Đã xóa vĩnh viễn sản phẩm']);
    }
}
