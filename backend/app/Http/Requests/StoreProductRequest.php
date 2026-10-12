<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class StoreProductRequest extends AdminRequest
{
    public function rules(): array
    {
        $id = $this->route('id');

        return [
            'name'         => ['required', 'string', 'max:255',
                               Rule::unique('products', 'name')->ignore($id)->whereNull('deleted_at')],
            'slug'         => ['nullable', 'string', 'max:255'],
            // SKU có UNIQUE trong DB (kể cả sản phẩm trong thùng rác) nên không lọc deleted_at
            'sku'          => ['nullable', 'string', 'max:100', Rule::unique('products', 'sku')->ignore($id)],
            'description'  => ['nullable', 'string'],

            // Tiền Việt Nam: số nguyên dương (VND không có phần lẻ)
            'price'        => ['required', 'integer', 'min:0', 'max:100000000000'],
            'sale_price'   => ['nullable', 'integer', 'min:0', 'lt:price'],

            'category_id'  => ['required', 'integer', Rule::exists('categories', 'id')->whereNull('deleted_at')],
            'brand_id'     => ['required', 'integer', Rule::exists('brands', 'id')->whereNull('deleted_at')],
            'stock'        => ['nullable', 'integer', 'min:0'],
            'status'       => ['nullable', 'in:0,1'],
            'featured'     => ['nullable', 'in:0,1'],

            'image'        => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:2048'],
            'remove_image' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'        => 'Tên sản phẩm là bắt buộc.',
            'name.unique'          => 'Tên sản phẩm đã tồn tại.',
            'sku.unique'           => 'Mã SKU đã tồn tại.',
            'price.required'       => 'Giá sản phẩm là bắt buộc.',
            'price.integer'        => 'Giá sản phẩm phải là số nguyên (VNĐ), không dùng số thập phân.',
            'price.min'            => 'Giá sản phẩm không được âm.',
            'price.max'            => 'Giá sản phẩm quá lớn.',
            'sale_price.integer'   => 'Giá khuyến mãi phải là số nguyên (VNĐ).',
            'sale_price.min'       => 'Giá khuyến mãi không được âm.',
            'sale_price.lt'        => 'Giá khuyến mãi phải nhỏ hơn giá bán.',
            'category_id.required' => 'Vui lòng chọn danh mục.',
            'category_id.exists'   => 'Danh mục không tồn tại.',
            'brand_id.required'    => 'Vui lòng chọn thương hiệu.',
            'brand_id.exists'      => 'Thương hiệu không tồn tại.',
            'stock.integer'        => 'Số lượng tồn kho phải là số nguyên.',
            'image.image'          => 'File tải lên phải là hình ảnh.',
            'image.mimes'          => 'Ảnh chỉ nhận định dạng jpg, jpeg, png, webp, gif.',
            'image.max'            => 'Ảnh không được vượt quá 2MB.',
        ];
    }
}
