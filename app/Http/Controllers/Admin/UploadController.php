<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'image' => ['required', 'image', 'max:5120'],
        ]);

        $path = $data['image']->storePublicly('uploads', 'public');

        return response()->json([
            'url' => asset('storage/'.$path),
            'path' => $path,
        ]);
    }
}
