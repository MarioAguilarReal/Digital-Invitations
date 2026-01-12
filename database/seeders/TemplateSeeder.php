<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Template;

class TemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void{

        Template::updateOrCreate(
            [
                'key' => 'grad_modern_01'
            ],
            [
                'name' => 'Graduacion - Modern Glass',
                'description' => 'Glassmorphism + Layout Moderno',
                'preview_image_url' => '/images/templates/gran_modern_01.png',
                'is_active' => true
            ]
        );
        Template::updateOrCreate(
            [
                'key' => 'grad_minimal_02'
            ],
            [
                'name' => 'Graduación – Minimal Clean',
                'description' => 'Minimalista, tipografía elegante.',
                'preview_image_url' => '/images/templates/grad_minimal_02.png',
                'is_active' => true
            ]
        );
    }
}
