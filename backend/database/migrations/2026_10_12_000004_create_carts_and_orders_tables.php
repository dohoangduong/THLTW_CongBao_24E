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
        // 1. Cập nhật bảng users (thêm deleted_at, avatar nếu chưa có)
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'avatar')) {
                $table->string('avatar', 500)->nullable();
            }
            if (!Schema::hasColumn('users', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        // Cập nhật bổ sung cho products, categories, brands nếu thiếu
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'sku')) {
                $table->string('sku', 100)->nullable();
            }
            if (!Schema::hasColumn('products', 'views')) {
                $table->unsignedBigInteger('views')->default(0);
            }
            if (!Schema::hasColumn('products', 'featured')) {
                $table->boolean('featured')->default(false);
            }
        });

        Schema::table('categories', function (Blueprint $table) {
            if (!Schema::hasColumn('categories', 'slug')) {
                $table->string('slug')->nullable();
            }
            if (!Schema::hasColumn('categories', 'description')) {
                $table->text('description')->nullable();
            }
            if (!Schema::hasColumn('categories', 'image')) {
                $table->string('image', 500)->nullable();
            }
        });

        Schema::table('brands', function (Blueprint $table) {
            if (!Schema::hasColumn('brands', 'slug')) {
                $table->string('slug')->nullable();
            }
            if (!Schema::hasColumn('brands', 'description')) {
                $table->text('description')->nullable();
            }
            if (!Schema::hasColumn('brands', 'image')) {
                $table->string('image', 500)->nullable();
            }
        });

        // 2. Bảng carts (Giỏ hàng)
        if (!Schema::hasTable('carts')) {
            Schema::create('carts', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->unique();
                $table->timestamps();

                $table->foreign('user_id')
                    ->references('id')
                    ->on('users')
                    ->onDelete('cascade');
            });
        }

        // 3. Bảng cart_items (Chi tiết giỏ hàng)
        if (!Schema::hasTable('cart_items')) {
            Schema::create('cart_items', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('cart_id');
                $table->unsignedBigInteger('product_id');
                $table->integer('quantity')->default(1);
                $table->decimal('price', 15, 2)->default(0.00);
                $table->timestamps();

                $table->unique(['cart_id', 'product_id'], 'cart_product_unique');
                $table->foreign('cart_id')
                    ->references('id')
                    ->on('carts')
                    ->onDelete('cascade');
                $table->foreign('product_id')
                    ->references('id')
                    ->on('products')
                    ->onDelete('cascade');
            });
        }

        // 4. Bảng orders (Đơn hàng)
        if (!Schema::hasTable('orders')) {
            Schema::create('orders', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->nullable();
                $table->string('order_code', 50)->unique();
                $table->string('customer_name', 255);
                $table->string('customer_email', 255)->nullable();
                $table->string('customer_phone', 20);
                $table->string('shipping_address', 500);
                $table->text('note')->nullable();
                $table->decimal('subtotal', 15, 2)->default(0.00);
                $table->decimal('shipping_fee', 15, 2)->default(0.00);
                $table->decimal('discount', 15, 2)->default(0.00);
                $table->decimal('total', 15, 2)->default(0.00);
                $table->string('payment_method', 50)->default('cod');
                $table->string('payment_status', 50)->default('pending');
                $table->string('status', 50)->default('pending');
                $table->timestamps();
                $table->softDeletes();

                $table->foreign('user_id')
                    ->references('id')
                    ->on('users')
                    ->onDelete('set null');
            });
        } else {
            Schema::table('orders', function (Blueprint $table) {
                if (!Schema::hasColumn('orders', 'deleted_at')) {
                    $table->softDeletes();
                }
            });
        }

        // 5. Bảng order_details (Chi tiết đơn hàng)
        if (!Schema::hasTable('order_details')) {
            Schema::create('order_details', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('order_id');
                $table->unsignedBigInteger('product_id')->nullable();
                $table->string('product_name', 255);
                $table->string('product_sku', 100)->nullable();
                $table->decimal('price', 15, 2)->default(0.00);
                $table->integer('quantity')->default(1);
                $table->decimal('subtotal', 15, 2)->default(0.00);
                $table->timestamps();

                $table->foreign('order_id')
                    ->references('id')
                    ->on('orders')
                    ->onDelete('cascade');
                $table->foreign('product_id')
                    ->references('id')
                    ->on('products')
                    ->onDelete('set null');
            });
        }

        // 6. Bảng order_items (đáp ứng tương thích nếu truy vấn qua order_items)
        if (!Schema::hasTable('order_items')) {
            Schema::create('order_items', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('order_id');
                $table->unsignedBigInteger('product_id')->nullable();
                $table->string('product_name', 255);
                $table->string('product_sku', 100)->nullable();
                $table->decimal('price', 15, 2)->default(0.00);
                $table->integer('quantity')->default(1);
                $table->decimal('subtotal', 15, 2)->default(0.00);
                $table->timestamps();

                $table->foreign('order_id')
                    ->references('id')
                    ->on('orders')
                    ->onDelete('cascade');
                $table->foreign('product_id')
                    ->references('id')
                    ->on('products')
                    ->onDelete('set null');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('order_details');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('cart_items');
        Schema::dropIfExists('carts');

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
            if (Schema::hasColumn('users', 'avatar')) {
                $table->dropColumn('avatar');
            }
        });
    }
};
