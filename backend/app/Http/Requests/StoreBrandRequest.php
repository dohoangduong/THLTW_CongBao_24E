<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class StoreBrandRequest extends AdminRequest
{
    public function rules(): array
    {
        $id = $this->route('id');

        return [
            'name'         => ['required', 'string', 'max:255',
                               Rule::unique('brands', 'name')->ignore($id)->whereNull('deleted_at')],
            'slug'         => ['nullable', 'string', 'max:255'],
            'description'  => ['nullable', 'string'],
            'status'       => ['nullable', 'in:0,1'],
            'image'        => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:2048'],
            'remove_image' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Tên thương hiệu là bắt buộc.',
            'name.unique'   => 'Tên thương hiệu đã tồn tại.',
            'image.image'   => 'File tải lên phải là hình ảnh.',
            'image.mimes'   => 'Ảnh chỉ nhận định dạng jpg, jpeg, png, webp, gif.',
            'image.max'     => 'Ảnh không được vượt quá 2MB.',
        ];
    }
}
