<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            ServiceCategorySeeder::class,
            // \Laravolt\Indonesia\Seeds\DatabaseSeeder::class, // Call this separately if needed due to size
        ]);

        $admin = User::factory()->create([
            'name' => 'Admin GoTam',
            'email' => 'admin@gotam.id',
            'phone' => '081122334455',
            'role' => 'admin',
        ]);
        $admin->assignRole('admin');
    }
}
