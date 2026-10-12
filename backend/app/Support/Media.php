<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Media
{
    /**
     * Chuyển đường dẫn lưu trong DB thành URL đầy đủ để frontend hiển thị.
     * - Link http(s) giữ nguyên.
     * - File trong storage/public -> http://localhost:8000/storage/...
     * - File không tồn tại (dữ liệu mẫu cũ như "iphone-15.jpg") -> null để frontend hiện ảnh trống.
     */
    public static function url(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if (Str::startsWith($path, ['http://', 'https://'])) {
            return $path;
        }

        return Storage::disk('public')->exists($path)
            ? asset('storage/' . $path)
            : null;
    }
}
