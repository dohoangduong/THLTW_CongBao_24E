<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Cho phép thực thi request cập nhật
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255', // Bắt buộc có tên sản phẩm
            'price' => 'required|numeric',       // Bắt buộc có giá và là số
            'category_id' => 'nullable|exists:categories,id', // Kiểm tra danh mục tồn tại
            'brand_id' => 'nullable|exists:brands,id',       // Kiểm tra thương hiệu tồn tại
        ];
    }
}