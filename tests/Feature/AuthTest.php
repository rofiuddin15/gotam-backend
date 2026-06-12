<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
    }

    public function test_user_can_login_with_email()
    {
        $user = User::factory()->create([
            'email' => 'partner@gotam.com',
            'phone' => '081234567890',
            'role' => 'partner',
            'password' => bcrypt('password123'),
        ]);
        $user->assignRole('partner');

        $response = $this->postJson('/api/login', [
            'email' => 'partner@gotam.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['access_token', 'user'])
            ->assertJsonPath('user.email', 'partner@gotam.com');
    }

    public function test_user_can_login_with_phone()
    {
        $user = User::factory()->create([
            'email' => 'partner@gotam.com',
            'phone' => '081234567890',
            'role' => 'partner',
            'password' => bcrypt('password123'),
        ]);
        $user->assignRole('partner');

        $response = $this->postJson('/api/login', [
            'email' => '081234567890',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['access_token', 'user'])
            ->assertJsonPath('user.phone', '081234567890');
    }

    public function test_user_can_logout()
    {
        $user = User::factory()->create([
            'role' => 'partner',
        ]);
        $user->assignRole('partner');

        $response = $this->actingAs($user)
            ->postJson('/api/logout');

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Berhasil keluar dari sistem.');
    }

    public function test_partner_can_update_profile()
    {
        $user = User::factory()->create([
            'name' => 'Bengkel Lama',
            'email' => 'old@gotam.com',
            'phone' => '081111111111',
            'role' => 'partner',
        ]);
        $user->assignRole('partner');

        $response = $this->actingAs($user)
            ->putJson('/api/me', [
                'name' => 'Bengkel Baru',
                'email' => 'new@gotam.com',
                'phone' => '082222222222',
                'vehicle_type_capability' => 'Motor',
                'is_mobile' => true,
                'password' => 'newpassword123',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('user.name', 'Bengkel Baru')
            ->assertJsonPath('user.email', 'new@gotam.com')
            ->assertJsonPath('user.phone', '082222222222')
            ->assertJsonPath('user.mitra_profile.vehicle_type_capability', 'Motor')
            ->assertJsonPath('user.mitra_profile.is_mobile', true);
    }
}
