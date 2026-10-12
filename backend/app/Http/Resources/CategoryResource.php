<?php

namespace App\Http\Resources;

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
            'parent_id'      => $this->parent_id,
            'parent'         => $this->parent ? [
                'id'   => $this->parent->id,
                'name' => $this->parent->name,
            ] : null,
            'image'          => $this->image,
            'status'         => $this->status ?? 1,
            'products_count' => $this->products()->count(),
            'created_at'     => $this->created_at,
            'updated_at'     => $this->updated_at,
            'deleted_at'     => $this->deleted_at,
        ];
    }
}