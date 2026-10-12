<?php

namespace App\Http\Controllers;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

abstract class Controller
{
    /** User đang đăng nhập (qua token Sanctum) có phải admin không? */
    protected function isAdmin(): bool
    {
        $user = auth('sanctum')->user();

        return $user && $user->role === 'admin';
    }

    /** Dừng request với lỗi 403 nếu không phải admin. */
    protected function requireAdmin(): void
    {
        if (! $this->isAdmin()) {
            abort(response()->json([
                'message' => 'Lỗi: Chỉ có Admin mới được phép thực hiện hành động này!',
            ], 403));
        }
    }

    /**
     * Lưu ảnh upload vào storage/app/public/{folder} và trả về đường dẫn tương đối
     * (VD: "categories/abc123.jpg"). Nếu có ảnh cũ thì xóa luôn file cũ.
     */
    protected function storeImage(UploadedFile $file, string $folder, ?string $oldPath = null): string
    {
        $this->deleteImage($oldPath);

        return $file->store($folder, 'public');
    }

    /** Xóa file ảnh trong storage (bỏ qua nếu là link http hoặc rỗng). */
    protected function deleteImage(?string $path): void
    {
        if ($path && ! str_starts_with($path, 'http')) {
            Storage::disk('public')->delete($path);
        }
    }
}
