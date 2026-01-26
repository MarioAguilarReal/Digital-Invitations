<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'image' => ['required', 'image', 'max:5120'],
            'slug' => ['nullable', 'string', 'max:120'],
            'category' => ['nullable', 'string', 'max:40'],
        ]);

        $slug = isset($data['slug']) ? Str::slug($data['slug']) : 'draft';
        $category = isset($data['category']) ? Str::slug($data['category']) : 'misc';
        $directory = "invitations/{$slug}/{$category}";

        $original = $data['image']->getClientOriginalName();
        $ext = pathinfo($original, PATHINFO_EXTENSION);
        $base = pathinfo($original, PATHINFO_FILENAME);
        $safeBase = Str::slug($base);
        $filename = $safeBase ? "{$safeBase}.{$ext}" : Str::random(12).".{$ext}";

        $disk = Storage::disk('public');
        $counter = 1;
        while ($disk->exists("{$directory}/{$filename}")) {
            $filename = ($safeBase ? "{$safeBase}-{$counter}" : Str::random(12)).".{$ext}";
            $counter++;
        }

        $path = $data['image']->storePubliclyAs($directory, $filename, 'public');

        return back()->with('upload', [
            'url' => asset('storage/'.$path),
            'path' => $path,
            'category' => $category,
            'slug' => $slug,
        ]);
    }
}
