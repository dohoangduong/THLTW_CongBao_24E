<?php

namespace App\Http\Requests;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Lớp cha cho các request của khu vực Admin: chỉ cho phép user có role = admin.
 */
abstract class AdminRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user('sanctum');

        return $user && $user->role === 'admin';
    }

    protected function failedAuthorization()
    {
        throw new AuthorizationException('Lỗi: Chỉ có Admin mới được phép thực hiện hành động này!');
    }
}
