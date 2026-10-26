<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    
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

            $query->orderByDesc('id');
        } else {
            $query->active();
            $this->applyPublicFilters($query, $request);
        }

        $perPage = min(max((int) $request->input('per_page', 15), 1), 100);

        return ProductResource::collection($query->paginate($perPage));
    }

    /**
     * GET /api/home — dữ liệu cho trang chủ trong 1 lần gọi:
     *  - new  : sản phẩm mới nhất
     *  - sale : sản phẩm đang giảm giá (giảm nhiều nhất lên đầu)
     *  - hot  : sản phẩm nổi bật (admin tick "Sản phẩm nổi bật"), sau đó là sản phẩm nhiều lượt xem
     *  ?limit=... số sản phẩm mỗi mục (1–24, mặc định 8)
     */
    public function home(Request $request)
    {
        $limit = min(max((int) $request->input('limit', 8), 1), 24);

        $base = fn () => Product::with(['category:id,name,slug', 'brand:id,name,slug'])->active();

        $new  = $this->applyFilter($base(), 'new')->limit($limit)->get();
        $sale = $this->applyFilter($base(), 'sale')->limit($limit)->get();
        $hot  = $this->applyFilter($base(), 'hot')->limit($limit)->get();

        return response()->json([
            'new'  => ProductResource::collection($new)->resolve(),
            'sale' => ProductResource::collection($sale)->resolve(),
            'hot'  => ProductResource::collection($hot)->resolve(),
        ]);
    }

    /** Biểu thức SQL: giá bán thực tế (giá khuyến mãi hợp lệ, nếu không thì giá gốc). */
    private const FINAL_PRICE = 'CASE WHEN sale_price IS NOT NULL AND sale_price > 0 AND sale_price < price THEN sale_price ELSE price END';

    private function applyPublicFilters($query, Request $request): void
    {
        if ($keyword = trim((string) $request->input('q'))) {
            $query->where(function ($q) use ($keyword) {
                $q->where('name', 'like', "%{$keyword}%")
                  ->orWhere('sku', 'like', "%{$keyword}%");
            });
        }

        if ($request->filled('category_id')) {
            $categoryId = (int) $request->input('category_id');
            // Chọn danh mục cha thì lấy luôn sản phẩm của các danh mục con
            $ids = Category::where('id', $categoryId)
                ->orWhere('parent_id', $categoryId)
                ->pluck('id');
            $query->whereIn('category_id', $ids);
        }

        if ($request->filled('brand_id')) {
            $query->where('brand_id', (int) $request->input('brand_id'));
        }

        $filter = (string) $request->input('filter', '');
        $sort   = (string) $request->input('sort', '');

        if (in_array($filter, ['sale', 'hot'], true)) {
            $this->applyFilter($query, $filter);
        }

        match ($sort) {
            'price-asc'  => $query->reorder()->orderByRaw(self::FINAL_PRICE . ' ASC')->orderByDesc('id'),
            'price-desc' => $query->reorder()->orderByRaw(self::FINAL_PRICE . ' DESC')->orderByDesc('id'),
            'popular'    => $query->reorder()->orderByDesc('views')->orderByDesc('id'),
            default      => $query->getQuery()->orders ? null : $query->orderByDesc('id'),
        };
    }

    /** Áp điều kiện + thứ tự mặc định cho từng mục: new / sale / hot. */
    private function applyFilter($query, string $filter)
    {
        return match ($filter) {
            'sale' => $query
                ->whereNotNull('sale_price')
                ->where('sale_price', '>', 0)
                ->whereColumn('sale_price', '<', 'price')
                ->orderByRaw('(price - sale_price) / NULLIF(price, 0) DESC')
                ->orderByDesc('id'),
            'hot'  => $query->orderByDesc('featured')->orderByDesc('views')->orderByDesc('id'),
            default => $query->orderByDesc('id'),   // new
        };
    }

    /** GET /api/products/{id} */
    public function show($id)
    {
        $product = Product::with(['category', 'brand'])->findOrFail($id);

        if (! $this->isAdmin()) {
            // Khách không xem được sản phẩm đang ẩn; mỗi lượt xem được cộng vào cột views (dùng cho mục "hot")
            abort_if($product->status !== 1, 404);
            $product->increment('views');
        }

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
