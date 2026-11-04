<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    /**
     * API Upload ảnh trực tiếp từ máy tính (PNG, JPG/JPEG, tối đa 10MB)
     * POST /api/upload-image
     */
    public function uploadImage(Request $request): JsonResponse
    {
        // Xác định trường file gửi lên (chấp nhận cả 'image' và 'file')
        $fieldName = $request->hasFile('image') ? 'image' : ($request->hasFile('file') ? 'file' : 'image');

        // Validation nghiêm ngặt theo yêu cầu
        $validator = Validator::make($request->all(), [
            $fieldName => [
                'required',
                'file',
                'mimes:png,jpg,jpeg',
                'max:10240', // 10MB = 10240 KB
            ],
        ], [
            "{$fieldName}.required" => 'Vui lòng chọn file ảnh để tải lên!',
            "{$fieldName}.file"     => 'Dữ liệu tải lên phải là một tập tin!',
            "{$fieldName}.mimes"    => 'Chỉ chấp nhận file ảnh định dạng PNG hoặc JPG/JPEG!',
            "{$fieldName}.max"      => 'Dung lượng ảnh vượt quá giới hạn cho phép (Tối đa 10MB)!',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors'  => $validator->errors(),
            ], 422);
        }

        $file = $request->file($fieldName);

        // Chuẩn hóa tên file duy nhất: time() . '_' . Str::slug(...) . '.' . $ext
        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $extension = strtolower($file->getClientOriginalExtension());
        $slugName = Str::slug($originalName);
        if (empty($slugName)) {
            $slugName = 'image';
        }
        $fileName = time() . '_' . $slugName . '.' . $extension;

        // Thư mục lưu trữ: backend/public/uploads/images/
        $destinationPath = public_path('uploads/images');
        if (!file_exists($destinationPath)) {
            mkdir($destinationPath, 0755, true);
        }

        // Di chuyển file vào thư mục đích
        $file->move($destinationPath, $fileName);

        // Sinh URL tuyệt đối trả về
        $url = asset('uploads/images/' . $fileName);

        return response()->json([
            'success'   => true,
            'message'   => 'Tải ảnh lên máy chủ thành công!',
            'url'       => $url,
            'file_name' => $fileName,
            'size'      => file_exists($destinationPath . '/' . $fileName) ? filesize($destinationPath . '/' . $fileName) : null,
            'mime_type' => 'image/' . ($extension === 'jpg' ? 'jpeg' : $extension),
        ], 200);
    }
}

