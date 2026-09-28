<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => 'required|integer|exists:categories,id', // Phải có mã danh mục và tồn tại trong bảng categories
            'brand_id'    => 'required|integer|exists:brands,id',
            'name'        => 'required|string|max:255',
            'price'       => 'required|numeric|min:0', // Giá phải là số và lớn hơn hoặc bằng 0
            'sale_price'  => 'nullable|numeric|min:0',
            'quantity'    => 'required|integer|min:0',
            'is_featured' => 'nullable|boolean',
            'status'      => 'nullable|integer|in:0,1',
        ];
    }
}