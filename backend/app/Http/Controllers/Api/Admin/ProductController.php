<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Http\Resources\ProductResource;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

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

    /**
     * GET /api/products - Danh sách sản phẩm (có kèm danh mục và thương hiệu)
     */
    public function index(\Illuminate\Http\Request $request)
    {
        $query = Product::with(['category', 'brand']);

        // Khách hàng vãng lai chỉ xem sản phẩm đang bán (status = 1) trừ khi gọi từ admin
        if (!$request->boolean('admin')) {
            $query->where('status', 1);
        } elseif ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Lọc theo danh mục
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Lọc theo thương hiệu
        if ($request->filled('brand_id')) {
            $query->where('brand_id', $request->brand_id);
        }

        // Tìm kiếm theo từ khóa
        $search = $request->input('search', $request->input('q', $request->input('keyword')));
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Sắp xếp
        $sort = $request->input('sort', 'newest');
        switch ($sort) {
            case 'price-asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price-desc':
                $query->orderBy('price', 'desc');
                break;
            default:
                $query->orderByDesc('id');
                break;
        }

        // Nếu yêu cầu all=1 (dùng cho select box hoặc danh sách đầy đủ)
        if ($request->boolean('all')) {
            return ProductResource::collection($query->get());
        }

        $perPage = (int) $request->input('per_page', 15);
        $products = $query->paginate($perPage);

        return ProductResource::collection($products);
    }
    
    /**
     * GET /api/products/{id} - Chi tiết 1 sản phẩm
     */
    public function show($id): ProductResource
    {
        $product = Product::with(['category', 'brand'])
            ->findOrFail($id);
            
        return new ProductResource($product);
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
        ]); // Mặc định trả về status 200
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