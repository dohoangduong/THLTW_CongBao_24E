<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Support\Slug;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminProductController extends Controller
{
    // GET /api/admin/options - danh sách danh mục + thương hiệu cho ô chọn trong form
    public function options()
    {
        return response()->json([
            'categories' => DB::table('categories')->whereNull('deleted_at')->orderBy('name')->get(['id', 'name']),
            'brands'     => DB::table('brands')->whereNull('deleted_at')->orderBy('name')->get(['id', 'name']),
        ]);
    }

    // GET /api/admin/products?q=&category_id=&brand_id=&page=
    public function index(Request $request)
    {
        $query = Product::with(['category:id,name', 'brand:id,name'])->orderByDesc('id');

        if ($request->filled('q')) {
            $q = $request->q;
            $query->where(function ($w) use ($q) {
                $w->where('name', 'like', "%$q%")
                  ->orWhere('sku', 'like', "%$q%")
                  ->orWhere('slug', 'like', "%$q%");
            });
        }
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->filled('brand_id')) {
            $query->where('brand_id', $request->brand_id);
        }

        return response()->json($query->paginate(10));
    }

    // POST /api/admin/products
    public function store(Request $request)
    {
        $data = $request->validate([
            'category_id' => 'required|integer|exists:categories,id',
            'brand_id'    => 'required|integer|exists:brands,id',
            'name'        => 'required|string|max:255',
            'slug'        => 'nullable|string|max:255|unique:products,slug',
            'sku'         => 'nullable|string|max:100|unique:products,sku',
            'description' => 'nullable|string',
            'image'       => 'nullable|string|max:500',
            'price'       => 'required|numeric|min:0',
            'sale_price'  => 'nullable|numeric|min:0|lt:price',
            'stock'       => 'nullable|integer|min:0',
            'status'      => 'nullable|boolean',
            'featured'    => 'nullable|boolean',
        ]);

        $product = new Product();
        $product->forceFill([
            'category_id' => $data['category_id'],
            'brand_id'    => $data['brand_id'],
            'name'        => $data['name'],
            'slug'        => !empty($data['slug']) ? Str::slug($data['slug']) : Slug::unique('products', $data['name']),
            'sku'         => $data['sku'] ?? null,
            'description' => $data['description'] ?? null,
            'image'       => $data['image'] ?? null,
            'price'       => $data['price'],
            'sale_price'  => $data['sale_price'] ?? null,
            'stock'       => (int) ($data['stock'] ?? 0),
            'status'      => (int) ($data['status'] ?? 1),
            'featured'    => (int) ($data['featured'] ?? 0),
        ])->save();

        return response()->json([
            'message' => 'Thêm sản phẩm thành công',
            'data'    => $product->load(['category:id,name', 'brand:id,name']),
        ], 201);
    }

    // PUT /api/admin/products/{id}
    public function update(Request $request, $id)
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['message' => 'Không tìm thấy sản phẩm'], 404);
        }

        $data = $request->validate([
            'category_id' => 'sometimes|required|integer|exists:categories,id',
            'brand_id'    => 'sometimes|required|integer|exists:brands,id',
            'name'        => 'sometimes|required|string|max:255',
            'slug'        => ['nullable', 'string', 'max:255', Rule::unique('products', 'slug')->ignore($product->id)],
            'sku'         => ['nullable', 'string', 'max:100', Rule::unique('products', 'sku')->ignore($product->id)],
            'description' => 'nullable|string',
            'image'       => 'nullable|string|max:500',
            'price'       => 'sometimes|required|numeric|min:0',
            'sale_price'  => 'nullable|numeric|min:0|lt:price',
            'stock'       => 'nullable|integer|min:0',
            'status'      => 'sometimes|boolean',
            'featured'    => 'sometimes|boolean',
        ]);

        $attrs = [];
        foreach (['category_id', 'brand_id', 'name', 'sku', 'description', 'image', 'price', 'sale_price'] as $key) {
            if (array_key_exists($key, $data)) {
                $attrs[$key] = $data[$key];
            }
        }
        if (!empty($data['slug'])) {
            $attrs['slug'] = Str::slug($data['slug']);
        }
        if (array_key_exists('stock', $data)) {
            $attrs['stock'] = (int) ($data['stock'] ?? 0);
        }
        foreach (['status', 'featured'] as $key) {
            if (array_key_exists($key, $data)) {
                $attrs[$key] = (int) $data[$key];
            }
        }

        $product->forceFill($attrs)->save();

        return response()->json([
            'message' => 'Cập nhật sản phẩm thành công',
            'data'    => $product->fresh(['category:id,name', 'brand:id,name']),
        ]);
    }

    // DELETE /api/admin/products/{id}
    public function destroy($id)
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['message' => 'Không tìm thấy sản phẩm'], 404);
        }

        // Các đơn hàng cũ vẫn giữ tên và giá sản phẩm (bảng order_details lưu bản sao)
        $product->delete();

        return response()->json(['message' => 'Xóa sản phẩm thành công']);
    }
}
