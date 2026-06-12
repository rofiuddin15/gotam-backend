<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PartnerStatusTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
    }

    public function test_partner_can_toggle_online_status()
    {
        $user = User::factory()->create(['role' => 'partner']);
        $user->assignRole('partner');

        $this->assertFalse($user->mitraProfile->is_online);

        // Turn online
        $response = $this->actingAs($user)
            ->postJson('/api/partner/status', [
                'is_online' => true
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('is_online', true);

        $user->mitraProfile->refresh();
        $this->assertTrue($user->mitraProfile->is_online);

        // Turn offline
        $response = $this->actingAs($user)
            ->postJson('/api/partner/status', [
                'is_online' => false
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('is_online', false);

        $user->mitraProfile->refresh();
        $this->assertFalse($user->mitraProfile->is_online);
    }

    public function test_admin_dashboard_stats_shows_online_and_offline_partners()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $admin->assignRole('admin');

        // Create partner 1 (online)
        $partner1 = User::factory()->create(['role' => 'partner']);
        $partner1->assignRole('partner');
        $partner1->mitraProfile->update(['is_online' => true]);

        // Create partner 2 (offline)
        $partner2 = User::factory()->create(['role' => 'partner']);
        $partner2->assignRole('partner');
        $partner2->mitraProfile->update(['is_online' => false]);

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/stats');

        $response->assertStatus(200)
            ->assertJsonPath('stats.partners_online', 1)
            ->assertJsonPath('stats.partners_offline', 1);
    }
}
