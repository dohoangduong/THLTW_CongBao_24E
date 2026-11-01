<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class AdminReviewController extends Controller
{
    private function checkStaffAccess(): void
    {
        $user = auth('sanctum')->user();
        if (!$user || !in_array($user->role, ['admin', 'manager'])) {
            abort(response()->json([
                'message' => 'Lỗi bảo mật: Bạn không có quyền truy cập quản lý Đánh giá!'
            ], 403));
        }
    }

    // [THUẬT TOÁN QUẢN LÝ ĐÁNH GIÁ SẢN PHẨM TRONG ADMIN]:
    // Lấy danh sách đánh giá từ khách hàng, lọc theo trạng thái ẩn/hiện và từ khóa tìm kiếm.
    public function index(Request $request)
    {
        $this->checkStaffAccess();

        $query = Review::with(['product:id,name,image,sku,price', 'user:id,name,email'])
            ->orderByDesc('id');

        if ($request->filled('status')) {
            $query->where('status', (int) $request->status);
        }

        if ($request->filled('rating')) {
            $query->where('rating', (int) $request->rating);
        }

        $search = $request->input('search', $request->input('q'));
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('comment', 'like', "%{$search}%")
                  ->orWhere('reviewer_name', 'like', "%{$search}%")
                  ->orWhere('reviewer_email', 'like', "%{$search}%")
                  ->orWhereHas('product', function ($pq) use ($search) {
                      $pq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $perPage = (int) $request->input('per_page', 10);
        $paginated = $query->paginate($perPage);

        $response = $paginated->toArray();
        $response['kpi_stats'] = [
            'total'          => Review::count(),
            'average_rating' => round((float) (Review::where('status', 1)->avg('rating') ?: 5.0), 1),
            'five_stars'     => Review::where('rating', 5)->count(),
            'hidden'         => Review::where('status', 0)->count(),
        ];

        return response()->json($response);
    }

    // [THUẬT TOÁN KIỂM DUYỆT ẨN / HIỆN ĐÁNH GIÁ]:
    // Đổi trạng thái status (1: hiển thị ra trang sản phẩm người dùng, 0: tạm ẩn vi phạm).
    public function updateStatus(Request $request, $id)
    {
        $this->checkStaffAccess();

        $review = Review::findOrFail($id);
        $newStatus = $request->has('status') ? (int) $request->status : ($review->status ? 0 : 1);
        $review->status = $newStatus;
        $review->save();

        return response()->json([
            'message' => $newStatus === 1 ? 'Đã duyệt hiển thị đánh giá' : 'Đã ẩn đánh giá khỏi giao diện người dùng',
            'data'    => $review,
        ]);
    }

    // [THUẬT TOÁN PHẢN HỒI ĐÁNH GIÁ CỦA KHÁCH HÀNG]:
    // Ghi nhận phản hồi chính thức từ Quản trị viên để hiển thị công khai dưới nhận xét.
    public function reply(Request $request, $id)
    {
        $this->checkStaffAccess();

        $validated = $request->validate([
            'admin_reply' => 'required|string|max:2000',
        ], [
            'admin_reply.required' => 'Vui lòng nhập nội dung câu trả lời từ Quản trị viên.',
        ]);

        $review = Review::findOrFail($id);
        $review->admin_reply = $validated['admin_reply'];
        $review->save();

        return response()->json([
            'message' => 'Đã lưu phản hồi của Quản trị viên thành công',
            'data'    => $review,
        ]);
    }

    // [THUẬT TOÁN XÓA ĐÁNH GIÁ]:
    public function destroy($id)
    {
        $this->checkStaffAccess();

        $review = Review::findOrFail($id);
        $review->delete();

        return response()->json([
            'message' => 'Đã xóa đánh giá thành công',
        ]);
    }
}
