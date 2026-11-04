<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'product_id',
        'type', // 'import' hoặc 'export'
        'quantity',
        'unit_cost',
        'stock_before',
        'stock_after',
        'supplier_or_reason',
        'note',
        'created_by',
    ];

    protected $casts = [
        'product_id'   => 'integer',
        'quantity'     => 'integer',
        'unit_cost'    => 'float',
        'stock_before' => 'integer',
        'stock_after'  => 'integer',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}

