<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdminPromotionController extends Controller
{
    /**
     * Public API: Lấy danh sách mã khuyến mãi đang hoạt động để khách chọn nhanh
     * GET /api/promotions
     */
    public function publicPromotions(): JsonResponse
    {
        $now = now();
        $promotions = Promotion::where('status', 1)
            ->where(function ($q) use ($now) {
                $q->whereNull('start_date')->orWhere('start_date', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('end_date')->orWhere('end_date', '>=', $now);
            })
            ->where(function ($q) {
                $q->where('usage_limit', '<=', 0)
                  ->orWhereRaw('used_count < usage_limit');
            })
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $promotions,
        ]);
    }

    /**
     * [THUẬT TOÁN KIỂM TRA & ÁP DỤNG MÃ KHUYẾN MÃI (FUNC-ORDER-02)]:
     * POST /api/promotions/apply
     * Kiểm tra: Mã có tồn tại? status = 1? Còn hạn? Còn lượt dùng? Đạt min_order_value?
     * Trả về số tiền giảm chi tiết và tổng thanh toán mới.
     */
    public function applyPromotion(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code'   => 'required|string',
            'amount' => 'required|numeric|min:0',
        ], [
            'code.required'   => 'Vui lòng nhập mã khuyến mãi!',
            'amount.required' => 'Thiếu giá trị tạm tính của đơn hàng!',
        ]);

        $code = trim(strtoupper($validated['code']));
        $amount = (float) $validated['amount'];

        $promo = Promotion::where('code', $code)->first();

        if (!$promo) {
            return response()->json([
                'success' => false,
                'message' => "Mã khuyến mãi «{$code}» không tồn tại trên hệ thống!",
            ], 422);
        }

        $errorMessage = null;
        if (!$promo->isValidForAmount($amount, $errorMessage)) {
            return response()->json([
                'success' => false,
                'message' => $errorMessage,
            ], 422);
        }

        $discount = $promo->calculateDiscount($amount);
        $finalTotal = max(0, $amount - $discount);

        return response()->json([
            'success'        => true,
            'message'        => "Áp dụng thành công mã «{$promo->code}»! Tiết kiệm " . number_format($discount, 0, ',', '.') . " ₫",
            'coupon_code'    => $promo->code,
            'discount'       => $discount,
            'original_total' => $amount,
            'final_total'    => $finalTotal,
            'promotion'      => $promo,
        ]);
    }

    /**
     * Admin: Danh sách mã khuyến mãi
     * GET /api/admin/promotions
     */
    public function index(Request $request): JsonResponse
    {
        $query = Promotion::orderBy('id', 'desc');

        if ($request->filled('status')) {
            $query->where('status', (int) $request->status);
        }

        if ($request->filled('q')) {
            $q = trim($request->q);
            $query->where(function ($w) use ($q) {
                $w->where('code', 'like', "%{$q}%")
                  ->orWhere('name', 'like', "%{$q}%");
            });
        }

        if ($request->boolean('all')) {
            return response()->json(['data' => $query->get()]);
        }

        $perPage = (int) $request->input('per_page', 10);
        return response()->json($query->paginate($perPage));
    }

    /**
     * Admin: Thêm mã khuyến mãi mới
     * POST /api/admin/promotions
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code'                => 'required|string|max:50|unique:promotions,code',
            'name'                => 'required|string|max:255',
            'discount_type'       => 'required|in:fixed,percent',
            'discount_value'      => 'required|numeric|min:1',
            'max_discount_amount' => 'nullable|numeric|min:0',
            'min_order_value'     => 'nullable|numeric|min:0',
            'usage_limit'         => 'nullable|integer|min:1',
            'start_date'          => 'nullable|date',
            'end_date'            => 'nullable|date|after_or_equal:start_date',
            'status'              => 'nullable|in:0,1',
        ], [
            'code.required'          => 'Vui lòng nhập mã khuyến mãi!',
            'code.unique'            => 'Mã khuyến mãi này đã tồn tại trên hệ thống!',
            'name.required'          => 'Vui lòng nhập tên chương trình khuyến mãi!',
            'discount_value.required'=> 'Vui lòng nhập mức giảm giá!',
            'end_date.after_or_equal'=> 'Ngày kết thúc phải diễn ra sau hoặc bằng ngày bắt đầu!',
        ]);

        $promo = Promotion::create([
            'code'                => strtoupper(trim($validated['code'])),
            'name'                => $validated['name'],
            'discount_type'       => $validated['discount_type'],
            'discount_value'      => (float) $validated['discount_value'],
            'max_discount_amount' => isset($validated['max_discount_amount']) ? (float) $validated['max_discount_amount'] : null,
            'min_order_value'     => isset($validated['min_order_value']) ? (float) $validated['min_order_value'] : 0,
            'usage_limit'         => isset($validated['usage_limit']) ? (int) $validated['usage_limit'] : 100,
            'used_count'          => 0,
            'start_date'          => $validated['start_date'] ?? null,
            'end_date'            => $validated['end_date'] ?? null,
            'status'              => isset($validated['status']) ? (int) $validated['status'] : 1,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Thêm mã khuyến mãi thành công!',
            'data'    => $promo,
        ], 201);
    }

    /**
     * Admin: Chi tiết mã khuyến mãi
     * GET /api/admin/promotions/{id}
     */
    public function show($id): JsonResponse
    {
        $promo = Promotion::findOrFail($id);
        return response()->json(['success' => true, 'data' => $promo]);
    }

    /**
     * Admin: Cập nhật mã khuyến mãi
     * PUT /api/admin/promotions/{id}
     */
    public function update(Request $request, $id): JsonResponse
    {
        $promo = Promotion::findOrFail($id);

        $validated = $request->validate([
            'code'                => 'required|string|max:50|unique:promotions,code,' . $id,
            'name'                => 'required|string|max:255',
            'discount_type'       => 'required|in:fixed,percent',
            'discount_value'      => 'required|numeric|min:1',
            'max_discount_amount' => 'nullable|numeric|min:0',
            'min_order_value'     => 'nullable|numeric|min:0',
            'usage_limit'         => 'nullable|integer|min:1',
            'start_date'          => 'nullable|date',
            'end_date'            => 'nullable|date|after_or_equal:start_date',
            'status'              => 'nullable|in:0,1',
        ], [
            'code.required'          => 'Vui lòng nhập mã khuyến mãi!',
            'code.unique'            => 'Mã khuyến mãi này đã tồn tại trên hệ thống!',
            'name.required'          => 'Vui lòng nhập tên chương trình khuyến mãi!',
            'discount_value.required'=> 'Vui lòng nhập mức giảm giá!',
            'end_date.after_or_equal'=> 'Ngày kết thúc phải diễn ra sau hoặc bằng ngày bắt đầu!',
        ]);

        $promo->update([
            'code'                => strtoupper(trim($validated['code'])),
            'name'                => $validated['name'],
            'discount_type'       => $validated['discount_type'],
            'discount_value'      => (float) $validated['discount_value'],
            'max_discount_amount' => isset($validated['max_discount_amount']) ? (float) $validated['max_discount_amount'] : null,
            'min_order_value'     => isset($validated['min_order_value']) ? (float) $validated['min_order_value'] : 0,
            'usage_limit'         => isset($validated['usage_limit']) ? (int) $validated['usage_limit'] : $promo->usage_limit,
            'start_date'          => $validated['start_date'] ?? null,
            'end_date'            => $validated['end_date'] ?? null,
            'status'              => isset($validated['status']) ? (int) $validated['status'] : $promo->status,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật mã khuyến mãi thành công!',
            'data'    => $promo,
        ]);
    }

    /**
     * Admin: Xóa mã khuyến mãi
     * DELETE /api/admin/promotions/{id}
     */
    public function destroy($id): JsonResponse
    {
        $promo = Promotion::findOrFail($id);
        $promo->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa mã khuyến mãi thành công!',
        ]);
    }
}

