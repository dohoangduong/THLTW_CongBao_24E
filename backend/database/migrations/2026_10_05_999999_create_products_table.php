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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            
            // Các cột được bổ sung:
            $table->string('name'); // Tên sản phẩm
            $table->string('slug')->unique()->nullable(); // Đường dẫn thân thiện
            $table->decimal('price', 10, 2); // Giá bán
            $table->decimal('sale_price', 10, 2)->nullable(); // Giá khuyến mãi
            $table->text('description')->nullable(); // Mô tả sản phẩm
            $table->string('image')->nullable(); // Ảnh đại diện
            
            // Khóa ngoại liên kết với bảng Danh mục
            $table->unsignedBigInteger('category_id')->nullable(); 
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('set null');

            // Khóa ngoại liên kết với bảng Thương hiệu
            $table->unsignedBigInteger('brand_id')->nullable();
            $table->foreign('brand_id')->references('id')->on('brands')->onDelete('set null');

            $table->integer('stock')->default(0); // Số lượng tồn kho
            $table->tinyInteger('status')->default(1); // Trạng thái (1: Hiển thị, 0: Ẩn)
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};