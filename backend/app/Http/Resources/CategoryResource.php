<?php

namespace App\Http\Resources;

use App\Support\Media;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'slug'           => $this->slug,
            'description'    => $this->description,
            'image'          => Media::url($this->image),   // URL đầy đủ để hiển thị
            'image_path'     => $this->image,               // đường dẫn lưu trong DB
            'parent_id'      => $this->parent_id,
            'parent_name'    => $this->whenLoaded('parent', fn () => $this->parent?->name),
            'sort_order'     => $this->sort_order,
            'status'         => (int) $this->status,
            'children'       => CategoryResource::collection($this->whenLoaded('children')),
            'products_count' => $this->whenCounted('products'),
            'deleted_at'     => $this->deleted_at,
            'created_at'     => $this->created_at,
        ];
    }
}
