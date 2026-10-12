<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsAdmin
{
    /**
     * Handle an incoming request: Strictly Admin only
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'message' => 'Lỗi bảo mật: Bạn không có quyền truy cập chức năng này (chỉ dành cho Quản trị viên)!'
            ], 403);
        }

        return $next($request);
    }
}
