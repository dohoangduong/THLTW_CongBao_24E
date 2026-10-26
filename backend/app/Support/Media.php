<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Media
{
    /**
     * Chuyển đường dẫn lưu trong DB thành URL đầy đủ để frontend hiển thị.
     * - Link http(s) giữ nguyên.
     * - File upload (storage/app/public/...)  -> {APP_URL}/storage/...
     * - File cũ nằm trong public/uploads/...  -> {APP_URL}/uploads/...
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

        if (Storage::disk('public')->exists($path)) {
            return asset('storage/' . $path);
        }

        // Tương thích ngược: ảnh đã upload bằng bản code cũ (lưu thẳng vào public/uploads)
        if (file_exists(public_path($path))) {
            return asset($path);
        }

        return null;
    }
}
