<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Brand extends Model
{
    // Mối quan hệ: Một thương hiệu có nhiều sản phẩm
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    // Tương tự scopeActive của Category trong tệp image_5289e0.jpg
    public function scopeActive(Builder $query): void
    {
        $query->where('status', 1);
    }
}