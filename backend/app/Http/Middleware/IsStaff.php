<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsStaff
{
    /**
     * Handle an incoming request: Allows Admin and Manager
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || !in_array($user->role, ['admin', 'manager'])) {
            return response()->json([
                'message' => 'Lỗi bảo mật: Bạn không có quyền truy cập chức năng này (chỉ dành cho Nhân viên/Quản lý)!'
            ], 403);
        }

        return $next($request);
    }
}
