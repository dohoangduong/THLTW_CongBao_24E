<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
// Nếu Công đã tạo CategoryResource, bạn có thể use nó vào đây

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'price'       => $this->price,
            'image'       => $this->image,
            
            // Chỉ hiển thị thông tin Brand/Category nếu Controller có gọi hàm with()
            'brand'       => new BrandResource($this->whenLoaded('brand')),
            // 'category' => new CategoryResource($this->whenLoaded('category')),
        ];
    }
}