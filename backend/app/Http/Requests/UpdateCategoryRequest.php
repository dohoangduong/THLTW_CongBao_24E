<?php

namespace App\Http\Requests;

/** Quy tắc khi sửa giống khi thêm (khác biệt nằm ở $this->route('id') bên trong rules()). */
class UpdateCategoryRequest extends StoreCategoryRequest
{
}
