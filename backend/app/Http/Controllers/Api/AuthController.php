<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // 1. ĐĂNG KÝ
    public function register(Request $request)
    {
        $validated = $request->validate([
            'fullname' => 'sometimes|nullable|string|max:255',
            'name'     => 'sometimes|nullable|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'phone'    => 'nullable|string|max:20',
            'address'  => 'nullable|string|max:500',
        ]);

        $name = $request->input('fullname', $request->input('name', 'Khách hàng'));

        $user = User::create([
            'name'     => $name,
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone'    => $validated['phone'] ?? null,
            'address'  => $validated['address'] ?? null,
            'role'     => 'customer',
            'status'   => 1,
        ]);

        // Tạo token sau khi đăng ký
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message'      => 'Đăng ký tài khoản thành công!',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => $user,
        ], 201);
    }

    // 2. ĐĂNG NHẬP
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Email hoặc mật khẩu không chính xác!',
            ], 401);
        }

        // [THUẬT TOÁN KIỂM TRA TRẠNG THÁI KHÓA TÀI KHOẢN (BLOCK GUARD)]:
        // Ngăn chặn ngay lập tức tài khoản đã bị Quản trị viên chuyển status về 0 (bị khóa)
        if (!$user->status) {
            return response()->json([
                'message' => 'Tài khoản của bạn đã bị khóa bởi Quản trị viên! Vui lòng liên hệ bộ phận CSKH để được hỗ trợ.',
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message'      => 'Đăng nhập thành công!',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => $user,
        ]);
    }

    // 3. ĐĂNG XUẤT
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Đăng xuất thành công!',
        ]);
    }

    // 4. LẤY THÔNG TIN USER
    public function profile(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    // [THUẬT TOÁN QUÊN & ĐẶT LẠI MẬT KHẨU (FUNC-MEM-04)]:
    // Cho phép thành viên nhập Email + Số điện thoại xác minh để đặt lại mật khẩu mới trực tiếp vào bảng users
    public function forgotPassword(Request $request)
    {
        $validated = $request->validate([
            'email'                 => 'required|email',
            'phone'                 => 'required|string',
            'password'              => 'required|string|min:6|confirmed',
        ], [
            'email.required'        => 'Vui lòng nhập địa chỉ Email đăng ký!',
            'email.email'           => 'Địa chỉ Email không đúng định dạng!',
            'phone.required'        => 'Vui lòng nhập Số điện thoại xác minh!',
            'password.required'     => 'Vui lòng nhập mật khẩu mới!',
            'password.min'          => 'Mật khẩu mới phải có tối thiểu 6 ký tự!',
            'password.confirmed'    => 'Xác nhận mật khẩu mới không trùng khớp!',
        ]);

        $email = trim(strtolower($validated['email']));
        $phone = preg_replace('/[^0-9]/', '', $validated['phone']);

        $user = User::where('email', $email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy tài khoản với địa chỉ Email này trên hệ thống!',
            ], 422);
        }

        $userPhone = preg_replace('/[^0-9]/', '', (string) $user->phone);
        if (empty($userPhone) || $userPhone !== $phone) {
            return response()->json([
                'success' => false,
                'message' => 'Số điện thoại xác minh không khớp với thông tin đã đăng ký của tài khoản!',
            ], 422);
        }

        // Kiểm tra xem tài khoản có bị khóa không
        if (!$user->status) {
            return response()->json([
                'success' => false,
                'message' => 'Tài khoản này hiện đang bị khóa bởi Quản trị viên. Vui lòng liên hệ Hotline CSKH!',
            ], 403);
        }

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đặt lại mật khẩu thành công! Bạn có thể dùng mật khẩu mới để đăng nhập ngay.',
        ]);
    }
}