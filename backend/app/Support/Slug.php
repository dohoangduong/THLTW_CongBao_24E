<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class Slug
{
    /**
     * Tạo slug không trùng trong bảng. "Điện thoại" -> "dien-thoai", trùng thì thêm -2, -3...
     */
    public static function unique(string $table, string $source, ?int $ignoreId = null): string
    {
        $base = Str::slug($source) ?: 'muc';
        $slug = $base;
        $i = 2;

        while (
            DB::table($table)
                ->where('slug', $slug)
                ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = $base . '-' . $i++;
        }

        return $slug;
    }
}
