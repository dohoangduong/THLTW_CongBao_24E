<?php

namespace App\Models\Concerns;

use App\Support\Media;

/**
 * Thêm thuộc tính `image_url` (URL đầy đủ của ảnh) vào mọi response JSON của model.
 * Cột `image` trong DB chỉ lưu đường dẫn tương đối (vd: "products/abc.jpg") hoặc link http(s).
 */
trait HasImageUrl
{
    public function initializeHasImageUrl(): void
    {
        $this->append('image_url');
    }

    public function getImageUrlAttribute(): ?string
    {
        return Media::url($this->image);
    }
}
