<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

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
        'quantity',
        'view_count',
        'is_featured',
    ];

    protected $casts = [
        'category_id' => 'integer',
        'brand_id' => 'integer',
        'price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'stock' => 'integer',
        'views' => 'integer',
        'quantity' => 'integer',
        'view_count' => 'integer',
        'status' => 'integer',
        'featured' => 'boolean',
        'is_featured' => 'boolean',
    ];

    // Product thuộc về một Category
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // Product thuộc về một Brand
    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    // Product có thể xuất hiện trong nhiều CartItem
    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }

    // Đánh giá sản phẩm từ người dùng
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    // Lịch sử biến động kho hàng (Nhập / Xuất)
    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }

    // Chi tiết đơn hàng chứa sản phẩm này
    public function orderDetails()
    {
        return $this->hasMany(OrderDetail::class);
    }
}