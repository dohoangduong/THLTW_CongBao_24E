<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class StoreCategoryRequest extends AdminRequest
{
    public function rules(): array
    {
        // Khi THÊM MỚI: $id = null. Khi SỬA (UpdateCategoryRequest kế thừa class này): $id = id đang sửa.
        // Tham số route trong routes/api.php tên là {id} nên phải dùng route('id').
        $id = $this->route('id');

        return [
            'name'         => ['required', 'string', 'max:255',
                               Rule::unique('categories', 'name')->ignore($id)->whereNull('deleted_at')],
            'slug'         => ['nullable', 'string', 'max:255'],
            'description'  => ['nullable', 'string'],
            'parent_id'    => array_filter([
                'nullable', 'integer',
                Rule::exists('categories', 'id')->whereNull('deleted_at'),
                $id ? Rule::notIn([(int) $id]) : null,   // không cho tự làm cha của chính nó
            ]),
            'sort_order'   => ['nullable', 'integer'],
            'status'       => ['nullable', 'in:0,1'],
            'image'        => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:2048'],
            'remove_image' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'    => 'Tên danh mục là bắt buộc.',
            'name.unique'      => 'Tên danh mục đã tồn tại.',
            'parent_id.exists' => 'Danh mục cha không tồn tại.',
            'parent_id.not_in' => 'Danh mục không thể là cha của chính nó.',
            'image.image'      => 'File tải lên phải là hình ảnh.',
            'image.mimes'      => 'Ảnh chỉ nhận định dạng jpg, jpeg, png, webp, gif.',
            'image.max'        => 'Ảnh không được vượt quá 2MB.',
        ];
    }
}
