<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use Illuminate\Http\Request;

class AdminSupportTicketController extends Controller
{
    private function checkStaffAccess(): void
    {
        $user = auth('sanctum')->user();
        if (!$user || !in_array($user->role, ['admin', 'manager'])) {
            abort(response()->json([
                'message' => 'Lỗi bảo mật: Bạn không có quyền truy cập quản lý Phiếu hỗ trợ!'
            ], 403));
        }
    }

    // [THUẬT TOÁN QUẢN LÝ PHIẾU HỖ TRỢ TRONG ADMIN]:
    // Lấy danh sách phiếu hỗ trợ của khách hàng, lọc theo tiến độ xử lý và từ khóa.
    public function index(Request $request)
    {
        $this->checkStaffAccess();

        $query = SupportTicket::with('user:id,name,email,phone')->orderByDesc('id');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $search = $request->input('search', $request->input('q'));
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('order_code', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%");
            });
        }

        $perPage = (int) $request->input('per_page', 10);
        return response()->json($query->paginate($perPage));
    }

    // [THUẬT TOÁN CẬP NHẬT TRẠNG THÁI VÀ GHI CHÚ PHIẾU HỖ TRỢ]:
    // Cập nhật trạng thái phiếu: pending (chờ xử lý) -> processing (đang hỗ trợ) -> resolved (đã giải quyết).
    public function update(Request $request, $id)
    {
        $this->checkStaffAccess();

        $validated = $request->validate([
            'status'      => 'sometimes|in:pending,processing,resolved',
            'admin_notes' => 'nullable|string|max:3000',
        ]);

        $ticket = SupportTicket::findOrFail($id);
        $ticket->update($validated);

        return response()->json([
            'message' => 'Cập nhật tiến độ xử lý phiếu hỗ trợ thành công',
            'data'    => $ticket,
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        return $this->update($request, $id);
    }

    // [THUẬT TOÁN XÓA PHIẾU HỖ TRỢ]:
    public function destroy($id)
    {
        $this->checkStaffAccess();

        $ticket = SupportTicket::findOrFail($id);
        $ticket->delete();

        return response()->json([
            'message' => 'Đã xóa phiếu hỗ trợ thành công',
        ]);
    }
}
