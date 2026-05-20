<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create roles
        Role::create(['name' => 'admin']);
        Role::create(['name' => 'customer']);
        Role::create(['name' => 'partner']);

        // Define permissions (can be expanded later)
        Permission::create(['name' => 'manage users']);
        Permission::create(['name' => 'manage bookings']);
        Permission::create(['name' => 'provide service']);

        // Assign permissions to roles
        $admin = Role::findByName('admin');
        $admin->givePermissionTo(Permission::all());

        $partner = Role::findByName('partner');
        $partner->givePermissionTo('provide service');
    }
}
