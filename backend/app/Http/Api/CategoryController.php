<?php

namespace App\Http\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Http\Resources\CategoryResource;

class CategoryController extends Controller
{
    
    public function index()
    {
        $categories = Category::with('children')->get();
        return CategoryResource::collection($categories);
    }
}