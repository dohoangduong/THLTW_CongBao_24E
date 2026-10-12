<?php

namespace App\Http\Resources;

use App\Support\Media;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BrandResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'slug'           => $this->slug,
            'description'    => $this->description,
            'image'          => Media::url($this->image),
            'image_path'     => $this->image,
            'status'         => (int) $this->status,
            'products_count' => $this->whenCounted('products'),
            'deleted_at'     => $this->deleted_at,
            'created_at'     => $this->created_at,
        ];
    }
}
