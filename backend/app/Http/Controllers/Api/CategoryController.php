<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Http\Resources\CategoryResource; // Dùng nếu đã có Resource
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    // GET /api/categories
    public function index()
    {
        $categories = Category::active()
            ->whereNull('parent_id')
            ->with(['children' => fn ($q) => $q->active()])
            ->orderBy('sort_order')
            ->get();


return CategoryResource::collection($categories);    }
}