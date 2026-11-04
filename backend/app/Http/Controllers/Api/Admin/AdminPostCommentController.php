<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\PostComment;
use Illuminate\Http\Request;

class AdminPostCommentController extends Controller
{
    /**
     * Danh sách toàn bộ bình luận thảo luận từ các bài viết.
     */
    public function index(Request $request)
    {
        $query = PostComment::with([
            'post:id,title,slug',
            'user:id,name,email',
        ]);

        // Lọc theo bài viết cụ thể
        if ($request->filled('post_id')) {
            $query->where('post_id', $request->post_id);
        }

        // Lọc theo trạng thái phản hồi / hiển thị
        if ($request->filled('status')) {
            $status = $request->status;
            if ($status === 'unreplied') {
                $query->where(function ($q) {
                    $q->whereNull('admin_reply')->orWhere('admin_reply', '');
                });
            } elseif ($status === 'hidden') {
                $query->where('is_visible', false);
            } elseif ($status === 'visible') {
                $query->where('is_visible', true);
            }
        }

        // Tìm kiếm theo nội dung hoặc tên người gửi
        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('content', 'like', "%{$search}%")
                  ->orWhere('author_name', 'like', "%{$search}%")
                  ->orWhere('author_email', 'like', "%{$search}%");
            });
        }

        $perPage = (int) $request->get('per_page', 15);
        $comments = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data'    => $comments->items(),
            'meta'    => [
                'current_page' => $comments->currentPage(),
                'last_page'    => $comments->lastPage(),
                'per_page'     => $comments->perPage(),
                'total'        => $comments->total(),
            ],
        ]);
    }

    /**
     * Thống kê bình luận cho Admin.
     */
    public function stats()
    {
        $total = PostComment::count();
        $unreplied = PostComment::whereNull('admin_reply')->orWhere('admin_reply', '')->count();
        $hidden = PostComment::where('is_visible', false)->count();

        return response()->json([
            'success' => true,
            'stats'   => [
                'total'     => $total,
                'unreplied' => $unreplied,
                'hidden'    => $hidden,
            ],
        ]);
    }

    /**
     * Quản trị viên phản hồi chính thức cho bình luận của khách hàng.
     */
    public function reply(Request $request, $id)
    {
        $comment = PostComment::findOrFail($id);

        $request->validate([
            'admin_reply' => 'required|string|min:2|max:2000',
        ], [
            'admin_reply.required' => 'Vui lòng nhập nội dung câu trả lời.',
            'admin_reply.min'      => 'Câu trả lời phải có ít nhất 2 ký tự.',
        ]);

        $comment->admin_reply = trim($request->admin_reply);
        $comment->save();

        return response()->json([
            'success' => true,
            'message' => 'Đã lưu phản hồi chính thức cho bình luận thảo luận!',
            'data'    => $comment->load('post:id,title,slug'),
        ]);
    }

    /**
     * Nút 1-chạm: Ẩn / Hiện bình luận vi phạm hoặc bình luận spam.
     */
    public function toggleVisibility($id)
    {
        $comment = PostComment::findOrFail($id);
        $comment->is_visible = !$comment->is_visible;
        $comment->save();

        $text = $comment->is_visible ? 'HIỂN THỊ' : 'ẨN';
        return response()->json([
            'success'    => true,
            'message'    => "Đã chuyển trạng thái bình luận sang {$text}!",
            'is_visible' => $comment->is_visible,
        ]);
    }

    /**
     * Xóa vĩnh viễn bình luận.
     */
    public function destroy($id)
    {
        $comment = PostComment::findOrFail($id);
        $comment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa vĩnh viễn bình luận thảo luận thành công!',
        ]);
    }
}

