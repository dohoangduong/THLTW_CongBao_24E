<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\PostComment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PostController extends Controller
{
    /**
     * Danh sách bài viết công nghệ hiển thị cho khách hàng.
     */
    public function index(Request $request)
    {
        $query = Post::visible()->withCount('visibleComments');

        // Lọc theo chuyên mục (Đồng bộ theo category text hoặc liên kết post_category_id / slug)
        if ($request->filled('category') && $request->category !== 'all' && $request->category !== 'Tất cả chuyên mục') {
            $cat = $request->category;
            $query->where(function ($q) use ($cat) {
                $q->where('category', $cat)
                  ->orWhere('post_category_id', $cat)
                  ->orWhereHas('postCategory', function ($pc) use ($cat) {
                      $pc->where('name', $cat)->orWhere('slug', $cat);
                  });
            });
        }

        // Tìm kiếm theo từ khóa (tiêu đề, tóm tắt)
        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('summary', 'like', "%{$search}%");
            });
        }

        // Sắp xếp
        $sort = $request->get('sort', 'latest');
        if ($sort === 'views') {
            $query->orderBy('views', 'desc');
        } elseif ($sort === 'comments') {
            $query->orderBy('visible_comments_count', 'desc');
        } else {
            // latest
            $query->orderBy('created_at', 'desc');
        }

        $perPage = (int) $request->get('per_page', 9);
        $posts = $query->paginate($perPage);

        // 1. Bài Tâm Điểm Lớn (Hero 8 cột): Lấy bài is_featured = true được ghim/cập nhật mới nhất!
        $featuredPost = Post::visible()
            ->withCount('visibleComments')
            ->where('is_featured', true)
            ->orderBy('updated_at', 'desc')
            ->first();

        // Nếu chưa có bài nào được gắn cờ is_featured, lấy bài mới nhất có nhiều views nhất
        if (!$featuredPost) {
            $featuredPost = Post::visible()
                ->withCount('visibleComments')
                ->orderBy('views', 'desc')
                ->orderBy('updated_at', 'desc')
                ->first();
        }

        // 2. Hai bài phụ cột phải (Hero 4 cột):
        // Ưu tiên lấy các bài CŨNG ĐƯỢC GHIM khác (is_featured = true) ngoài $featuredPost!
        // Nếu không đủ 2 bài ghim, bổ sung các bài có views cao nhất (không ghim)
        $sideFeatured = Post::visible()
            ->withCount('visibleComments')
            ->where('is_featured', true)
            ->when($featuredPost, function ($q) use ($featuredPost) {
                $q->where('id', '!=', $featuredPost->id);
            })
            ->orderBy('updated_at', 'desc')
            ->limit(2)
            ->get();

        $needed = 2 - $sideFeatured->count();
        if ($needed > 0) {
            $excludeIds = $sideFeatured->pluck('id')->toArray();
            if ($featuredPost) {
                $excludeIds[] = $featuredPost->id;
            }
            $trending = Post::visible()
                ->withCount('visibleComments')
                ->whereNotIn('id', $excludeIds)
                ->orderBy('views', 'desc')
                ->limit($needed)
                ->get();
            $sidePosts = $sideFeatured->merge($trending);
        } else {
            $sidePosts = $sideFeatured;
        }

        return response()->json([
            'success'  => true,
            'data'     => $posts->items(),
            'meta'     => [
                'current_page' => $posts->currentPage(),
                'last_page'    => $posts->lastPage(),
                'per_page'     => $posts->perPage(),
                'total'        => $posts->total(),
            ],
            'featured' => $featuredPost,
            'trending' => $sidePosts,
        ]);
    }

    /**
     * Chi tiết bài viết công nghệ + Sản phẩm liên kết + Bài viết liên quan + Tự động tăng lượt xem.
     */
    public function show(Request $request, $id)
    {
        // Cho phép tìm bằng id hoặc slug
        $post = Post::where(function ($q) use ($id) {
            if (is_numeric($id)) {
                $q->where('id', $id);
            } else {
                $q->where('slug', $id);
            }
        })
        ->where('is_visible', true)
        ->with([
            'product',
            'visibleComments' => function ($q) {
                $q->latest();
            }
        ])
        ->first();

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy bài viết hoặc bài viết đã bị ẩn.',
            ], 404);
        }

        // Tự động tăng lượt xem (+1 views)
        $post->increment('views');

        // Tìm sản phẩm liên quan gắn kèm bài viết
        $relatedProduct = $post->product;
        if (!$relatedProduct) {
            $titleLower = mb_strtolower($post->title, 'UTF-8');
            if (str_contains($titleLower, 's24') || str_contains($titleLower, 'samsung')) {
                $relatedProduct = \App\Models\Product::where('name', 'like', '%S24%')->first();
            } elseif (str_contains($titleLower, 'iphone 16')) {
                $relatedProduct = \App\Models\Product::where('name', 'like', '%iPhone 16 Pro Max%')->first();
            } elseif (str_contains($titleLower, 'iphone 15') || str_contains($titleLower, 'like new')) {
                $relatedProduct = \App\Models\Product::where('name', 'like', '%iPhone 15 Pro Max%')->first();
            } elseif (str_contains($titleLower, 'xiaomi 14')) {
                $relatedProduct = \App\Models\Product::where('name', 'like', '%Xiaomi 14 Ultra%')->first();
            } elseif (str_contains($titleLower, 'gaming')) {
                $relatedProduct = \App\Models\Product::where('name', 'like', '%Realme GT5%')->first();
            } elseif (str_contains($titleLower, 'ipad') || str_contains($titleLower, 'm4')) {
                $relatedProduct = \App\Models\Product::where('name', 'like', '%iPad Pro%')->first();
            } elseif (str_contains($titleLower, 'oppo') || str_contains($titleLower, 'find x7')) {
                $relatedProduct = \App\Models\Product::where('name', 'like', '%OPPO Find X7%')->first();
            } else {
                $relatedProduct = \App\Models\Product::where('stock', '>', 0)->first();
            }
        }

        // Lấy 3 bài viết cùng chuyên mục liên quan
        $relatedPosts = Post::visible()
            ->withCount('visibleComments')
            ->where('id', '!=', $post->id)
            ->where('category', $post->category)
            ->latest('updated_at')
            ->limit(3)
            ->get();

        // Nếu không đủ 3 bài cùng chuyên mục, bổ sung các bài mới nhất khác
        if ($relatedPosts->count() < 3) {
            $extra = Post::visible()
                ->withCount('visibleComments')
                ->where('id', '!=', $post->id)
                ->whereNotIn('id', $relatedPosts->pluck('id'))
                ->latest('updated_at')
                ->limit(3 - $relatedPosts->count())
                ->get();
            $relatedPosts = $relatedPosts->merge($extra);
        }

        return response()->json([
            'success'         => true,
            'data'            => $post,
            'related_product' => $relatedProduct,
            'comments'        => $post->visibleComments,
            'related_posts'   => $relatedPosts,
        ]);
    }

    /**
     * Khách hàng gửi bình luận thảo luận cho bài viết.
     */
    public function storeComment(Request $request, $id)
    {
        $post = Post::find($id);

        if (!$post || !$post->is_visible) {
            return response()->json([
                'success' => false,
                'message' => 'Bài viết không tồn tại hoặc đã bị ẩn.',
            ], 404);
        }

        // Kiểm tra quyền thảo luận từ Admin
        if (!$post->allow_comments) {
            return response()->json([
                'success' => false,
                'message' => 'Mục thảo luận cho bài viết này hiện đang được Quản trị viên tạm khóa.',
            ], 403);
        }

        // Kiểm tra người dùng đăng nhập
        $user = Auth::guard('sanctum')->user();
        if ($user) {
            // Kiểm tra trạng thái khóa tài khoản
            if (isset($user->status) && ((int) $user->status === 0 || $user->status === 'blocked' || !empty($user->is_blocked))) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tài khoản của bạn đã bị khóa tính năng bình luận.',
                ], 403);
            }
        }

        $request->validate([
            'content'       => 'required|string|min:3|max:2000',
            'author_name'   => 'nullable|string|max:100',
            'author_email'  => 'nullable|email|max:150',
        ], [
            'content.required' => 'Vui lòng nhập nội dung thảo luận.',
            'content.min'      => 'Nội dung thảo luận phải có ít nhất 3 ký tự.',
        ]);

        $authorName = $user ? $user->name : ($request->author_name ?: 'Khách hàng');
        $authorEmail = $user ? $user->email : $request->author_email;

        $comment = PostComment::create([
            'post_id'      => $post->id,
            'user_id'      => $user ? $user->id : null,
            'author_name'  => $authorName,
            'author_email' => $authorEmail,
            'content'      => trim($request->content),
            'admin_reply'  => null,
            'is_visible'   => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Gửi bình luận thảo luận thành công!',
            'data'    => $comment,
        ], 201);
    }
}

