<?php

namespace Database\Seeders;

use App\Models\ServiceCategory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ServiceCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            // Mobil
            ['vehicle_type' => 'Mobil', 'tire_type' => 'Tubeless', 'base_price' => 25000],
            ['vehicle_type' => 'Mobil', 'tire_type' => 'Ban Dalam', 'base_price' => 35000],
            
            // Motor
            ['vehicle_type' => 'Motor', 'tire_type' => 'Tubeless', 'base_price' => 15000],
            ['vehicle_type' => 'Motor', 'tire_type' => 'Ban Dalam', 'base_price' => 20000],
            
            // Truk
            ['vehicle_type' => 'Truk', 'tire_type' => 'Ban Dalam', 'base_price' => 75000],
        ];

        foreach ($categories as $category) {
            ServiceCategory::create($category);
        }
    }
}
