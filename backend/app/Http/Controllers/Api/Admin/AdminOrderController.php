<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminOrderController extends Controller
{
    private const STATUSES = ['pending', 'confirmed', 'processing', 'shipping', 'completed', 'cancelled'];

    // Luồng chuyển trạng thái hợp lệ
    private const FLOW = [
        'pending'    => ['confirmed', 'cancelled'],
        'confirmed'  => ['processing', 'cancelled'],
        'processing' => ['shipping', 'cancelled'],
        'shipping'   => ['completed', 'cancelled'],
        'completed'  => [],
        'cancelled'  => [],
    ];

    /**
     * Kiểm tra quyền Nhân viên/Quản lý: Admin và Manager đều có quyền truy cập
     */
    private function checkStaffAccess(): void
    {
        $user = auth('sanctum')->user();
        if (!$user || !in_array($user->role, ['admin', 'manager'])) {
            abort(response()->json([
                'message' => 'Lỗi: Bạn không có quyền truy cập vào Module Đơn hàng!'
            ], 403));
        }
    }

    /**
     * Chỉ Super Admin mới được xóa vĩnh viễn
     */
    private function checkAdminOnlyAccess(): void
    {
        $user = auth('sanctum')->user();
        if (!$user || $user->role !== 'admin') {
            abort(response()->json([
                'message' => 'Lỗi: Chỉ Quản trị viên (Admin) mới có quyền xóa vĩnh viễn đơn hàng!'
            ], 403));
        }
    }

    // GET /api/admin/stats - Thống kê tổng quan hệ thống
    public function stats()
    {
        $this->checkStaffAccess();

        return response()->json([
            'orders_total'   => Order::count(),
            'orders_pending' => Order::where('status', 'pending')->count(),
            'revenue'        => (float) Order::where('status', 'completed')->sum('total'),
            'users_total'    => User::where('role', 'customer')->count(),
            'products_total' => Product::count(),
            'low_stock'      => Product::where('stock', '<=', 5)->count(),
        ]);
    }

    // GET /api/admin/orders - Danh sách đơn hàng có tìm kiếm, lọc theo trạng thái, KHOẢNG THỜI GIAN và phân trang
    public function index(Request $request)
    {
        $this->checkStaffAccess();

        $query = Order::withCount('details')->orderByDesc('id');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // BỘ LỌC KHOẢNG THỜI GIAN (Từ ngày - Đến ngày)
        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        $q = $request->input('q', $request->input('search'));
        if ($q) {
            $query->where(function ($w) use ($q) {
                $w->where('order_code', 'like', "%{$q}%")
                  ->orWhere('customer_name', 'like', "%{$q}%")
                  ->orWhere('customer_phone', 'like', "%{$q}%")
                  ->orWhere('customer_email', 'like', "%{$q}%");
            });
        }

        $perPage = (int) $request->input('per_page', 10);
        return response()->json($query->paginate($perPage));
    }

    // GET /api/admin/orders/{id} - Xem chi tiết 1 đơn hàng kèm lịch sử trạng thái
    public function show($id)
    {
        $this->checkStaffAccess();

        $order = Order::with(['details.product', 'user:id,name,email,phone', 'statusHistories'])->find($id);

        if (!$order) {
            return response()->json(['message' => 'Không tìm thấy đơn hàng'], 404);
        }

        return response()->json(['data' => $order]);
    }

    // PUT /api/admin/orders/{id}/status - Cập nhật trạng thái đơn hàng (Tự động hoàn tồn kho khi hủy đơn)
    public function updateStatus(Request $request, $id)
    {
        $this->checkStaffAccess();

        $data = $request->validate([
            'status'         => 'required|in:' . implode(',', self::STATUSES),
            'payment_status' => 'nullable|in:pending,paid,failed,refunded',
            'note'           => 'nullable|string|max:1000',
        ]);

        $order = Order::with('details')->find($id);
        if (!$order) {
            return response()->json(['message' => 'Không tìm thấy đơn hàng'], 404);
        }

        $new = $data['status'];
        $user = auth('sanctum')->user();

        // Kiểm tra luồng chuyển trạng thái hợp lệ nếu trạng thái thay đổi
        if ($new !== $order->status && isset(self::FLOW[$order->status]) && !in_array($new, self::FLOW[$order->status], true)) {
            // Cho phép Admin can thiệp nếu cần, nếu là manager thì bắt buộc theo luồng
            if ($user->role !== 'admin') {
                return response()->json([
                    'message' => "Không thể chuyển trạng thái từ «{$order->status}» sang «{$new}»",
                ], 422);
            }
        }

        $adminName = $user ? "{$user->name} ({$user->role})" : 'Admin System';

        $statusLabels = [
            'pending'    => 'Chờ xác nhận',
            'confirmed'  => 'Đã xác nhận',
            'processing' => 'Đang chuẩn bị',
            'shipping'   => 'Đang giao hàng',
            'completed'  => 'Hoàn tất giao hàng',
            'cancelled'  => 'Đã hủy đơn hàng',
        ];
        $label = $statusLabels[$new] ?? $new;

        DB::transaction(function () use ($order, $new, $data, $adminName, $label) {
            $update = ['status' => $new];

            // [THUẬT TOÁN HOÀN KHO KHI ADMIN HỦY ĐƠN (FUNC-ADM-ORDER-04)]:
            // Nếu hủy đơn thì hoàn trả tồn kho về cho sản phẩm
            if ($new === 'cancelled' && $order->status !== 'cancelled') {
                foreach ($order->details as $d) {
                    if ($d->product_id) {
                        Product::where('id', $d->product_id)->increment('stock', $d->quantity);
                    }
                }
            }

            // Giao thành công với đơn COD -> cập nhật đã thanh toán
            if ($new === 'completed' && $order->payment_method === 'cod') {
                $update['payment_status'] = 'paid';
            }

            if (!empty($data['payment_status'])) {
                $update['payment_status'] = $data['payment_status'];
            }
            if (isset($data['note'])) {
                $update['note'] = $data['note'];
            }

            // Ghi nhật ký vào bảng order_status_histories
            OrderStatusHistory::create([
                'order_id'   => $order->id,
                'status'     => $new,
                'note'       => $data['note'] ?? "Quản trị viên chuyển trạng thái sang: {$label}",
                'changed_by' => $adminName,
                'created_at' => now(),
            ]);

            // Cập nhật cả cột JSON status_history
            $history = $order->status_history ?? [];
            $history[] = [
                'status'     => $new,
                'note'       => $data['note'] ?? "Quản trị viên chuyển trạng thái sang: {$label}",
                'changed_by' => $adminName,
                'time'       => now()->toIso8601String(),
            ];
            $update['status_history'] = $history;

            $order->update($update);
        });

        return response()->json([
            'message' => 'Cập nhật trạng thái đơn hàng thành công',
            'data'    => $order->fresh(['details.product', 'user', 'statusHistories']),
        ]);
    }

    // PUT /api/admin/orders/{id} - Sửa thông tin đơn hàng
    public function update(Request $request, $id)
    {
        $this->checkStaffAccess();

        $order = Order::with('details')->find($id);
        if (!$order) {
            return response()->json(['message' => 'Không tìm thấy đơn hàng'], 404);
        }

        $data = $request->validate([
            'customer_name'    => 'sometimes|required|string|max:255',
            'customer_phone'   => 'sometimes|required|string|max:20',
            'customer_email'   => 'nullable|email|max:255',
            'shipping_address' => 'sometimes|required|string|max:500',
            'note'             => 'nullable|string|max:1000',
            'status'           => 'nullable|in:' . implode(',', self::STATUSES),
            'payment_status'   => 'nullable|in:pending,paid,failed,refunded',
            'payment_method'   => 'nullable|in:cod,bank_transfer,momo,vnpay',
        ]);

        if (isset($data['status']) && $data['status'] === 'cancelled' && $order->status !== 'cancelled') {
            foreach ($order->details as $d) {
                if ($d->product_id) {
                    Product::where('id', $d->product_id)->increment('stock', $d->quantity);
                }
            }
        }

        $order->update($data);

        return response()->json([
            'message' => 'Cập nhật đơn hàng thành công',
            'data'    => $order->fresh(['details.product', 'user', 'statusHistories']),
        ]);
    }

    // DELETE /api/admin/orders/{id} - Xóa mềm đơn hàng
    public function destroy($id)
    {
        $this->checkStaffAccess();

        $order = Order::findOrFail($id);
        $order->delete();

        return response()->json(['message' => 'Đã chuyển đơn hàng vào thùng rác thành công']);
    }

    // GET /api/admin/orders/trash - Danh sách đơn hàng trong thùng rác
    public function trash(Request $request)
    {
        $this->checkStaffAccess();

        $query = Order::onlyTrashed()->withCount('details')->orderByDesc('deleted_at');
        $perPage = (int) $request->input('per_page', 10);

        if ($request->boolean('all')) {
            return response()->json(['data' => $query->get()]);
        }

        return response()->json($query->paginate($perPage));
    }

    // POST /api/admin/orders/{id}/restore - Khôi phục đơn hàng từ thùng rác
    public function restore($id)
    {
        $this->checkStaffAccess();

        $order = Order::onlyTrashed()->findOrFail($id);
        $order->restore();

        return response()->json([
            'message' => 'Khôi phục đơn hàng thành công',
            'data'    => $order,
        ]);
    }

    // DELETE /api/admin/orders/{id}/force - Xóa vĩnh viễn đơn hàng
    public function forceDelete($id)
    {
        $this->checkAdminOnlyAccess(); // Chỉ Super Admin mới được xóa vĩnh viễn

        $order = Order::onlyTrashed()->findOrFail($id);
        // Xóa chi tiết đơn hàng
        $order->details()->delete();
        $order->forceDelete();

        return response()->json(['message' => 'Đã xóa vĩnh viễn đơn hàng khỏi cơ sở dữ liệu']);
    }
}
