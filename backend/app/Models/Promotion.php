<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'discount_type',
        'discount_value',
        'max_discount_amount',
        'min_order_value',
        'usage_limit',
        'used_count',
        'start_date',
        'end_date',
        'status',
    ];

    protected $casts = [
        'discount_value'      => 'float',
        'max_discount_amount' => 'float',
        'min_order_value'     => 'float',
        'usage_limit'         => 'integer',
        'used_count'          => 'integer',
        'status'              => 'integer',
        'start_date'          => 'datetime',
        'end_date'            => 'datetime',
    ];

    /**
     * Kiểm tra tính hợp lệ của mã khuyến mãi với giá trị đơn hàng
     */
    public function isValidForAmount(float $amount, ?string &$errorMessage = null): bool
    {
        if ($this->status !== 1) {
            $errorMessage = "Mã khuyến mãi «{$this->code}» hiện đang bị tạm khóa hoặc ngừng áp dụng!";
            return false;
        }

        $now = now();
        if ($this->start_date && $now->lt($this->start_date)) {
            $errorMessage = "Mã khuyến mãi «{$this->code}» chưa đến thời gian có hiệu lực (Bắt đầu từ: " . $this->start_date->format('d/m/Y H:i') . ")!";
            return false;
        }

        if ($this->end_date && $now->gt($this->end_date)) {
            $errorMessage = "Mã khuyến mãi «{$this->code}» đã hết hạn sử dụng (Hết hạn lúc: " . $this->end_date->format('d/m/Y H:i') . ")!";
            return false;
        }

        if ($this->usage_limit > 0 && $this->used_count >= $this->usage_limit) {
            $errorMessage = "Mã khuyến mãi «{$this->code}» đã hết lượt sử dụng trên hệ thống ({$this->used_count}/{$this->usage_limit} lượt)!";
            return false;
        }

        if ($amount < (float) $this->min_order_value) {
            $formattedMin = number_format($this->min_order_value, 0, ',', '.') . ' ₫';
            $errorMessage = "Đơn hàng chưa đạt giá trị tối thiểu {$formattedMin} để áp dụng mã «{$this->code}»!";
            return false;
        }

        return true;
    }

    /**
     * Tính toán số tiền được giảm
     */
    public function calculateDiscount(float $amount): float
    {
        if ($this->discount_type === 'percent') {
            $calculated = ($amount * (float) $this->discount_value) / 100;
            if ($this->max_discount_amount !== null && $this->max_discount_amount > 0) {
                $calculated = min($calculated, (float) $this->max_discount_amount);
            }
            return round($calculated, 2);
        }

        // Loại giảm tiền mặt cố định (fixed)
        return min((float) $this->discount_value, $amount);
    }
}

