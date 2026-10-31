<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use Illuminate\Http\Request;

class SupportTicketController extends Controller
{
    // [THUẬT TOÁN TIẾP NHẬN PHIẾU HỖ TRỢ / LIÊN HỆ]:
    // Kiểm tra dữ liệu đầu vào, liên kết tài khoản nếu đã đăng nhập và lưu vào MySQL để Admin xử lý.
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'phone'      => 'required|string|max:50',
            'email'      => 'nullable|email|max:255',
            'order_code' => 'nullable|string|max:100',
            'subject'    => 'required|string|max:255',
            'message'    => 'required|string|min:5|max:5000',
        ], [
            'name.required'    => 'Vui lòng nhập họ và tên của bạn.',
            'phone.required'   => 'Vui lòng cung cấp số điện thoại liên hệ.',
            'subject.required' => 'Vui lòng chọn hoặc nhập tiêu đề yêu cầu hỗ trợ.',
            'message.required' => 'Vui lòng nhập nội dung chi tiết cần hỗ trợ.',
            'message.min'      => 'Nội dung hỗ trợ tối thiểu phải từ 5 ký tự trở lên.',
        ]);

        $user = auth('sanctum')->user();

        $ticket = SupportTicket::create([
            'user_id'    => $user ? $user->id : null,
            'name'       => $validated['name'],
            'phone'      => $validated['phone'],
            'email'      => $validated['email'] ?? ($user ? $user->email : null),
            'order_code' => $validated['order_code'] ?? null,
            'subject'    => $validated['subject'],
            'message'    => $validated['message'],
            'status'     => 'pending',
        ]);

        return response()->json([
            'message' => 'Phiếu yêu cầu hỗ trợ của bạn đã được gửi thành công! Đội ngũ Chăm sóc Khách hàng sẽ liên hệ lại sớm nhất.',
            'data'    => $ticket,
        ], 201);
    }
}
