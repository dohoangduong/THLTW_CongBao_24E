<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use App\Models\Promotion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    // Miễn phí vận chuyển từ 5.000.000 VNĐ trở lên, dưới mức này tính phí cố định 30.000 VNĐ
    private const FREE_SHIP_FROM = 5000000;
    private const SHIPPING_FEE   = 30000;

    // GET /api/orders - Lịch sử đơn hàng của tôi
    public function index(Request $request)
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->withCount('details')
            ->with(['statusHistories'])
            ->orderByDesc('id')
            ->get();

        return response()->json(['data' => $orders]);
    }

    // GET /api/orders/{id} - Chi tiết 1 đơn hàng của tôi kèm lịch sử trạng thái
    public function show(Request $request, $id)
    {
        $order = Order::with(['details.product:id,name,image,slug', 'statusHistories'])
            ->where('user_id', $request->user()->id)
            ->find($id);

        if (!$order) {
            return response()->json(['message' => 'Không tìm thấy đơn hàng'], 404);
        }

        return response()->json(['data' => $order]);
    }

    // POST /api/orders - Đặt hàng từ giỏ hàng hiện tại (có hỗ trợ mã khuyến mãi coupon_code)
    public function store(Request $request)
    {
        $data = $request->validate([
            'customer_name'    => 'required|string|max:255',
            'customer_email'   => 'nullable|email|max:255',
            'customer_phone'   => 'required|string|max:20',
            'shipping_address' => 'required|string|max:500',
            'note'             => 'nullable|string|max:1000',
            'payment_method'   => 'required|in:cod,bank_transfer,momo,vnpay',
            'coupon_code'      => 'nullable|string|max:50',
        ], [
            'customer_name.required'    => 'Vui lòng nhập họ và tên người nhận hàng!',
            'customer_phone.required'   => 'Vui lòng nhập số điện thoại nhận hàng!',
            'shipping_address.required' => 'Vui lòng nhập địa chỉ nhận hàng chi tiết!',
            'payment_method.required'   => 'Vui lòng chọn phương thức thanh toán!',
        ]);

        $user = $request->user();
        if ($user && !$user->status) {
            return response()->json([
                'message' => 'Tài khoản của bạn đã bị khóa bởi Quản trị viên. Không thể thực hiện đặt hàng!',
            ], 403);
        }

        $cart = Cart::where('user_id', $user->id)->first();
        $items = $cart ? CartItem::where('cart_id', $cart->id)->get() : collect();

        if ($items->isEmpty()) {
            return response()->json(['message' => 'Giỏ hàng đang trống, không thể đặt hàng'], 422);
        }

        try {
            $order = DB::transaction(function () use ($data, $user, $cart, $items) {
                $subtotal = 0;
                $lines = [];

                foreach ($items as $item) {
                    // Khóa dòng sản phẩm để trừ tồn kho an toàn trong transaction
                    $product = Product::lockForUpdate()->find($item->product_id);

                    if (!$product || !$product->status) {
                        throw new \RuntimeException("Sản phẩm trong giỏ không còn bán trên hệ thống");
                    }
                    if ($product->stock < $item->quantity) {
                        throw new \RuntimeException("«{$product->name}» chỉ còn {$product->stock} máy trong kho");
                    }

                    // Tính giá thực tế từ bảng products (ưu tiên sale_price nếu có)
                    $unitPrice = ($product->sale_price !== null
                        && (float) $product->sale_price > 0
                        && (float) $product->sale_price < (float) $product->price)
                        ? (float) $product->sale_price
                        : (float) $product->price;

                    $lineTotal = $unitPrice * $item->quantity;
                    $subtotal += $lineTotal;
                    $lines[] = [
                        'product'   => $product,
                        'quantity'  => $item->quantity,
                        'unitPrice' => $unitPrice,
                        'lineTotal' => $lineTotal,
                    ];
                }

                $shipping = $subtotal >= self::FREE_SHIP_FROM ? 0 : self::SHIPPING_FEE;

                // XỬ LÝ MÃ KHUYẾN MÃI (NẾU CÓ)
                $discount = 0;
                $appliedCouponCode = null;
                if (!empty($data['coupon_code'])) {
                    $promoCode = trim(strtoupper($data['coupon_code']));
                    $promo = Promotion::where('code', $promoCode)->first();
                    if ($promo) {
                        $errMsg = null;
                        if ($promo->isValidForAmount($subtotal, $errMsg)) {
                            $discount = $promo->calculateDiscount($subtotal);
                            $appliedCouponCode = $promo->code;
                            $promo->increment('used_count');
                        }
                    }
                }

                $total = max(0, $subtotal + $shipping - $discount);

                $initialHistory = [
                    [
                        'status'     => 'pending',
                        'note'       => 'Khách hàng tạo đơn hàng mới',
                        'changed_by' => $user->name,
                        'time'       => now()->toIso8601String(),
                    ]
                ];

                // Tạo đơn hàng
                $order = Order::create([
                    'user_id'          => $user->id,
                    'order_code'       => 'DH' . now()->format('ymdHis') . strtoupper(Str::random(3)),
                    'customer_name'    => $data['customer_name'],
                    'customer_email'   => $data['customer_email'] ?? $user->email,
                    'customer_phone'   => $data['customer_phone'],
                    'shipping_address' => $data['shipping_address'],
                    'note'             => $data['note'] ?? null,
                    'subtotal'         => $subtotal,
                    'shipping_fee'     => $shipping,
                    'discount'         => $discount,
                    'coupon_code'      => $appliedCouponCode,
                    'total'            => $total,
                    'payment_method'   => $data['payment_method'],
                    'payment_status'   => 'pending',
                    'status'           => 'pending',
                    'status_history'   => $initialHistory,
                ]);

                // Lưu bản ghi lịch sử trạng thái
                OrderStatusHistory::create([
                    'order_id'   => $order->id,
                    'status'     => 'pending',
                    'note'       => 'Khách hàng tạo đơn hàng mới',
                    'changed_by' => $user->name,
                    'created_at' => now(),
                ]);

                // Tạo chi tiết đơn hàng và TRỪ TỒN KHO SẢN PHẨM
                foreach ($lines as $line) {
                    $prod = $line['product'];
                    OrderDetail::create([
                        'order_id'     => $order->id,
                        'product_id'   => $prod->id,
                        'product_name' => $prod->name,
                        'product_sku'  => $prod->sku,
                        'price'        => $line['unitPrice'],
                        'quantity'     => $line['quantity'],
                        'subtotal'     => $line['lineTotal'],
                    ]);

                    $prod->decrement('stock', $line['quantity']);
                }

                // Xóa giỏ hàng sau khi đặt thành công
                CartItem::where('cart_id', $cart->id)->delete();

                return $order;
            });

            return response()->json([
                'message' => 'Đặt hàng thành công',
                'data'    => $order->load(['details', 'statusHistories']),
            ], 201);
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    // PUT /api/orders/{id}/cancel - Người dùng tự hủy đơn hàng đang chờ xác nhận
    public function cancel(Request $request, $id)
    {
        $user = $request->user();
        $order = Order::with('details')
            ->where('user_id', $user->id)
            ->find($id);

        if (!$order) {
            return response()->json(['message' => 'Không tìm thấy đơn hàng'], 404);
        }

        if ($order->status !== 'pending') {
            return response()->json(['message' => 'Chỉ có thể hủy đơn hàng khi đang ở trạng thái Chờ xác nhận'], 422);
        }

        DB::transaction(function () use ($order, $user) {
            // [THUẬT TOÁN HOÀN TỒN KHO KHI HỦY ĐƠN]: Tự động cộng hoàn lại stock cho từng sản phẩm
            foreach ($order->details as $d) {
                if ($d->product_id) {
                    Product::where('id', $d->product_id)->increment('stock', $d->quantity);
                }
            }

            // Ghi lịch sử trạng thái
            OrderStatusHistory::create([
                'order_id'   => $order->id,
                'status'     => 'cancelled',
                'note'       => 'Khách hàng tự hủy đơn hàng',
                'changed_by' => $user->name,
                'created_at' => now(),
            ]);

            $history = $order->status_history ?? [];
            $history[] = [
                'status'     => 'cancelled',
                'note'       => 'Khách hàng tự hủy đơn hàng',
                'changed_by' => $user->name,
                'time'       => now()->toIso8601String(),
            ];

            $order->update([
                'status'         => 'cancelled',
                'status_history' => $history,
            ]);
        });

        return response()->json([
            'message' => 'Đã hủy đơn hàng thành công và hoàn trả số lượng tồn kho!',
            'data'    => $order->load(['details', 'statusHistories']),
        ]);
    }
}
