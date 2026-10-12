<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Brand extends Model
{
    use HasFactory, SoftDeletes;

    // Tắt tự động chèn created_at và updated_at
    public $timestamps = false;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'image',
        'logo',
        'status',
    ];

    protected $casts = [
        'status' => 'integer',
    ];

    // Một thương hiệu có nhiều sản phẩm
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    // Chỉ lấy những thương hiệu đang hoạt động
    public function scopeActive(Builder $query): void
    {
        $query->where('status', 1);
    }
}