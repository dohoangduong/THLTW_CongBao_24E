<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
// use HasUniqueSlug; // (Nếu bạn có trait này)

class Product extends Model
{
    // Tắt tự động chèn created_at và updated_at để tránh lỗi SQL
    public $timestamps = false;

    // Cấp quyền nhận dữ liệu hàng loạt từ API cho các trường
    protected $fillable = [
        'category_id',
        'brand_id',
        'name',
        'slug',
        'price',
        'sale_price',
        'quantity',
        'view_count',
        'is_featured',
        'status',
        'image',
        'description'
    ];

    // Cấu hình ép kiểu dữ liệu
    protected function casts(): array
    {
        return [
            'category_id' => 'integer',
            'brand_id'    => 'integer',
            'price'       => 'decimal:2',
            'sale_price'  => 'decimal:2',
            'quantity'    => 'integer',
            'view_count'  => 'integer',
            'is_featured' => 'boolean',
            'status'      => 'integer',
        ];
    }

    // Các mối quan hệ (Relationships)
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }
}