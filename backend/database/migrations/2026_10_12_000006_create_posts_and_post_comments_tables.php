<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Bảng posts (Bài viết công nghệ)
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('category')->default('Tin tức công nghệ'); // Đánh giá Flagship, Tin tức công nghệ, Mẹo & Thủ thuật, Khuyến mãi & Sự kiện
            $table->text('summary')->nullable();
            $table->longText('content');
            $table->string('thumbnail')->nullable();
            $table->string('author_name')->default('Ban Biên Tập Bảo Công Studio');
            $table->string('reading_time')->default('5 phút đọc');
            $table->unsignedBigInteger('views')->default(0);
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();

            // Các cờ điều khiển từ Quản trị viên Admin
            $table->boolean('is_featured')->default(false); // Ghim khối Bento Tâm điểm đầu trang
            $table->boolean('is_visible')->default(true);   // Hiển thị hoặc Đang ẩn
            $table->boolean('allow_comments')->default(true); // Cho phép hoặc Tạm khóa mục thảo luận

            $table->timestamps();
            $table->softDeletes();
        });

        // 2. Bảng post_comments (Thảo luận dưới bài viết)
        Schema::create('post_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained('posts')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('author_name');
            $table->string('author_email')->nullable();
            $table->text('content');
            $table->text('admin_reply')->nullable(); // Phản hồi chính thức từ Quản trị viên
            $table->boolean('is_visible')->default(true); // Admin duyệt Hiển thị hoặc Ẩn vi phạm
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('post_comments');
        Schema::dropIfExists('posts');
    }
};

