<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBrandRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Tạm thời return true để cho phép test API mà không bị chặn quyền (403 Forbidden)
        return true; 
    }

    public function rules(): array
    {
        return [
            'name'   => 'required|string|max:255',
            'status' => 'nullable|integer|in:0,1',
        ];
    }
}