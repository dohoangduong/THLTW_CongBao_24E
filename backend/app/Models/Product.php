<?php

namespace App\Models;

use App\Models\Concerns\HasImageUrl;
use App\Models\Concerns\HasSlug;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes, HasSlug, HasImageUrl;

    protected $fillable = [
        'category_id',
        'brand_id',
        'name',
        'slug',
        'sku',
        'description',
        'image',
        'price',
        'sale_price',
        'stock',
        'views',
        'status',
        'featured',
    ];

    protected $casts = [
        'category_id' => 'integer',
        'brand_id'    => 'integer',
        // Tiền VND không có phần thập phân -> dùng số nguyên (không dùng decimal:2 nữa)
        'price'       => 'integer',
        'sale_price'  => 'integer',
        'stock'       => 'integer',
        'views'       => 'integer',
        'status'      => 'integer',
        'featured'    => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }

    /** Chỉ lấy sản phẩm đang hiển thị */
    public function scopeActive($query)
    {
        return $query->where('status', 1);
    }
}
