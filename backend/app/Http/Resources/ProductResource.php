<?php

namespace App\Http\Resources;

use App\Support\Media;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'slug'        => $this->slug,
            'sku'         => $this->sku,
            'description' => $this->description,
            'image'       => Media::url($this->image),
            'image_path'  => $this->image,

            // Giá luôn là số nguyên VNĐ (21990000), frontend tự định dạng thành "21.990.000 ₫"
            'price'       => (int) $this->price,
            'sale_price'  => $this->sale_price !== null ? (int) $this->sale_price : null,

            'stock'       => (int) $this->stock,
            'views'       => (int) $this->views,
            'status'      => (int) $this->status,
            'featured'    => (bool) $this->featured,

            'category_id' => $this->category_id,
            'brand_id'    => $this->brand_id,
            'category'    => $this->whenLoaded('category', fn () => $this->category ? [
                'id' => $this->category->id, 'name' => $this->category->name, 'slug' => $this->category->slug,
            ] : null),
            'brand'       => $this->whenLoaded('brand', fn () => $this->brand ? [
                'id' => $this->brand->id, 'name' => $this->brand->name, 'slug' => $this->brand->slug,
            ] : null),

            'deleted_at'  => $this->deleted_at,
            'created_at'  => $this->created_at,
        ];
    }
}
