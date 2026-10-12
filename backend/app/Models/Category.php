<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Category extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'categories';

    protected $primaryKey = 'id';

    protected $fillable = [
        'name',
        'slug',
        'parent_id',
        'sort_order',
        'description',
        'status',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'status' => 'integer',
        'sort_order' => 'integer',
    ];
public function parent()
{
    return $this->belongsTo(Category::class, 'parent_id');
}

// Lấy danh sách danh mục con
public function children()
{
    return $this->hasMany(Category::class, 'parent_id');
}
// Lấy danh sách sản phẩm thuộc danh mục
public function products()
{
    return $this->hasMany(Product::class);
}

public function scopeActive($query)
{
    return $query->where('status', 1);
}
}