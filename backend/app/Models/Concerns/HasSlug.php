<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * Tự động tạo slug (đường dẫn thân thiện) từ cột `name`.
 *
 *  - Tạo mới mà không nhập slug      -> sinh từ name   ("Điện thoại" -> "dien-thoai")
 *  - Nhập slug thủ công              -> chuẩn hóa lại  ("Iphone 15!!" -> "iphone-15")
 *  - Slug bị trùng                   -> thêm hậu tố   ("dien-thoai-2", "dien-thoai-3", ...)
 *  - Sửa tên nhưng không đụng slug   -> giữ nguyên slug (tốt cho SEO)
 */
trait HasSlug
{
    protected static function bootHasSlug(): void
    {
        static::saving(function (Model $model) {
            if (blank($model->slug)) {
                $model->slug = static::makeUniqueSlug((string) $model->name, $model->getKey());
            } elseif ($model->isDirty('slug')) {
                $model->slug = static::makeUniqueSlug((string) $model->slug, $model->getKey());
            }
        });
    }

    public static function makeUniqueSlug(string $text, $ignoreId = null): string
    {
        $base = Str::slug($text) ?: 'muc';
        $slug = $base;
        $i = 2;

        // withTrashed(): cột slug có UNIQUE nên phải tính cả bản ghi đang nằm trong thùng rác
        while (
            static::withTrashed()
                ->where('slug', $slug)
                ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = $base . '-' . $i++;
        }

        return $slug;
    }
}
