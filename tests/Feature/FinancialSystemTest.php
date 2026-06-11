<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\ServiceCategory;
use App\Models\User;
use App\Services\FinancialService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FinancialSystemTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles & service categories
        $this->seed(\Database\Seeders\RoleSeeder::class);
        $this->seed(\Database\Seeders\ServiceCategorySeeder::class);
    }

    public function test_customer_can_topup_wallet()
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $customer->assignRole('customer');

        $response = $this->actingAs($customer)
            ->postJson('/api/wallet/topup', [
                'amount' => 100000,
                'payment_method' => 'OVO',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('balance', 100000);

        $this->assertDatabaseHas('wallet_transactions', [
            'wallet_id' => $customer->wallet->id,
            'type' => 'deposit',
            'amount' => 100000,
        ]);
    }

    public function test_wallet_booking_payment_and_platform_commission()
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $customer->assignRole('customer');

        $partner = User::factory()->create(['role' => 'partner']);
        $partner->assignRole('partner');

        // Give customer some balance
        $customer->wallet->increment('balance', 50000);

        // Find service category
        $category = ServiceCategory::first();

        // Create booking
        $booking = Booking::create([
            'customer_id' => $customer->id,
            'mitra_id' => $partner->id,
            'service_category_id' => $category->id,
            'status' => 'repairing',
            'geo_location_user' => ['lat' => -6.2247, 'lng' => 106.8077, 'address' => 'Sudirman'],
            'final_price' => 20000,
        ]);

        // Settle via Wallet
        $financialService = resolve(FinancialService::class);
        $financialService->settleBooking($booking, 'Wallet');

        // Assert customer wallet decremented
        $this->assertEquals(30000, $customer->wallet->fresh()->balance);

        // Assert partner wallet incremented by 90% (Rp 18,000)
        $this->assertEquals(18000, $partner->wallet->fresh()->balance);

        // Assert platform earning registered commission of 10% (Rp 2,000)
        $this->assertDatabaseHas('platform_earnings', [
            'booking_id' => $booking->id,
            'total_amount' => 20000,
            'platform_commission' => 2000,
        ]);
    }

    public function test_cash_booking_payment_deducts_commission_from_partner()
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $customer->assignRole('customer');

        $partner = User::factory()->create(['role' => 'partner']);
        $partner->assignRole('partner');

        // Partner has some pre-existing balance
        $partner->wallet->increment('balance', 10000);

        $category = ServiceCategory::first();

        $booking = Booking::create([
            'customer_id' => $customer->id,
            'mitra_id' => $partner->id,
            'service_category_id' => $category->id,
            'status' => 'repairing',
            'geo_location_user' => ['lat' => -6.2247, 'lng' => 106.8077, 'address' => 'Sudirman'],
            'final_price' => 20000,
        ]);

        // Settle via Cash (Tunai)
        $financialService = resolve(FinancialService::class);
        $financialService->settleBooking($booking, 'Tunai');

        // Customer wallet remains unchanged (0)
        $this->assertEquals(0, $customer->wallet->fresh()->balance);

        // Partner wallet decremented by 10% commission (Rp 2,000)
        $this->assertEquals(8000, $partner->wallet->fresh()->balance);
    }
}
