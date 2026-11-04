<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdminSettingController extends Controller
{
    /**
     * Lấy cấu hình website (dùng chung cho cả Public và Admin)
     * GET /api/settings hoặc GET /api/admin/settings
     */
    public function getSettings(): JsonResponse
    {
        $setting = Setting::first();
        if (!$setting) {
            $setting = Setting::create([
                'site_name'      => 'Bảo Công Studio',
                'logo'           => null,
                'favicon'        => null,
                'hotline'        => '1900 8888',
                'email'          => 'cskh@baocongstudio.vn',
                'address'        => '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
                'working_hours'  => '8h00 - 21h30 (Thứ 2 - Chủ Nhật)',
                'facebook_url'   => 'https://facebook.com/baocongstudio',
                'youtube_url'    => 'https://youtube.com/@baocongstudio',
                'zalo_url'       => 'https://zalo.me/19008888',
                'tiktok_url'     => 'https://tiktok.com/@baocongstudio',
                'meta_title'     => 'Bảo Công Studio - Hệ Thống Thiết Bị Di Động & Phụ Kiện Chính Hãng',
                'meta_description'=> 'Bảo Công Studio chuyên phân phối iPhone, Samsung, iPad, máy tính bảng và phụ kiện công nghệ chính hãng hàng đầu tại Việt Nam.',
                'meta_keywords'  => 'dien thoai, iphone, samsung, ipad, bao cong studio',
                'copyright_text' => '© 2026 Bảo Công Studio. All rights reserved.',
            ]);
        }

        return response()->json([
            'success' => true,
            'data'    => $setting,
        ]);
    }

    /**
     * Cập nhật cấu hình website (Admin/Staff)
     * PUT /api/admin/settings
     */
    public function updateSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'site_name'        => 'required|string|max:255',
            'logo'             => 'nullable|string|max:500',
            'favicon'          => 'nullable|string|max:500',
            'hotline'          => 'required|string|max:50',
            'email'            => 'required|email|max:100',
            'address'          => 'required|string|max:500',
            'working_hours'    => 'nullable|string|max:100',
            'facebook_url'     => 'nullable|url|max:500',
            'youtube_url'      => 'nullable|url|max:500',
            'zalo_url'         => 'nullable|string|max:500',
            'tiktok_url'       => 'nullable|url|max:500',
            'meta_title'       => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'meta_keywords'    => 'nullable|string|max:500',
            'copyright_text'   => 'nullable|string|max:255',
        ], [
            'site_name.required' => 'Vui lòng nhập tên website!',
            'hotline.required'   => 'Vui lòng nhập số Hotline!',
            'email.required'     => 'Vui lòng nhập email liên hệ!',
            'email.email'        => 'Địa chỉ email không đúng định dạng!',
            'address.required'   => 'Vui lòng nhập địa chỉ trụ sở / showroom!',
        ]);

        $setting = Setting::first();
        if (!$setting) {
            $setting = Setting::create($validated);
        } else {
            $setting->update($validated);
        }

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật cấu hình website thành công!',
            'data'    => $setting,
        ]);
    }
}

