<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminStockController extends Controller
{
    /**
     * [KPI THỐNG KÊ KHO HÀNG]:
     * GET /api/admin/stock/stats
     * Trả về 4 chỉ số KPI: Tổng tồn kho, Sắp hết hàng, Tổng phiếu nhập, Tổng phiếu xuất
     */
    public function stats(): JsonResponse
    {
        $totalStock = (int) Product::sum('stock');
        $lowStockCount = Product::where('stock', '<=', 5)->count();
        $totalImports = StockMovement::where('type', 'import')->count();
        $totalExports = StockMovement::where('type', 'export')->count();

        return response()->json([
            'success'          => true,
            'total_stock'      => $totalStock,
            'low_stock_count'  => $lowStockCount,
            'total_imports'    => $totalImports,
            'total_exports'    => $totalExports,
        ]);
    }

    /**
     * [DANH SÁCH LỊCH SỬ NHẬP / XUẤT KHO]:
     * GET /api/admin/stock/movements
     */
    public function movements(Request $request): JsonResponse
    {
        $query = StockMovement::with('product:id,name,image,sku,stock')
            ->orderBy('id', 'desc');

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('q')) {
            $q = trim($request->q);
            $query->where(function ($w) use ($q) {
                $w->where('code', 'like', "%{$q}%")
                  ->orWhere('supplier_or_reason', 'like', "%{$q}%")
                  ->orWhere('note', 'like', "%{$q}%")
                  ->orWhereHas('product', function ($pq) use ($q) {
                      $pq->where('name', 'like', "%{$q}%")
                         ->orWhere('sku', 'like', "%{$q}%");
                  });
            });
        }

        $perPage = (int) $request->input('per_page', 10);
        return response()->json($query->paginate($perPage));
    }

    /**
     * [DANH SÁCH SẢN PHẨM & TỒN KHO HIỆN TẠI]:
     * GET /api/admin/stock/inventory
     */
    public function inventory(Request $request): JsonResponse
    {
        $query = Product::with(['category:id,name', 'brand:id,name'])
            ->orderBy('stock', 'asc')
            ->orderBy('id', 'desc');

        if ($request->filled('filter')) {
            if ($request->filter === 'low_stock') {
                $query->where('stock', '<=', 5);
            } elseif ($request->filter === 'out_of_stock') {
                $query->where('stock', '<=', 0);
            }
        }

        if ($request->filled('q')) {
            $q = trim($request->q);
            $query->where(function ($w) use ($q) {
                $w->where('name', 'like', "%{$q}%")
                  ->orWhere('sku', 'like', "%{$q}%");
            });
        }

        $perPage = (int) $request->input('per_page', 10);
        return response()->json($query->paginate($perPage));
    }

    /**
     * [THUẬT TOÁN TẠO PHIẾU NHẬP HÀNG TĂNG TỒN KHO (FUNC-ADM-STOCK-01)]:
     * POST /api/admin/stock/import
     * Tự động cộng tăng stock của sản phẩm trong bảng products & lưu phiếu vào stock_movements
     */
    public function storeImport(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id'         => 'required|exists:products,id',
            'quantity'           => 'required|integer|min:1',
            'unit_cost'          => 'required|numeric|min:0',
            'supplier_or_reason' => 'required|string|max:255',
            'note'               => 'nullable|string|max:1000',
        ], [
            'product_id.required'         => 'Vui lòng chọn sản phẩm cần nhập kho!',
            'product_id.exists'           => 'Sản phẩm không tồn tại trên hệ thống!',
            'quantity.required'           => 'Vui lòng nhập số lượng hàng cần nhập!',
            'quantity.min'                => 'Số lượng nhập kho phải lớn hơn 0!',
            'unit_cost.required'          => 'Vui lòng nhập đơn giá nhập kho!',
            'supplier_or_reason.required' => 'Vui lòng nhập tên Nhà cung cấp hoặc nguồn nhập hàng!',
        ]);

        $user = auth('sanctum')->user();
        $creatorName = $user ? "{$user->name} ({$user->role})" : 'Admin System';

        $movement = DB::transaction(function () use ($validated, $creatorName) {
            $product = Product::lockForUpdate()->findOrFail($validated['product_id']);
            $stockBefore = (int) $product->stock;
            $qty = (int) $validated['quantity'];
            $stockAfter = $stockBefore + $qty;

            $code = 'NK-' . now()->format('Ymd') . '-' . strtoupper(Str::random(4));

            $stockMovement = StockMovement::create([
                'code'               => $code,
                'product_id'         => $product->id,
                'type'               => 'import',
                'quantity'           => $qty,
                'unit_cost'          => (float) $validated['unit_cost'],
                'stock_before'       => $stockBefore,
                'stock_after'        => $stockAfter,
                'supplier_or_reason' => $validated['supplier_or_reason'],
                'note'               => $validated['note'] ?? null,
                'created_by'         => $creatorName,
            ]);

            // Cập nhật tồn kho sản phẩm
            $product->update(['stock' => $stockAfter]);

            return $stockMovement;
        });

        return response()->json([
            'success' => true,
            'message' => "Tạo phiếu nhập kho «{$movement->code}» thành công! Đã tăng {$movement->quantity} máy vào kho.",
            'data'    => $movement->load('product'),
        ], 201);
    }

    /**
     * [THUẬT TOÁN TẠO PHIẾU XUẤT HÀNG TRỪ TỒN KHO & VALIDATE CHẶN VƯỢT TỒN (FUNC-ADM-STOCK-02)]:
     * POST /api/admin/stock/export
     * Kiểm tra số lượng xuất <= tồn kho hiện tại, trừ tồn kho và ghi nhật ký
     */
    public function storeExport(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id'         => 'required|exists:products,id',
            'quantity'           => 'required|integer|min:1',
            'supplier_or_reason' => 'required|string|max:255',
            'unit_cost'          => 'nullable|numeric|min:0',
            'note'               => 'nullable|string|max:1000',
        ], [
            'product_id.required'         => 'Vui lòng chọn sản phẩm cần xuất kho!',
            'product_id.exists'           => 'Sản phẩm không tồn tại trên hệ thống!',
            'quantity.required'           => 'Vui lòng nhập số lượng hàng cần xuất!',
            'quantity.min'                => 'Số lượng xuất kho phải lớn hơn 0!',
            'supplier_or_reason.required' => 'Vui lòng chọn hoặc nhập lý do xuất kho (Xuất trả NCC / Xuất hủy hàng lỗi)!',
        ]);

        $user = auth('sanctum')->user();
        $creatorName = $user ? "{$user->name} ({$user->role})" : 'Admin System';

        try {
            $movement = DB::transaction(function () use ($validated, $creatorName) {
                $product = Product::lockForUpdate()->findOrFail($validated['product_id']);
                $stockBefore = (int) $product->stock;
                $qty = (int) $validated['quantity'];

                // VALIDATE CHẶN XUẤT QUÁ TỒN HIỆN CÓ
                if ($qty > $stockBefore) {
                    throw new \RuntimeException("Số lượng xuất kho ({$qty}) vượt quá số lượng tồn kho hiện tại của sản phẩm ({$stockBefore} máy)!");
                }

                $stockAfter = $stockBefore - $qty;
                $code = 'XK-' . now()->format('Ymd') . '-' . strtoupper(Str::random(4));

                $stockMovement = StockMovement::create([
                    'code'               => $code,
                    'product_id'         => $product->id,
                    'type'               => 'export',
                    'quantity'           => $qty,
                    'unit_cost'          => isset($validated['unit_cost']) ? (float) $validated['unit_cost'] : 0,
                    'stock_before'       => $stockBefore,
                    'stock_after'        => $stockAfter,
                    'supplier_or_reason' => $validated['supplier_or_reason'],
                    'note'               => $validated['note'] ?? null,
                    'created_by'         => $creatorName,
                ]);

                // Cập nhật tồn kho sản phẩm
                $product->update(['stock' => $stockAfter]);

                return $stockMovement;
            });

            return response()->json([
                'success' => true,
                'message' => "Tạo phiếu xuất kho «{$movement->code}» thành công! Đã trừ {$movement->quantity} máy khỏi tồn kho.",
                'data'    => $movement->load('product'),
            ], 201);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}

