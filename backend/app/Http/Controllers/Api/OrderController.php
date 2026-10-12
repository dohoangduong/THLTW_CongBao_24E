<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    // Miễn phí vận chuyển từ mức này trở lên, dưới mức này tính phí cố định
    private const FREE_SHIP_FROM = 5000000;
    private const SHIPPING_FEE   = 30000;

    // GET /api/orders - Lịch sử đơn hàng của tôi
    public function index(Request $request)
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->withCount('details')
            ->orderByDesc('id')
            ->get();

        return response()->json(['data' => $orders]);
    }

    // GET /api/orders/{id} - Chi tiết 1 đơn của tôi
    public function show(Request $request, $id)
    {
        $order = Order::with('details')
            ->where('user_id', $request->user()->id)
            ->find($id);

        if (!$order) {
            return response()->json(['message' => 'Không tìm thấy đơn hàng'], 404);
        }

        return response()->json(['data' => $order]);
    }

    // POST /api/orders - Đặt hàng từ giỏ hàng
    public function store(Request $request)
    {
        $data = $request->validate([
            'customer_name'    => 'required|string|max:255',
            'customer_email'   => 'nullable|email|max:255',
            'customer_phone'   => 'required|string|max:20',
            'shipping_address' => 'required|string|max:500',
            'note'             => 'nullable|string|max:1000',
            'payment_method'   => 'required|in:cod,bank_transfer,momo,vnpay',
        ]);

        $user = $request->user();
        $cart = Cart::where('user_id', $user->id)->first();
        $items = $cart ? CartItem::where('cart_id', $cart->id)->get() : collect();

        if ($items->isEmpty()) {
            return response()->json(['message' => 'Giỏ hàng đang trống'], 422);
        }

        try {
            $order = DB::transaction(function () use ($data, $user, $cart, $items) {
                $subtotal = 0;
                $lines = [];

                foreach ($items as $item) {
                    // Khóa dòng sản phẩm để tránh 2 người mua cùng lúc vượt tồn kho
                    $product = Product::lockForUpdate()->find($item->product_id);

                    if (!$product || !$product->status) {
                        throw new \RuntimeException("Sản phẩm trong giỏ không còn được bán");
                    }
                    if ($product->stock < $item->quantity) {
                        throw new \RuntimeException("«{$product->name}» chỉ còn {$product->stock} máy trong kho");
                    }

                    // Luôn tính lại giá từ database, không tin giá lưu trong giỏ
                    $unit = ($product->sale_price !== null
                        && (float) $product->sale_price > 0
                        && (float) $product->sale_price < (float) $product->price)
                        ? (float) $product->sale_price
                        : (float) $product->price;

                    $line = $unit * $item->quantity;
                    $subtotal += $line;
                    $lines[] = [$product, $item->quantity, $unit, $line];
                }

                $shipping = $subtotal >= self::FREE_SHIP_FROM ? 0 : self::SHIPPING_FEE;

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
                    'discount'         => 0,
                    'total'            => $subtotal + $shipping,
                    'payment_method'   => $data['payment_method'],
                    'payment_status'   => 'pending',
                    'status'           => 'pending',
                ]);

                foreach ($lines as [$product, $qty, $unit, $line]) {
                    OrderDetail::create([
                        'order_id'     => $order->id,
                        'product_id'   => $product->id,
                        'product_name' => $product->name,
                        'product_sku'  => $product->sku,
                        'price'        => $unit,
                        'quantity'     => $qty,
                        'subtotal'     => $line,
                    ]);
                    $product->decrement('stock', $qty);
                }

                CartItem::where('cart_id', $cart->id)->delete();

                return $order;
            });
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => 'Đặt hàng thành công',
            'data'    => $order->load('details'),
        ], 201);
    }

    // PUT /api/orders/{id}/cancel - Khách tự hủy đơn (chỉ khi chưa xác nhận)
    public function cancel(Request $request, $id)
    {
        $order = Order::with('details')
            ->where('user_id', $request->user()->id)
            ->find($id);

        if (!$order) {
            return response()->json(['message' => 'Không tìm thấy đơn hàng'], 404);
        }
        if ($order->status !== 'pending') {
            return response()->json(['message' => 'Chỉ hủy được đơn đang chờ xác nhận'], 422);
        }

        DB::transaction(function () use ($order) {
            foreach ($order->details as $d) {
                if ($d->product_id) {
                    Product::where('id', $d->product_id)->increment('stock', $d->quantity);
                }
            }
            $order->update(['status' => 'cancelled']);
        });

        return response()->json(['message' => 'Đã hủy đơn hàng', 'data' => $order->fresh('details')]);
    }
}
