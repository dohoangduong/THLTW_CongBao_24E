<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminUserController extends Controller
{
    /**
     * BẢO MẬT & PHÂN QUYỀN:
     * Chỉ Super Admin mới được phép can thiệp vào Module Người dùng.
     * Tài khoản Manager tuyệt đối KHÔNG có quyền truy cập module này!
     */
    private function checkAdminOnlyAccess(): void
    {
        $user = auth('sanctum')->user();
        if (!$user || $user->role !== 'admin') {
            abort(response()->json([
                'message' => 'Lỗi bảo mật: Bạn không có quyền can thiệp vào Module Quản lý Người dùng!'
            ], 403));
        }
    }

    // GET /api/admin/users - Danh sách người dùng có phân trang và bộ lọc
    public function index(Request $request)
    {
        $this->checkAdminOnlyAccess();

        $query = User::withCount('orders')->orderByDesc('id');

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        $q = $request->input('q', $request->input('search'));
        if ($q) {
            $query->where(function ($w) use ($q) {
                $w->where('name', 'like', "%{$q}%")
                  ->orWhere('email', 'like', "%{$q}%")
                  ->orWhere('phone', 'like', "%{$q}%");
            });
        }

        $perPage = (int) $request->input('per_page', 10);
        return response()->json($query->paginate($perPage));
    }

    // GET /api/admin/users/{id} - Chi tiết người dùng
    public function show($id)
    {
        $this->checkAdminOnlyAccess();

        $user = User::withCount('orders')->with('orders')->find($id);

        if (!$user) {
            return response()->json(['message' => 'Không tìm thấy người dùng'], 404);
        }

        return response()->json(['data' => $user]);
    }

    // POST /api/admin/users - Thêm người dùng mới
    public function store(Request $request)
    {
        $this->checkAdminOnlyAccess();

        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email|max:255',
            'password' => 'required|string|min:6',
            'phone'    => 'nullable|string|max:20',
            'address'  => 'nullable|string|max:500',
            'role'     => 'required|in:customer,manager,admin',
            'status'   => 'sometimes|boolean',
        ]);

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => $data['password'], // cast 'hashed' trong Model User sẽ tự hash
            'phone'    => $data['phone'] ?? null,
            'address'  => $data['address'] ?? null,
            'role'     => $data['role'],
            'status'   => $data['status'] ?? 1,
        ]);

        return response()->json([
            'message' => 'Thêm người dùng mới thành công',
            'data'    => $user,
        ], 201);
    }

    // PUT /api/admin/users/{id} - Sửa thông tin, đổi vai trò, khóa/mở khóa
    public function update(Request $request, $id)
    {
        $this->checkAdminOnlyAccess();

        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Không tìm thấy người dùng'], 404);
        }

        $data = $request->validate([
            'name'     => 'sometimes|required|string|max:255',
            'email'    => "sometimes|required|email|unique:users,email,{$id}|max:255",
            'phone'    => 'nullable|string|max:20',
            'address'  => 'nullable|string|max:500',
            'role'     => 'sometimes|in:customer,manager,admin',
            'status'   => 'sometimes|boolean',
            'password' => 'nullable|string|min:6',
        ]);

        // Tránh tình huống Admin tự hạ quyền hoặc tự khóa chính mình
        $currentUser = $request->user();
        if ($user->id === $currentUser->id) {
            if (isset($data['role']) && $data['role'] !== 'admin') {
                return response()->json(['message' => 'Không thể tự hạ quyền của chính mình'], 422);
            }
            if (isset($data['status']) && !$data['status']) {
                return response()->json(['message' => 'Không thể tự khóa tài khoản của chính mình'], 422);
            }
        }

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $user->update($data);

        // Khóa tài khoản thì thu hồi toàn bộ token đăng nhập
        if (array_key_exists('status', $data) && !$data['status']) {
            $user->tokens()->delete();
        }

        return response()->json([
            'message' => 'Cập nhật thông tin người dùng thành công',
            'data'    => $user->fresh(),
        ]);
    }

    // DELETE /api/admin/users/{id} - Xóa mềm người dùng
    public function destroy(Request $request, $id)
    {
        $this->checkAdminOnlyAccess();

        $user = User::withCount('orders')->find($id);
        if (!$user) {
            return response()->json(['message' => 'Không tìm thấy người dùng'], 404);
        }

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Không thể tự xóa tài khoản của chính mình'], 422);
        }

        // Thu hồi toàn bộ token của user và xóa mềm
        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'Đã chuyển người dùng vào thùng rác thành công']);
    }

    // GET /api/admin/users/trash - Danh sách người dùng trong thùng rác
    public function trash(Request $request)
    {
        $this->checkAdminOnlyAccess();

        $query = User::onlyTrashed()->withCount('orders')->orderByDesc('deleted_at');
        $perPage = (int) $request->input('per_page', 10);

        if ($request->boolean('all')) {
            return response()->json(['data' => $query->get()]);
        }

        return response()->json($query->paginate($perPage));
    }

    // POST /api/admin/users/{id}/restore - Khôi phục người dùng từ thùng rác
    public function restore($id)
    {
        $this->checkAdminOnlyAccess();

        $user = User::onlyTrashed()->findOrFail($id);
        $user->restore();

        return response()->json([
            'message' => 'Khôi phục tài khoản người dùng thành công',
            'data'    => $user,
        ]);
    }

    // DELETE /api/admin/users/{id}/force - Xóa vĩnh viễn người dùng
    public function forceDelete(Request $request, $id)
    {
        $this->checkAdminOnlyAccess();

        $user = User::onlyTrashed()->withCount('orders')->findOrFail($id);
        if ($user->orders_count > 0) {
            return response()->json([
                'message' => 'Người dùng này đã có lịch sử đơn hàng trong hệ thống. Không được xóa vĩnh viễn để đảm bảo toàn vẹn dữ liệu!',
            ], 409);
        }

        $user->tokens()->delete();
        $user->forceDelete();

        return response()->json(['message' => 'Đã xóa vĩnh viễn người dùng khỏi cơ sở dữ liệu']);
    }
}
