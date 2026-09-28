<?php

namespace App\Http\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    // 1. ĐĂNG KÝ (Register)
    public function register(Request $request)
    {
        $validated = $request->validate([
            'fullname' => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'phone'    => 'nullable|string|max:20',
            'address'  => 'nullable|string|max:255',
        ]);

        $user = User::create([
            'fullname' => $validated['fullname'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']), // Mã hóa mật khẩu
            'phone'    => $validated['phone'] ?? null,
            'address'  => $validated['address'] ?? null,
            'role'     => 'user', // Mặc định là tài khoản khách hàng
        ]);

        // Tạo Token ngay sau khi đăng ký thành công
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message'      => 'Đăng ký tài khoản thành công!',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => $user
        ], 201);
    }

    // 2. ĐĂNG NHẬP (Login)
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $validated['email'])->first();

        // Kiểm tra email và mật khẩu
        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Email hoặc mật khẩu không chính xác!'
            ], 401);
        }

        // Tạo Token xác thực
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message'      => 'Đăng nhập thành công!',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => $user
        ]);
    }

    // 3. ĐĂNG XUẤT (Logout)
    public function logout(Request $request)
    {
        // Xóa Token hiện tại của người dùng
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Đăng xuất thành công!'
        ]);
    }

    // 4. LẤY THÔNG TIN USER ĐANG ĐĂNG NHẬP
    public function profile(Request $request)
    {
        return response()->json($request->user());
    }
}