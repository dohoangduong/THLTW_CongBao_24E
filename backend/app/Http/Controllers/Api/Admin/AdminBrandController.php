<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Support\Slug;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminBrandController extends Controller
{
    // GET /api/admin/brands?q=&page=
    public function index(Request $request)
    {
        $query = Brand::query()
            ->addSelect([
                'products_count' => DB::table('products')
                    ->selectRaw('count(*)')
                    ->whereColumn('products.brand_id', 'brands.id')
                    ->whereNull('products.deleted_at'),
            ])
            ->orderByDesc('id');

        if ($request->filled('q')) {
            $q = $request->q;
            $query->where(function ($w) use ($q) {
                $w->where('name', 'like', "%$q%")->orWhere('slug', 'like', "%$q%");
            });
        }

        return response()->json($query->paginate(10));
    }

    // POST /api/admin/brands
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'slug'        => 'nullable|string|max:255|unique:brands,slug',
            'description' => 'nullable|string',
            'image'       => 'nullable|image|mimes:jpeg,png,jpg,webp,gif|max:2048',
            'status'      => 'nullable|boolean',
        ]);

        $brand = new Brand();
        $imagePath = $request->hasFile('image')
            ? $this->storeImage($request->file('image'), 'brands')
            : null;
        $brand->forceFill([
            'name'        => $data['name'],
            'slug'        => !empty($data['slug']) ? Str::slug($data['slug']) : Slug::unique('brands', $data['name']),
            'description' => $data['description'] ?? null,
            'image'       => $imagePath,
            'status'      => (int) ($data['status'] ?? 1),
        ])->save();

        return response()->json(['message' => 'Thêm thương hiệu thành công', 'data' => $brand], 201);
    }

    // PUT /api/admin/brands/{id}
    public function update(Request $request, $id)
    {
        $brand = Brand::find($id);
        if (!$brand) {
            return response()->json(['message' => 'Không tìm thấy thương hiệu'], 404);
        }

        $data = $request->validate([
            'name'        => 'sometimes|required|string|max:255',
            'slug'        => ['nullable', 'string', 'max:255', Rule::unique('brands', 'slug')->ignore($brand->id)],
            'description' => 'nullable|string',
            'image'        => 'nullable|image|mimes:jpeg,png,jpg,webp,gif|max:2048',
            'remove_image' => 'nullable|boolean',
            'status'      => 'sometimes|boolean',
        ]);

        $attrs = [];
        foreach (['name', 'description'] as $key) {
            if (array_key_exists($key, $data)) {
                $attrs[$key] = $data[$key];
            }
        }
        if ($request->hasFile('image')) {
            $attrs['image'] = $this->storeImage($request->file('image'), 'brands', $brand->image);
        } elseif ($request->boolean('remove_image')) {
            $this->deleteImage($brand->image);
            $attrs['image'] = null;
        }
        if (!empty($data['slug'])) {
            $attrs['slug'] = Str::slug($data['slug']);
        }
        if (array_key_exists('status', $data)) {
            $attrs['status'] = (int) $data['status'];
        }

        $brand->forceFill($attrs)->save();

        return response()->json(['message' => 'Cập nhật thương hiệu thành công', 'data' => $brand->fresh()]);
    }

    // DELETE /api/admin/brands/{id}
    public function destroy($id)
    {
        $brand = Brand::find($id);
        if (!$brand) {
            return response()->json(['message' => 'Không tìm thấy thương hiệu'], 404);
        }

        if (DB::table('products')->where('brand_id', $id)->exists()) {
            return response()->json([
                'message' => 'Thương hiệu đang có sản phẩm, hãy chuyển sản phẩm sang thương hiệu khác hoặc ẩn thương hiệu thay vì xóa',
            ], 409);
        }

        $brand->delete();

        return response()->json(['message' => 'Xóa thương hiệu thành công']);
    }
}
