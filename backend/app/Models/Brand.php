<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Brand extends Model
{
    // Tắt tính năng tự động chèn created_at và updated_at để tránh lỗi SQL
    public $timestamps = false;

    // Cấp quyền lưu dữ liệu hàng loạt để sửa lỗi 500 Mass Assignment
    protected $fillable = [
        'name',
        'logo',
        'status'
    ];

    // Mối quan hệ: Một thương hiệu có nhiều sản phẩm
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    // Tương tự scopeActive của Category
    public function scopeActive(Builder $query): void
    {
        $query->where('status', 1);
    }
}