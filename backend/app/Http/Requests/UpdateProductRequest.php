<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => 'sometimes|required|integer|exists:categories,id',
            'brand_id'    => 'sometimes|required|integer|exists:brands,id',
            'name'        => 'sometimes|required|string|max:255',
            'price'       => 'sometimes|required|numeric|min:0',
            'sale_price'  => 'nullable|numeric|min:0',
            'quantity'    => 'sometimes|required|integer|min:0',
            'is_featured' => 'nullable|boolean',
            'status'      => 'nullable|integer|in:0,1',
        ];
    }
}