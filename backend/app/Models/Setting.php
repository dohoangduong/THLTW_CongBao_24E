<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'site_name',
        'logo',
        'favicon',
        'hotline',
        'email',
        'address',
        'working_hours',
        'facebook_url',
        'youtube_url',
        'zalo_url',
        'tiktok_url',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'copyright_text',
    ];
}

