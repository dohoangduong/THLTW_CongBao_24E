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
        // 1. Bảng reviews (Đánh giá sản phẩm)
        if (!Schema::hasTable('reviews')) {
            Schema::create('reviews', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('product_id');
                $table->unsignedBigInteger('user_id')->nullable();
                $table->string('reviewer_name', 255);
                $table->string('reviewer_email', 255)->nullable();
                $table->tinyInteger('rating')->default(5); // 1-5 sao
                $table->text('comment');
                $table->text('admin_reply')->nullable();
                $table->tinyInteger('status')->default(1); // 1: Hiển thị, 0: Ẩn/Chờ duyệt
                $table->timestamps();
                $table->softDeletes();

                $table->foreign('product_id')
                    ->references('id')
                    ->on('products')
                    ->onDelete('cascade');

                $table->foreign('user_id')
                    ->references('id')
                    ->on('users')
                    ->onDelete('set null');
            });
        }

        // 2. Bảng support_tickets (Phiếu hỗ trợ / Liên hệ)
        if (!Schema::hasTable('support_tickets')) {
            Schema::create('support_tickets', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->nullable();
                $table->string('name', 255);
                $table->string('phone', 50);
                $table->string('email', 255)->nullable();
                $table->string('order_code', 100)->nullable();
                $table->string('subject', 255);
                $table->text('message');
                $table->string('status', 50)->default('pending'); // pending, processing, resolved
                $table->text('admin_notes')->nullable();
                $table->timestamps();

                $table->foreign('user_id')
                    ->references('id')
                    ->on('users')
                    ->onDelete('set null');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('support_tickets');
        Schema::dropIfExists('reviews');
    }
};
