<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    // Chỉ định đúng tên bảng trong database cong_bao
    protected $table = 'categories';

    // Khóa chính của bảng (mặc định là 'id')
    protected $primaryKey = 'id';

    // Các cột cho phép thêm/sửa dữ liệu hàng loạt (Mass Assignment)
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

    // Ép kiểu dữ liệu cho một số thuộc tính (nếu cần)
    protected $casts = [
        'status' => 'integer',
        'sort_order' => 'integer',
    ];
    // Lấy danh mục cha
public function parent()
{
    return $this->belongsTo(Category::class, 'parent_id');
}

// Lấy danh sách danh mục con
public function children()
{
    return $this->hasMany(Category::class, 'parent_id');
}
}