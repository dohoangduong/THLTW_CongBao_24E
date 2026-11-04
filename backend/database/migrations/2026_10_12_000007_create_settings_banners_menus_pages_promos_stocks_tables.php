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
        // 1. Bảng settings (Cấu hình website - FUNC-ADM-CONFIG-01)
        if (!Schema::hasTable('settings')) {
            Schema::create('settings', function (Blueprint $table) {
                $table->id();
                $table->string('site_name')->default('Bảo Công Studio');
                $table->string('logo', 500)->nullable();
                $table->string('favicon', 500)->nullable();
                $table->string('hotline', 50)->default('1900 8888');
                $table->string('email', 100)->default('cskh@baocongstudio.vn');
                $table->string('address', 500)->default('123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh');
                $table->string('working_hours', 100)->default('8h00 - 21h30 (Thứ 2 - Chủ Nhật)');
                $table->string('facebook_url', 500)->nullable();
                $table->string('youtube_url', 500)->nullable();
                $table->string('zalo_url', 500)->nullable();
                $table->string('tiktok_url', 500)->nullable();
                $table->string('meta_title', 255)->nullable();
                $table->text('meta_description')->nullable();
                $table->string('meta_keywords', 500)->nullable();
                $table->string('copyright_text', 255)->default('© 2026 Bảo Công Studio. All rights reserved.');
                $table->timestamps();
            });
        }

        // 2. Bảng banners (Quản lý Banner trang chủ - FUNC-ADM-BANNER-01..04)
        if (!Schema::hasTable('banners')) {
            Schema::create('banners', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->string('subtitle', 500)->nullable();
                $table->string('badge_text', 100)->nullable();
                $table->string('image', 500);
                $table->string('link_url', 500)->default('/products');
                $table->string('button_text', 100)->default('Khám phá ngay');
                $table->string('position', 50)->default('main_hero'); // main_hero hoặc sub_banner
                $table->integer('sort_order')->default(0);
                $table->tinyInteger('status')->default(1); // 1: hiện, 0: ẩn
                $table->timestamps();
            });
        }

        // 3. Bảng menus (Quản lý Menu điều hướng - FUNC-ADM-MENU-01..04)
        if (!Schema::hasTable('menus')) {
            Schema::create('menus', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('url', 500);
                $table->string('position', 50)->default('header'); // header hoặc footer
                $table->integer('sort_order')->default(0);
                $table->tinyInteger('status')->default(1);
                $table->timestamps();
            });
        }

        // 4. Bảng pages (Quản lý Trang đơn / Trang tĩnh - FUNC-ADM-PAGE-01..04)
        if (!Schema::hasTable('pages')) {
            Schema::create('pages', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->string('slug')->unique();
                $table->text('summary')->nullable();
                $table->longText('content');
                $table->tinyInteger('status')->default(1);
                $table->timestamps();
            });
        }

        // 5. Bảng post_categories (Chủ đề bài viết - FUNC-ADM-PCAT-01..04)
        if (!Schema::hasTable('post_categories')) {
            Schema::create('post_categories', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->unique();
                $table->text('description')->nullable();
                $table->integer('sort_order')->default(0);
                $table->tinyInteger('status')->default(1);
                $table->timestamps();
            });
        }

        // Bổ sung post_category_id vào bảng posts nếu chưa có
        Schema::table('posts', function (Blueprint $table) {
            if (!Schema::hasColumn('posts', 'post_category_id')) {
                $table->foreignId('post_category_id')->nullable()->after('category')->constrained('post_categories')->nullOnDelete();
            }
        });

        // 6. Bảng promotions (Mã khuyến mãi / Coupon - FUNC-ADM-PROMO-01..04 & FUNC-ORDER-02)
        if (!Schema::hasTable('promotions')) {
            Schema::create('promotions', function (Blueprint $table) {
                $table->id();
                $table->string('code', 50)->unique();
                $table->string('name');
                $table->string('discount_type', 20)->default('fixed'); // fixed hoặc percent
                $table->decimal('discount_value', 15, 2);
                $table->decimal('max_discount_amount', 15, 2)->nullable();
                $table->decimal('min_order_value', 15, 2)->default(0);
                $table->integer('usage_limit')->default(100);
                $table->integer('used_count')->default(0);
                $table->dateTime('start_date')->nullable();
                $table->dateTime('end_date')->nullable();
                $table->tinyInteger('status')->default(1);
                $table->timestamps();
            });
        }

        // 7. Bảng stock_movements (Quản lý Kho Nhập / Xuất - FUNC-ADM-STOCK-01..03)
        if (!Schema::hasTable('stock_movements')) {
            Schema::create('stock_movements', function (Blueprint $table) {
                $table->id();
                $table->string('code', 50)->unique();
                $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
                $table->string('type', 20); // import (nhập) hoặc export (xuất)
                $table->integer('quantity');
                $table->decimal('unit_cost', 15, 2)->default(0);
                $table->integer('stock_before')->default(0);
                $table->integer('stock_after')->default(0);
                $table->string('supplier_or_reason', 255);
                $table->text('note')->nullable();
                $table->string('created_by', 255)->nullable();
                $table->timestamps();
            });
        }

        // 8. Bảng order_status_histories (Lịch sử trạng thái đơn hàng - FUNC-ADM-ORDER-02)
        if (!Schema::hasTable('order_status_histories')) {
            Schema::create('order_status_histories', function (Blueprint $table) {
                $table->id();
                $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
                $table->string('status', 50);
                $table->text('note')->nullable();
                $table->string('changed_by', 255)->nullable();
                $table->timestamp('created_at')->useCurrent();
            });
        }

        // Bổ sung coupon_code và status_history vào bảng orders
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'coupon_code')) {
                $table->string('coupon_code', 50)->nullable()->after('discount');
            }
            if (!Schema::hasColumn('orders', 'status_history')) {
                $table->json('status_history')->nullable()->after('status');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'status_history')) {
                $table->dropColumn('status_history');
            }
            if (Schema::hasColumn('orders', 'coupon_code')) {
                $table->dropColumn('coupon_code');
            }
        });

        Schema::dropIfExists('order_status_histories');
        Schema::dropIfExists('stock_movements');
        Schema::dropIfExists('promotions');

        Schema::table('posts', function (Blueprint $table) {
            if (Schema::hasColumn('posts', 'post_category_id')) {
                $table->dropForeign(['post_category_id']);
                $table->dropColumn('post_category_id');
            }
        });

        Schema::dropIfExists('post_categories');
        Schema::dropIfExists('pages');
        Schema::dropIfExists('menus');
        Schema::dropIfExists('banners');
        Schema::dropIfExists('settings');
    }
};

