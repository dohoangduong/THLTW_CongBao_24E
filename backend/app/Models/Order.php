<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'order_code', 'customer_name', 'customer_email', 'customer_phone',
        'shipping_address', 'note', 'subtotal', 'shipping_fee', 'discount', 'total',
        'payment_method', 'payment_status', 'status',
    ];

    protected $casts = [
        'subtotal'     => 'float',
        'shipping_fee' => 'float',
        'discount'     => 'float',
        'total'        => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function details()
    {
        return $this->hasMany(OrderDetail::class);
    }
}
