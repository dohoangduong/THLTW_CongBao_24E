<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Post extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'category',
        'post_category_id',
        'summary',
        'content',
        'thumbnail',
        'author_name',
        'reading_time',
        'views',
        'is_featured',
        'is_visible',
        'allow_comments',
        'product_id',
    ];

    protected $casts = [
        'is_featured'      => 'boolean',
        'is_visible'       => 'boolean',
        'allow_comments'   => 'boolean',
        'views'            => 'integer',
        'product_id'       => 'integer',
        'post_category_id' => 'integer',
    ];

    public function postCategory()
    {
        return $this->belongsTo(PostCategory::class, 'post_category_id');
    }

    /**
     * Sản phẩm liên kết đính kèm trong bài viết.
     */
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    /**
     * Tất cả bình luận của bài viết.
     */
    public function comments()
    {
        return $this->hasMany(PostComment::class, 'post_id')->orderBy('created_at', 'desc');
    }

    /**
     * Bình luận hiển thị (được duyệt).
     */
    public function visibleComments()
    {
        return $this->hasMany(PostComment::class, 'post_id')
            ->where('is_visible', true)
            ->orderBy('created_at', 'desc');
    }

    /**
     * Scope bài viết hiển thị công khai.
     */
    public function scopeVisible($query)
    {
        return $query->where('is_visible', true);
    }

    /**
     * Scope bài viết ghim tâm điểm.
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }
}

