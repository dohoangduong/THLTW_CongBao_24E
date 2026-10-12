<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminOrderController extends Controller
{
    private const STATUSES = ['pending', 'confirmed', 'processing', 'shipping', 'completed', 'cancelled'];

    // Trạng thái nào được chuyển sang trạng thái nào
    private const FLOW = [
        'pending'    => ['confirmed', 'cancelled'],
        'confirmed'  => ['processing', 'cancelled'],
        'processing' => ['shipping', 'cancelled'],
        'shipping'   => ['completed', 'cancelled'],
        'completed'  => [],
        'cancelled'  => [],
    ];

    // GET /api/admin/stats - Số liệu tổng quan cho trang quản trị
    public function stats()
    {
        return response()->json([
            'orders_total'   => Order::count(),
            'orders_pending' => Order::where('status', 'pending')->count(),
            'revenue'        => (float) Order::where('status', 'completed')->sum('total'),
            'users_total'    => User::where('role', 'customer')->count(),
            'products_total' => Product::count(),
            'low_stock'      => Product::where('stock', '<=', 5)->count(),
        ]);
    }

    // GET /api/admin/orders?status=&q=&page=
    public function index(Request $request)
    {
        $query = Order::withCount('details')->orderByDesc('id');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('q')) {
            $q = $request->q;
            $query->where(function ($w) use ($q) {
                $w->where('order_code', 'like', "%$q%")
                  ->orWhere('customer_name', 'like', "%$q%")
                  ->orWhere('customer_phone', 'like', "%$q%");
            });
        }

        return response()->json($query->paginate(10));
    }

    // GET /api/admin/orders/{id}
    public function show($id)
    {
        $order = Order::with(['details', 'user:id,name,email'])->find($id);

        if (!$order) {
            return response()->json(['message' => 'Không tìm thấy đơn hàng'], 404);
        }
        return response()->json(['data' => $order]);
    }

    // PUT /api/admin/orders/{id}/status
    public function updateStatus(Request $request, $id)
    {
        $data = $request->validate([
            'status'         => 'required|in:' . implode(',', self::STATUSES),
            'payment_status' => 'nullable|in:pending,paid,failed,refunded',
        ]);

        $order = Order::with('details')->find($id);
        if (!$order) {
            return response()->json(['message' => 'Không tìm thấy đơn hàng'], 404);
        }

        $new = $data['status'];

        if ($new !== $order->status && !in_array($new, self::FLOW[$order->status], true)) {
            return response()->json([
                'message' => "Không thể chuyển từ «{$order->status}» sang «{$new}»",
            ], 422);
        }

        DB::transaction(function () use ($order, $new, $data) {
            $update = ['status' => $new];

            // Hủy đơn thì trả hàng về kho
            if ($new === 'cancelled' && $order->status !== 'cancelled') {
                foreach ($order->details as $d) {
                    if ($d->product_id) {
                        Product::where('id', $d->product_id)->increment('stock', $d->quantity);
                    }
                }
            }
            // Giao thành công với đơn COD thì coi như đã thu tiền
            if ($new === 'completed' && $order->payment_method === 'cod') {
                $update['payment_status'] = 'paid';
            }
            if (!empty($data['payment_status'])) {
                $update['payment_status'] = $data['payment_status'];
            }

            $order->update($update);
        });

        return response()->json(['message' => 'Cập nhật đơn hàng thành công', 'data' => $order->fresh('details')]);
    }
}
