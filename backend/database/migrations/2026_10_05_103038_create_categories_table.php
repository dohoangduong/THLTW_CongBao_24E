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
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            
            // Các cột được bổ sung:
            $table->string('name'); // Tên danh mục
            $table->unsignedBigInteger('parent_id')->nullable(); // Danh mục cha (có thể null nếu là danh mục gốc)
            $table->tinyInteger('status')->default(1); // Trạng thái (1: Hiển thị, 0: Ẩn)
            $table->integer('sort_order')->default(0); // Thứ tự sắp xếp
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};