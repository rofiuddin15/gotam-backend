<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\PartnerService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CatalogTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
    }

    public function test_partner_can_add_catalog_service_with_image()
    {
        Storage::fake('public');

        $user = User::factory()->create(['role' => 'partner']);
        $user->assignRole('partner');

        $file = UploadedFile::fake()->image('service.jpg');

        $response = $this->actingAs($user)
            ->postJson('/api/partner/catalog', [
                'name' => 'Tambal Ban Tubeless',
                'price' => 25000,
                'description' => 'Tambal ban tubeless cepat',
                'category' => 'service',
                'image' => $file,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('service.name', 'Tambal Ban Tubeless');

        $service = PartnerService::first();
        $this->assertNotNull($service->image);
        Storage::disk('public')->assertExists($service->image);
    }

    public function test_partner_can_update_catalog_service_with_spoofed_put()
    {
        Storage::fake('public');

        $user = User::factory()->create(['role' => 'partner']);
        $user->assignRole('partner');

        $service = PartnerService::create([
            'mitra_id' => $user->id,
            'name' => 'Ganti Oli',
            'price' => 50000,
            'description' => 'Ganti oli lama',
            'category' => 'service',
        ]);

        $file = UploadedFile::fake()->image('new_service.jpg');

        // Laravel spoofing method PUT via POST request
        $response = $this->actingAs($user)
            ->postJson("/api/partner/catalog/{$service->id}", [
                '_method' => 'PUT',
                'name' => 'Ganti Oli Baru',
                'price' => 55000,
                'description' => 'Ganti oli baru mesin',
                'category' => 'service',
                'image' => $file,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('service.name', 'Ganti Oli Baru')
            ->assertJsonPath('service.price', 55000);

        $service->refresh();
        $this->assertNotNull($service->image);
        Storage::disk('public')->assertExists($service->image);
    }

    public function test_partner_can_delete_catalog_service()
    {
        $user = User::factory()->create(['role' => 'partner']);
        $user->assignRole('partner');

        $service = PartnerService::create([
            'mitra_id' => $user->id,
            'name' => 'Tambal Ban Biasa',
            'price' => 15000,
            'category' => 'service',
        ]);

        $response = $this->actingAs($user)
            ->deleteJson("/api/partner/catalog/{$service->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('partner_services', ['id' => $service->id]);
    }
}
