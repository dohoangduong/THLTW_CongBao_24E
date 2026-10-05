<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

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
        'price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'stock' => 'integer',
        'views' => 'integer',
        'status' => 'boolean',
        'featured' => 'boolean',
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
}