<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{
    // Xem giỏ hàng
    public function index(Request $request)
    {
        $user = $request->user();

        $cart = Cart::firstOrCreate([
            'user_id' => $user->id,
        ]);

        $cart->load('items.product');

        return response()->json([
            'message' => 'Lấy giỏ hàng thành công',
            'cart' => $cart,
        ]);
    }

    // Thêm sản phẩm vào giỏ
    public function add(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'quantity' => 'nullable|integer|min:1',
        ]);

        $user = $request->user();

        $product = Product::findOrFail($validated['product_id']);

        // Kiểm tra sản phẩm còn bán không
        if (!$product->status) {
            return response()->json([
                'message' => 'Sản phẩm hiện không bán',
            ], 400);
        }

        // Kiểm tra tồn kho
        $quantity = $validated['quantity'] ?? 1;

        if ($product->stock < $quantity) {
            return response()->json([
                'message' => 'Sản phẩm không đủ số lượng trong kho',
            ], 400);
        }

        // Lấy hoặc tạo giỏ hàng
        $cart = Cart::firstOrCreate([
            'user_id' => $user->id,
        ]);

        // Kiểm tra sản phẩm đã có trong giỏ chưa
        $item = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $product->id)
            ->first();

        if ($item) {

            $newQuantity = $item->quantity + $quantity;

            if ($newQuantity > $product->stock) {
                return response()->json([
                    'message' => 'Số lượng sản phẩm vượt quá tồn kho',
                ], 400);
            }

            $item->update([
                'quantity' => $newQuantity,
                'price' => $product->sale_price ?? $product->price,
            ]);

        } else {

            $item = CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $product->id,
                'quantity' => $quantity,
                'price' => $product->sale_price ?? $product->price,
            ]);
        }

        $cart->load('items.product');

        return response()->json([
            'message' => 'Thêm sản phẩm vào giỏ hàng thành công',
            'cart' => $cart,
        ], 201);
    }

    // Cập nhật số lượng
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $user = $request->user();

        $cart = Cart::where('user_id', $user->id)->first();

        if (!$cart) {
            return response()->json([
                'message' => 'Giỏ hàng không tồn tại',
            ], 404);
        }

        $item = CartItem::where('cart_id', $cart->id)
            ->where('id', $id)
            ->with('product')
            ->first();

        if (!$item) {
            return response()->json([
                'message' => 'Sản phẩm không có trong giỏ hàng',
            ], 404);
        }

        if ($validated['quantity'] > $item->product->stock) {
            return response()->json([
                'message' => 'Số lượng vượt quá tồn kho',
            ], 400);
        }

        $item->update([
            'quantity' => $validated['quantity'],
            'price' => $item->product->sale_price ?? $item->product->price,
        ]);

        return response()->json([
            'message' => 'Cập nhật giỏ hàng thành công',
            'item' => $item->load('product'),
        ]);
    }

    // Xóa một sản phẩm khỏi giỏ
    public function remove(Request $request, $id)
    {
        $user = $request->user();

        $cart = Cart::where('user_id', $user->id)->first();

        if (!$cart) {
            return response()->json([
                'message' => 'Giỏ hàng không tồn tại',
            ], 404);
        }

        $item = CartItem::where('cart_id', $cart->id)
            ->where('id', $id)
            ->first();

        if (!$item) {
            return response()->json([
                'message' => 'Sản phẩm không có trong giỏ hàng',
            ], 404);
        }

        $item->delete();

        return response()->json([
            'message' => 'Đã xóa sản phẩm khỏi giỏ hàng',
        ]);
    }

    // Xóa toàn bộ giỏ hàng
    public function clear(Request $request)
    {
        $user = $request->user();

        $cart = Cart::where('user_id', $user->id)->first();

        if (!$cart) {
            return response()->json([
                'message' => 'Giỏ hàng không tồn tại',
            ], 404);
        }

        $cart->items()->delete();

        return response()->json([
            'message' => 'Đã xóa toàn bộ giỏ hàng',
        ]);
    }
}