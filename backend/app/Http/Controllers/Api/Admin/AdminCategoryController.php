<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Support\Slug;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminCategoryController extends Controller
{
    // GET /api/admin/categories?q=&page=
    public function index(Request $request)
    {
        $query = Category::query()
            ->addSelect([
                'products_count' => DB::table('products')
                    ->selectRaw('count(*)')
                    ->whereColumn('products.category_id', 'categories.id')
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

    // POST /api/admin/categories
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'slug'        => 'nullable|string|max:255|unique:categories,slug',
            'description' => 'nullable|string',
            'image'       => 'nullable|string|max:500',
            'status'      => 'nullable|boolean',
        ]);

        $category = new Category();
        $category->forceFill([
            'name'        => $data['name'],
            'slug'        => !empty($data['slug']) ? Str::slug($data['slug']) : Slug::unique('categories', $data['name']),
            'description' => $data['description'] ?? null,
            'image'       => $data['image'] ?? null,
            'status'      => (int) ($data['status'] ?? 1),
        ])->save();

        return response()->json(['message' => 'Thêm danh mục thành công', 'data' => $category], 201);
    }

    // PUT /api/admin/categories/{id}
    public function update(Request $request, $id)
    {
        $category = Category::find($id);
        if (!$category) {
            return response()->json(['message' => 'Không tìm thấy danh mục'], 404);
        }

        $data = $request->validate([
            'name'        => 'sometimes|required|string|max:255',
            'slug'        => ['nullable', 'string', 'max:255', Rule::unique('categories', 'slug')->ignore($category->id)],
            'description' => 'nullable|string',
            'image'       => 'nullable|string|max:500',
            'status'      => 'sometimes|boolean',
        ]);

        $attrs = [];
        foreach (['name', 'description', 'image'] as $key) {
            if (array_key_exists($key, $data)) {
                $attrs[$key] = $data[$key];
            }
        }
        if (!empty($data['slug'])) {
            $attrs['slug'] = Str::slug($data['slug']);
        }
        if (array_key_exists('status', $data)) {
            $attrs['status'] = (int) $data['status'];
        }

        $category->forceFill($attrs)->save();

        return response()->json(['message' => 'Cập nhật danh mục thành công', 'data' => $category->fresh()]);
    }

    // DELETE /api/admin/categories/{id}
    public function destroy($id)
    {
        $category = Category::find($id);
        if (!$category) {
            return response()->json(['message' => 'Không tìm thấy danh mục'], 404);
        }

        if (DB::table('products')->where('category_id', $id)->exists()) {
            return response()->json([
                'message' => 'Danh mục đang có sản phẩm, hãy chuyển sản phẩm sang danh mục khác hoặc ẩn danh mục thay vì xóa',
            ], 409);
        }

        $category->delete();

        return response()->json(['message' => 'Xóa danh mục thành công']);
    }
}
