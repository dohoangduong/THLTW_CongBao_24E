<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\PostComment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminPostController extends Controller
{
    /**
     * Danh sách bài viết quản trị.
     */
    public function index(Request $request)
    {
        $query = Post::with(['product:id,name,price,sale_price,image'])->withCount('comments');

        // Tìm kiếm theo tiêu đề hoặc tóm tắt
        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('summary', 'like', "%{$search}%");
            });
        }

        // Lọc chuyên mục
        if ($request->filled('category') && $request->category !== 'all' && $request->category !== 'Tất cả chuyên mục') {
            $query->where('category', $request->category);
        }

        // Lọc theo trạng thái hiển thị
        if ($request->filled('is_visible')) {
            $query->where('is_visible', filter_var($request->is_visible, FILTER_VALIDATE_BOOLEAN));
        }

        // Lọc bài ghim
        if ($request->filled('is_featured')) {
            $query->where('is_featured', filter_var($request->is_featured, FILTER_VALIDATE_BOOLEAN));
        }

        $perPage = (int) $request->get('per_page', 10);
        $posts = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data'    => $posts->items(),
            'meta'    => [
                'current_page' => $posts->currentPage(),
                'last_page'    => $posts->lastPage(),
                'per_page'     => $posts->perPage(),
                'total'        => $posts->total(),
            ],
        ]);
    }

    /**
     * Thống kê tổng quan Bài viết công nghệ cho Dashboard Admin.
     */
    public function stats()
    {
        $totalPosts = Post::count();
        $visiblePosts = Post::where('is_visible', true)->count();
        $totalViews = (int) Post::sum('views');
        $totalComments = PostComment::count();
        $featuredPosts = Post::where('is_featured', true)->count();

        return response()->json([
            'success' => true,
            'stats'   => [
                'total_posts'    => $totalPosts,
                'visible_posts'  => $visiblePosts,
                'hidden_posts'   => $totalPosts - $visiblePosts,
                'total_views'    => $totalViews,
                'total_comments' => $totalComments,
                'featured_posts' => $featuredPosts,
            ],
        ]);
    }

    /**
     * Chi tiết bài viết để chỉnh sửa.
     */
    public function show($id)
    {
        $post = Post::withCount('comments')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $post,
        ]);
    }

    /**
     * Thêm mới bài viết.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'          => 'required|string|max:255',
            'category'       => 'required|string|max:100',
            'summary'        => 'nullable|string|max:1000',
            'content'        => 'required|string',
            'thumbnail'      => 'nullable|string|max:500',
            'author_name'    => 'nullable|string|max:100',
            'reading_time'   => 'nullable|string|max:50',
            'is_featured'    => 'nullable|boolean',
            'is_visible'     => 'nullable|boolean',
            'allow_comments' => 'nullable|boolean',
            'product_id'     => 'nullable|integer',
        ], [
            'title.required'   => 'Vui lòng nhập tiêu đề bài viết.',
            'category.required'=> 'Vui lòng chọn hoặc nhập chuyên mục.',
            'content.required' => 'Vui lòng nhập nội dung chi tiết bài viết.',
        ]);

        // Tạo slug duy nhất
        $baseSlug = Str::slug($validated['title']);
        $slug = $baseSlug;
        $counter = 1;
        while (Post::where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        $post = Post::create([
            'title'          => $validated['title'],
            'slug'           => $slug,
            'category'       => $validated['category'],
            'summary'        => $validated['summary'] ?? null,
            'content'        => $validated['content'],
            'thumbnail'      => $validated['thumbnail'] ?? null,
            'author_name'    => $validated['author_name'] ?: 'Ban Biên Tập Bảo Công Studio',
            'reading_time'   => $validated['reading_time'] ?: '5 phút đọc',
            'views'          => 0,
            'is_featured'    => $request->boolean('is_featured', false),
            'is_visible'     => $request->boolean('is_visible', true),
            'allow_comments' => $request->boolean('allow_comments', true),
            'product_id'     => $request->filled('product_id') ? (int) $request->product_id : null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tạo bài viết công nghệ mới thành công!',
            'data'    => $post,
        ], 201);
    }

    /**
     * Cập nhật bài viết.
     */
    public function update(Request $request, $id)
    {
        $post = Post::findOrFail($id);

        $validated = $request->validate([
            'title'          => 'required|string|max:255',
            'category'       => 'required|string|max:100',
            'summary'        => 'nullable|string|max:1000',
            'content'        => 'required|string',
            'thumbnail'      => 'nullable|string|max:500',
            'author_name'    => 'nullable|string|max:100',
            'reading_time'   => 'nullable|string|max:50',
            'is_featured'    => 'nullable|boolean',
            'is_visible'     => 'nullable|boolean',
            'allow_comments' => 'nullable|boolean',
            'product_id'     => 'nullable|integer|exists:products,id',
        ]);

        // Cập nhật slug nếu tiêu đề thay đổi
        if ($post->title !== $validated['title']) {
            $baseSlug = Str::slug($validated['title']);
            $slug = $baseSlug;
            $counter = 1;
            while (Post::where('slug', $slug)->where('id', '!=', $post->id)->exists()) {
                $slug = "{$baseSlug}-{$counter}";
                $counter++;
            }
            $post->slug = $slug;
        }

        $post->title = $validated['title'];
        $post->category = $validated['category'];
        $post->summary = $validated['summary'] ?? null;
        $post->content = $validated['content'];
        $post->thumbnail = $validated['thumbnail'] ?? $post->thumbnail;
        if (!empty($validated['author_name'])) {
            $post->author_name = $validated['author_name'];
        }
        if (!empty($validated['reading_time'])) {
            $post->reading_time = $validated['reading_time'];
        }
        if ($request->has('is_featured')) {
            $post->is_featured = $request->boolean('is_featured');
        }
        if ($request->has('is_visible')) {
            $post->is_visible = $request->boolean('is_visible');
        }
        if ($request->has('allow_comments')) {
            $post->allow_comments = $request->boolean('allow_comments');
        }
        if ($request->has('product_id')) {
            $post->product_id = $request->filled('product_id') ? (int) $request->product_id : null;
        }

        $post->save();

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật bài viết thành công!',
            'data'    => $post,
        ]);
    }

    /**
     * Xóa bài viết (Soft Delete).
     */
    public function destroy($id)
    {
        $post = Post::findOrFail($id);
        $post->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã chuyển bài viết vào thùng rác thành công!',
        ]);
    }

    /**
     * Nút 1-chạm: Bật / Tắt Hiển thị bài viết (is_visible).
     */
    public function toggleVisibility($id)
    {
        $post = Post::findOrFail($id);
        $post->is_visible = !$post->is_visible;
        $post->save();

        $statusText = $post->is_visible ? 'HIỂN THỊ' : 'ẨN';
        return response()->json([
            'success'    => true,
            'message'    => "Đã chuyển trạng thái bài viết sang {$statusText}!",
            'is_visible' => $post->is_visible,
        ]);
    }

    /**
     * Nút 1-chạm: Ghim / Bỏ ghim bài viết vào Khung Bento Tâm Điểm (is_featured).
     */
    public function toggleFeatured($id)
    {
        $post = Post::findOrFail($id);
        $post->is_featured = !$post->is_featured;
        if ($post->is_featured) {
            $post->touch(); // Cập nhật updated_at để bài được ghim mới nhất luôn nhảy lên vị trí Hero đầu bảng
        }
        $post->save();

        $featuredText = $post->is_featured ? 'ĐÃ GHIM TÂM ĐIỂM' : 'BỎ GHIM';
        return response()->json([
            'success'     => true,
            'message'     => "Đã cập nhật bài viết: {$featuredText}!",
            'is_featured' => $post->is_featured,
        ]);
    }

    /**
     * Nút 1-chạm: Đóng / Mở mục Thảo luận bình luận của bài viết (allow_comments).
     */
    public function toggleComments($id)
    {
        $post = Post::findOrFail($id);
        $post->allow_comments = !$post->allow_comments;
        $post->save();

        $lockText = $post->allow_comments ? 'MỞ THẢO LUẬN' : 'TẠM KHÓA THẢO LUẬN';
        return response()->json([
            'success'        => true,
            'message'        => "Đã chuyển trạng thái bài viết sang {$lockText}!",
            'allow_comments' => $post->allow_comments,
        ]);
    }
}

