<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Cho phép request này được thực thi
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:products,name',
            'slug' => 'nullable|string|max:255',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|lt:price|min:0',
            'description' => 'nullable|string',
            'image' => 'nullable',
            'category_id' => 'nullable|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'stock' => 'nullable|integer|min:0',
            'status' => 'nullable|in:0,1',
        ];
    }

    public function messages(): array
    {
        return [
            'sale_price.lt' => 'Giá khuyến mãi không được lớn hơn hoặc bằng giá gốc',
            'price.required' => 'Vui lòng nhập giá gốc sản phẩm',
            'price.numeric' => 'Giá gốc phải là số hợp lệ',
            'sale_price.numeric' => 'Giá khuyến mãi phải là số hợp lệ',
            'name.required' => 'Vui lòng nhập tên sản phẩm',
            'name.unique' => 'Tên sản phẩm này đã tồn tại trong hệ thống',
        ];
    }
}