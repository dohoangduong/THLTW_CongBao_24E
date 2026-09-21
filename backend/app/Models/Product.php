<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
// use HasUniqueSlug; // (Nếu bạn có trait này)

class Product extends Model
{
    // Cấu hình ép kiểu dữ liệu dựa theo tệp image_5289a3.jpg
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

    // Các mối quan hệ (Relationships) dựa theo tệp image_5289c0.jpg
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