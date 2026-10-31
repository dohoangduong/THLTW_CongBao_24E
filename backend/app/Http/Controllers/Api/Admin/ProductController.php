<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Review;
use App\Http\Resources\ProductResource;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
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
                'message' => 'Lỗi: Chỉ có Quản trị viên mới được phép xóa vĩnh viễn sản phẩm!'
            ], 403));
        }
    }

    // [THUẬT TOÁN TÌM KIẾM THẬT & LỌC ĐA ĐIỀU KIỆN KẾT HỢP PHÂN TRANG]:
    // Hỗ trợ tìm kiếm theo Từ khóa/SKU/Mô tả (LIKE %...%), lọc Danh mục, Thương hiệu,
    // khoảng giá thực tế COALESCE(NULLIF(sale_price, 0), price), sản phẩm Mới/Sale, và sắp xếp linh hoạt.
    public function index(Request $request)
    {
        $query = Product::with(['category', 'brand']);

        // Khách hàng vãng lai chỉ xem sản phẩm đang bán (status = 1) trừ khi gọi từ admin
        if (!$request->boolean('admin')) {
            $query->where('status', 1);
        } elseif ($request->filled('status')) {
            $query->where('status', (int) $request->status);
        }

        // Lọc theo Danh mục
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Lọc theo Thương hiệu
        if ($request->filled('brand_id')) {
            $query->where('brand_id', $request->brand_id);
        }

        // Lọc theo Loại sản phẩm: 'sale' (giảm giá thật) hoặc 'new' (mới nhất)
        $type = $request->input('type');
        if ($type === 'sale') {
            $query->whereNotNull('sale_price')
                  ->where('sale_price', '>', 0)
                  ->whereColumn('sale_price', '<', 'price');
        } elseif ($type === 'new') {
            $query->orderByDesc('id');
        }

        // Lọc theo Khoảng giá thực tế (ưu tiên sale_price nếu có, ngược lại lấy price)
        $minPrice = $request->input('min_price');
        $maxPrice = $request->input('max_price');
        if ($minPrice !== null && $maxPrice !== null && is_numeric($minPrice) && is_numeric($maxPrice)) {
            $minVal = (float) $minPrice;
            $maxVal = (float) $maxPrice;
            if ($minVal > $maxVal) {
                // Tự động hoán đổi nếu người dùng nhập ngược giá min > max
                [$minVal, $maxVal] = [$maxVal, $minVal];
            }
            $query->whereRaw('COALESCE(NULLIF(sale_price, 0), price) BETWEEN ? AND ?', [$minVal, $maxVal]);
        } elseif ($minPrice !== null && is_numeric($minPrice)) {
            $query->whereRaw('COALESCE(NULLIF(sale_price, 0), price) >= ?', [(float) $minPrice]);
        } elseif ($maxPrice !== null && is_numeric($maxPrice)) {
            $query->whereRaw('COALESCE(NULLIF(sale_price, 0), price) <= ?', [(float) $maxPrice]);
        }

        // Tìm kiếm theo từ khóa (Tên máy, Mã SKU, Mô tả)
        $search = trim((string) $request->input('search', $request->input('q', $request->input('keyword'))));
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Sắp xếp
        $sort = $request->input('sort', 'latest');
        switch ($sort) {
            case 'price_asc':
            case 'price-asc':
                $query->orderByRaw('COALESCE(NULLIF(sale_price, 0), price) ASC');
                break;
            case 'price_desc':
            case 'price-desc':
                $query->orderByRaw('COALESCE(NULLIF(sale_price, 0), price) DESC');
                break;
            case 'name_asc':
            case 'name-asc':
                $query->orderBy('name', 'asc');
                break;
            case 'name_desc':
            case 'name-desc':
                $query->orderBy('name', 'desc');
                break;
            case 'latest':
            case 'newest':
            default:
                $query->orderByDesc('id');
                break;
        }

        // Nếu yêu cầu all=1 (dùng cho select box hoặc danh sách đầy đủ)
        if ($request->boolean('all')) {
            return ProductResource::collection($query->get());
        }

        // Phân trang mặc định 9 sản phẩm/trang (chuẩn lưới 3x3)
        $perPage = (int) $request->input('per_page', 9);
        if ($perPage <= 0) {
            $perPage = 9;
        }

        $products = $query->paginate($perPage);

        return ProductResource::collection($products);
    }

    // [THUẬT TOÁN CHI TIẾT SẢN PHẨM + GỢI Ý LIÊN QUAN + ĐÁNH GIÁ REVIEW]:
    // Tải thông tin sản phẩm, kèm tối đa 4 sản phẩm liên quan (cùng danh mục/hãng) và thống kê sao đánh giá.
    public function show(Request $request, $id)
    {
        $product = Product::with(['category', 'brand'])->findOrFail($id);

        // Gợi ý sản phẩm liên quan (cùng category hoặc brand, status = 1, khác sản phẩm hiện tại)
        $relatedProducts = Product::where('status', 1)
            ->where('id', '!=', $product->id)
            ->where(function ($q) use ($product) {
                if ($product->category_id) {
                    $q->where('category_id', $product->category_id);
                }
                if ($product->brand_id) {
                    $q->orWhere('brand_id', $product->brand_id);
                }
            })
            ->with(['category', 'brand'])
            ->limit(4)
            ->get();

        // Lấy danh sách đánh giá công khai (status = 1)
        $reviews = Review::where('product_id', $product->id)
            ->where('status', 1)
            ->with('user:id,name')
            ->orderByDesc('id')
            ->get();

        $totalReviews = $reviews->count();
        $avgRating = $totalReviews > 0 ? round((float) $reviews->avg('rating'), 1) : 5.0;

        $starCounts = [
            5 => $reviews->where('rating', 5)->count(),
            4 => $reviews->where('rating', 4)->count(),
            3 => $reviews->where('rating', 3)->count(),
            2 => $reviews->where('rating', 2)->count(),
            1 => $reviews->where('rating', 1)->count(),
        ];

        return response()->json([
            'data'             => (new ProductResource($product))->resolve(),
            'related_products' => ProductResource::collection($relatedProducts),
            'reviews'          => $reviews,
            'rating_summary'   => [
                'average' => $avgRating,
                'total'   => $totalReviews,
                'stars'   => $starCounts,
            ],
        ]);
    }

    // [THUẬT TOÁN GỬI ĐÁNH GIÁ SẢN PHẨM (REVIEWS)]:
    // Tiếp nhận đánh giá, lưu số sao (1-5), nhận xét và liên kết người dùng nếu đã đăng nhập.
    public function storeReview(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'rating'         => 'required|integer|min:1|max:5',
            'comment'        => 'required|string|min:3|max:3000',
            'reviewer_name'  => 'nullable|string|max:255',
            'reviewer_email' => 'nullable|email|max:255',
        ], [
            'rating.required'  => 'Vui lòng chọn số sao đánh giá (1 đến 5 sao).',
            'rating.min'       => 'Số sao đánh giá tối thiểu là 1 sao.',
            'rating.max'       => 'Số sao đánh giá tối đa là 5 sao.',
            'comment.required' => 'Vui lòng nhập nội dung nhận xét đánh giá sản phẩm.',
            'comment.min'      => 'Nội dung nhận xét phải có ít nhất 3 ký tự.',
        ]);

        $user = auth('sanctum')->user();

        $reviewerName = !empty($validated['reviewer_name']) 
            ? $validated['reviewer_name'] 
            : ($user ? $user->name : 'Khách hàng thân thiết');

        $reviewerEmail = !empty($validated['reviewer_email']) 
            ? $validated['reviewer_email'] 
            : ($user ? $user->email : null);

        $review = Review::create([
            'product_id'     => $product->id,
            'user_id'        => $user ? $user->id : null,
            'reviewer_name'  => $reviewerName,
            'reviewer_email' => $reviewerEmail,
            'rating'         => (int) $validated['rating'],
            'comment'        => $validated['comment'],
            'status'         => 1, // Hiển thị ngay trên hệ thống
        ]);

        return response()->json([
            'message' => 'Cảm ơn bạn đã gửi đánh giá! Nhận xét của bạn đã được ghi nhận vào hệ thống.',
            'data'    => $review,
        ], 201);
    }

    /**
     * POST /api/products - Thêm mới
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        $this->checkStaffAccess(); // Cho phép Admin và Manager

        $data = $request->validated();
        if (empty($data['slug'])) {
            $data['slug'] = \Illuminate\Support\Str::slug($data['name']);
        }

        // Xử lý upload ảnh nếu có
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $uploadDir = public_path('images/products');
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move($uploadDir, $filename);
            $data['image'] = '/images/products/' . $filename;
        }

        // Mặc định trạng thái là 1 nếu chưa chọn
        if (!isset($data['status'])) {
            $data['status'] = 1;
        } else {
            $data['status'] = (int) $data['status'];
        }

        $product = Product::create($data);
        
        return response()->json([
            'message' => 'Thêm sản phẩm thành công',
            'data' => new ProductResource($product)
        ], 201);
    }

    /**
     * PUT /api/products/{id} - Sửa (Cập nhật)
     */
    public function update(UpdateProductRequest $request, $id): JsonResponse
    {
        $this->checkStaffAccess(); // Cho phép Admin và Manager

        $data = $request->validated();
        if (isset($data['name']) && empty($data['slug'])) {
            $data['slug'] = \Illuminate\Support\Str::slug($data['name']);
        }

        // Xử lý upload ảnh nếu có file mới
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $uploadDir = public_path('images/products');
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move($uploadDir, $filename);
            $data['image'] = '/images/products/' . $filename;
        } elseif (!$request->has('image') || empty($request->image)) {
            // Giữ nguyên ảnh cũ nếu không gửi ảnh mới
            unset($data['image']);
        }

        if (isset($data['status'])) {
            $data['status'] = (int) $data['status'];
        }

        $product = Product::findOrFail($id);
        $product->update($data);

        return response()->json([
            'message' => 'Cập nhật sản phẩm thành công',
            'data' => new ProductResource($product)
        ]);
    }

    /**
     * DELETE /api/products/{id} - Xóa mềm sản phẩm (Soft Delete)
     */
    public function destroy($id): JsonResponse
    {
        $this->checkStaffAccess();

        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json([
            'message' => 'Đã chuyển sản phẩm vào thùng rác thành công'
        ]);
    }

    /**
     * GET /api/products/trash - Danh sách sản phẩm trong thùng rác
     */
    public function trash()
    {
        $products = Product::onlyTrashed()
            ->with(['category', 'brand'])
            ->orderBy('deleted_at', 'desc')
            ->get();

        return ProductResource::collection($products);
    }

    /**
     * PUT /api/products/{id}/restore - Khôi phục sản phẩm
     */
    public function restore($id): JsonResponse
    {
        $this->checkStaffAccess();

        $product = Product::onlyTrashed()->findOrFail($id);
        $product->restore();

        return response()->json([
            'message' => 'Khôi phục sản phẩm thành công',
            'data' => new ProductResource($product)
        ]);
    }

    /**
     * DELETE /api/products/{id}/force-delete - Xóa vĩnh viễn sản phẩm
     */
    public function forceDelete($id): JsonResponse
    {
        $this->checkAdminOnlyAccess();

        $product = Product::onlyTrashed()->findOrFail($id);
        $product->forceDelete();

        return response()->json([
            'message' => 'Đã xóa vĩnh viễn sản phẩm thành công'
        ]);
    }
}
