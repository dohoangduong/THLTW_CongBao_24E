<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * Chuẩn hóa cấu trúc 3 bảng categories / brands / products cho trang Admin:
 *   1. Thêm cột slug (+ tự điền slug cho dữ liệu cũ) và UNIQUE
 *   2. Thêm cột image (ảnh) cho danh mục / thương hiệu / sản phẩm
 *   3. Thêm deleted_at (xóa mềm -> thùng rác -> xóa vĩnh viễn)
 *   4. Đổi giá tiền từ DECIMAL(x,2) sang DECIMAL(15,0): tiền VNĐ không có phần thập phân
 *
 * Migration này KIỂM TRA cột đã tồn tại chưa (hasColumn) nên chạy an toàn dù database của bạn
 * được tạo bằng "php artisan migrate" hay import file docs/bao_cong.sql.
 */
return new class extends Migration
{
    public function up(): void
    {
        // ---------- CATEGORIES ----------
        Schema::table('categories', function (Blueprint $table) {
            if (! Schema::hasColumn('categories', 'slug'))        $table->string('slug')->nullable();
            if (! Schema::hasColumn('categories', 'description')) $table->text('description')->nullable();
            if (! Schema::hasColumn('categories', 'image'))       $table->string('image', 500)->nullable();
            if (! Schema::hasColumn('categories', 'parent_id'))   $table->unsignedBigInteger('parent_id')->nullable();
            if (! Schema::hasColumn('categories', 'sort_order'))  $table->integer('sort_order')->default(0);
            if (! Schema::hasColumn('categories', 'deleted_at'))  $table->softDeletes();
        });

        // ---------- BRANDS ----------
        Schema::table('brands', function (Blueprint $table) {
            if (! Schema::hasColumn('brands', 'slug'))        $table->string('slug')->nullable();
            if (! Schema::hasColumn('brands', 'description')) $table->text('description')->nullable();
            if (! Schema::hasColumn('brands', 'image'))       $table->string('image', 500)->nullable();
            if (! Schema::hasColumn('brands', 'deleted_at'))  $table->softDeletes();
        });

        // ---------- PRODUCTS ----------
        Schema::table('products', function (Blueprint $table) {
            if (! Schema::hasColumn('products', 'slug'))        $table->string('slug')->nullable();
            if (! Schema::hasColumn('products', 'sku'))         $table->string('sku', 100)->nullable()->unique();
            if (! Schema::hasColumn('products', 'image'))       $table->string('image', 500)->nullable();
            if (! Schema::hasColumn('products', 'views'))       $table->unsignedBigInteger('views')->default(0);
            if (! Schema::hasColumn('products', 'featured'))    $table->boolean('featured')->default(0);
            if (! Schema::hasColumn('products', 'deleted_at'))  $table->softDeletes();
        });

        // ---------- Tự điền slug cho các dòng đang thiếu ----------
        foreach (['categories', 'brands', 'products'] as $tableName) {
            $this->fillMissingSlugs($tableName);
        }

        // ---------- Thêm UNIQUE cho slug (nếu chưa có) ----------
        foreach (['categories', 'brands', 'products'] as $tableName) {
            $indexName = "{$tableName}_slug_unique";
            $hasIndex = collect(Schema::getIndexes($tableName))->contains(fn ($i) => $i['name'] === $indexName);

            if (! $hasIndex) {
                Schema::table($tableName, fn (Blueprint $table) => $table->unique('slug', $indexName));
            }
        }

        // ---------- Giá tiền VNĐ: bỏ phần thập phân ----------
        DB::table('products')->update([
            'price'      => DB::raw('ROUND(price)'),
            'sale_price' => DB::raw('ROUND(sale_price)'),
        ]);

        Schema::table('products', function (Blueprint $table) {
            $table->decimal('price', 15, 0)->default(0)->change();
            $table->decimal('sale_price', 15, 0)->nullable()->change();
        });
    }

    public function down(): void
    {
        // Không hoàn tác để tránh làm mất dữ liệu (slug, ảnh, thùng rác).
        // Nếu cần quay lại, hãy dùng "php artisan migrate:fresh" hoặc import lại file SQL.
    }

    /** Sinh slug từ name cho các dòng chưa có slug, đảm bảo không trùng. */
    private function fillMissingSlugs(string $tableName): void
    {
        $used = DB::table($tableName)->whereNotNull('slug')->where('slug', '!=', '')->pluck('slug')->all();
        $used = array_flip($used);

        $rows = DB::table($tableName)->where(fn ($q) => $q->whereNull('slug')->orWhere('slug', ''))->get(['id', 'name']);

        foreach ($rows as $row) {
            $base = Str::slug($row->name) ?: 'muc';
            $slug = $base;
            $i = 2;

            while (isset($used[$slug])) {
                $slug = $base . '-' . $i++;
            }

            $used[$slug] = true;
            DB::table($tableName)->where('id', $row->id)->update(['slug' => $slug]);
        }
    }
};
