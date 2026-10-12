<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    // PUT /api/profile - Cập nhật thông tin cá nhân
    public function update(Request $request)
    {
        $data = $request->validate([
            'name'    => 'required|string|max:255',
            'phone'   => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'avatar'  => 'nullable|string|max:500',
        ]);

        $user = $request->user();
        $user->update($data);

        return response()->json([
            'message' => 'Cập nhật thông tin thành công',
            'user'    => $user,
        ]);
    }

    // PUT /api/profile/password - Đổi mật khẩu
    public function changePassword(Request $request)
    {
        $data = $request->validate([
            'current_password' => 'required|string',
            'password'         => 'required|string|min:6|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($data['current_password'], $user->password)) {
            return response()->json(['message' => 'Mật khẩu hiện tại không chính xác'], 422);
        }

        $user->update(['password' => $data['password']]);

        // Đăng xuất các thiết bị khác, giữ lại phiên hiện tại
        if ($user->currentAccessToken()) {
            $user->tokens()->where('id', '!=', $user->currentAccessToken()->id)->delete();
        }

        return response()->json(['message' => 'Đổi mật khẩu thành công']);
    }
}
