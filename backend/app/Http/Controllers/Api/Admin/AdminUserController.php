<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    // GET /api/admin/users?q=&role=&page=
    public function index(Request $request)
    {
        $query = User::withCount('orders')->orderByDesc('id');

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }
        if ($request->filled('q')) {
            $q = $request->q;
            $query->where(function ($w) use ($q) {
                $w->where('name', 'like', "%$q%")
                  ->orWhere('email', 'like', "%$q%")
                  ->orWhere('phone', 'like', "%$q%");
            });
        }

        return response()->json($query->paginate(10));
    }

    // GET /api/admin/users/{id}
    public function show($id)
    {
        $user = User::withCount('orders')->find($id);

        if (!$user) {
            return response()->json(['message' => 'Không tìm thấy người dùng'], 404);
        }
        return response()->json(['data' => $user]);
    }

    // PUT /api/admin/users/{id} - Sửa thông tin, đổi quyền, khóa/mở khóa
    public function update(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Không tìm thấy người dùng'], 404);
        }

        $data = $request->validate([
            'name'    => 'sometimes|required|string|max:255',
            'phone'   => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'role'    => 'sometimes|in:customer,admin',
            'status'  => 'sometimes|boolean',
        ]);

        // Không cho admin tự hạ quyền hoặc tự khóa chính mình
        if ($user->id === $request->user()->id) {
            if (isset($data['role']) && $data['role'] !== 'admin') {
                return response()->json(['message' => 'Không thể tự hạ quyền của chính mình'], 422);
            }
            if (isset($data['status']) && !$data['status']) {
                return response()->json(['message' => 'Không thể tự khóa tài khoản của chính mình'], 422);
            }
        }

        $user->update($data);

        // Khóa tài khoản thì đăng xuất mọi thiết bị
        if (array_key_exists('status', $data) && !$data['status']) {
            $user->tokens()->delete();
        }

        return response()->json(['message' => 'Cập nhật người dùng thành công', 'data' => $user->fresh()]);
    }

    // DELETE /api/admin/users/{id}
    public function destroy(Request $request, $id)
    {
        $user = User::withCount('orders')->find($id);
        if (!$user) {
            return response()->json(['message' => 'Không tìm thấy người dùng'], 404);
        }
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Không thể tự xóa chính mình'], 422);
        }
        if ($user->orders_count > 0) {
            return response()->json([
                'message' => 'Người dùng đã có đơn hàng, hãy khóa tài khoản thay vì xóa',
            ], 409);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'Xóa người dùng thành công']);
    }
}
