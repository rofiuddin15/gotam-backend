<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Booking;
use App\Models\ServiceCategory;
use App\Models\WalletTransaction;
use App\Models\Withdrawal;
use App\Services\FinancialService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create Customer
        $customer = User::create([
            'name' => 'Customer GoTam',
            'email' => 'customer@gotam.id',
            'phone' => '081234567890',
            'role' => 'customer',
            'password' => Hash::make('password'),
        ]);
        $customer->assignRole('customer');

        // 2. Create Partner 1 (Budi Santoso)
        $partner1 = User::create([
            'name' => 'Budi Santoso',
            'email' => 'budi@gotam.id',
            'phone' => '081234567891',
            'role' => 'partner',
            'password' => Hash::make('password'),
        ]);
        $partner1->assignRole('partner');
        
        $partner1->mitraProfile()->update([
            'vehicle_type_capability' => 'Motor, Mobil',
            'is_mobile' => true,
            'status_verified' => true,
            'is_online' => false,
            'lat' => -6.2147,
            'lng' => 106.8177,
        ]);

        // 3. Create Partner 2 (Joko Widodo)
        $partner2 = User::create([
            'name' => 'Joko Widodo',
            'email' => 'joko@gotam.id',
            'phone' => '081234567892',
            'role' => 'partner',
            'password' => Hash::make('password'),
        ]);
        $partner2->assignRole('partner');
        
        $partner2->mitraProfile()->update([
            'vehicle_type_capability' => 'Motor',
            'is_mobile' => true,
            'status_verified' => true,
            'is_online' => true,
            'lat' => -6.2200,
            'lng' => 106.8000,
        ]);

        // --- SIMULATED FINANCIAL TRANSACTIONS ---
        $financialService = resolve(FinancialService::class);

        // A. Top-ups
        // Customer tops up Rp 500,000 via OVO
        $customer->wallet->increment('balance', 500000);
        WalletTransaction::create([
            'wallet_id' => $customer->wallet->id,
            'type' => 'deposit',
            'amount' => 500000,
            'description' => 'Isi saldo (Top-up) via OVO',
            'created_at' => now()->subDays(5),
        ]);

        // Partner 1 tops up Rp 100,000 via Bank Transfer
        $partner1->wallet->increment('balance', 100000);
        WalletTransaction::create([
            'wallet_id' => $partner1->wallet->id,
            'type' => 'deposit',
            'amount' => 100000,
            'description' => 'Isi saldo (Top-up) via Bank Transfer',
            'created_at' => now()->subDays(4),
        ]);

        // B. Bookings & Settlements
        // Booking 1: Customer buys Mobil Tubeless from Budi (Rp 25,000) using Wallet
        $catMobilTubeless = ServiceCategory::where('vehicle_type', 'Mobil')->where('tire_type', 'Tubeless')->first();
        if ($catMobilTubeless) {
            $booking1 = Booking::create([
                'customer_id' => $customer->id,
                'mitra_id' => $partner1->id,
                'service_category_id' => $catMobilTubeless->id,
                'status' => 'completed',
                'geo_location_user' => [
                    'lat' => -6.2247,
                    'lng' => 106.8077,
                    'address' => 'Sudirman Central Business District',
                ],
                'geo_location_mitra' => [
                    'lat' => -6.2147,
                    'lng' => 106.8177,
                ],
                'final_price' => 25000,
                'notes' => 'Tambal ban depan kanan bocor halus',
                'created_at' => now()->subDays(3),
            ]);
            $booking1->logStatus('searching', 'Mencari mekanik terdekat', now()->subDays(3));
            $booking1->logStatus('completed', 'Pesanan selesai', now()->subDays(3));

            // Settle Booking using Wallet
            $financialService->settleBooking($booking1, 'Wallet');
        }

        // Booking 2: Customer buys Motor Ban Dalam from Joko (Rp 20,000) using Cash (Tunai)
        $catMotorDalam = ServiceCategory::where('vehicle_type', 'Motor')->where('tire_type', 'Ban Dalam')->first();
        if ($catMotorDalam) {
            $booking2 = Booking::create([
                'customer_id' => $customer->id,
                'mitra_id' => $partner2->id,
                'service_category_id' => $catMotorDalam->id,
                'status' => 'completed',
                'geo_location_user' => [
                    'lat' => -6.2247,
                    'lng' => 106.8077,
                    'address' => 'Sudirman Central Business District',
                ],
                'geo_location_mitra' => [
                    'lat' => -6.2200,
                    'lng' => 106.8000,
                ],
                'final_price' => 20000,
                'notes' => 'Ban belakang kena paku',
                'created_at' => now()->subDays(2),
            ]);
            $booking2->logStatus('searching', 'Mencari mekanik terdekat', now()->subDays(2));
            $booking2->logStatus('completed', 'Pesanan selesai', now()->subDays(2));

            // Settle Booking using Cash (Tunai)
            $financialService->settleBooking($booking2, 'Tunai');
        }

        // C. Withdrawals
        // 1. Completed withdrawal for Budi (Partner 1) of Rp 50,000
        $withdrawalAmount1 = 50000;
        $partner1->wallet->decrement('balance', $withdrawalAmount1);
        $w1 = Withdrawal::create([
            'user_id' => $partner1->id,
            'amount' => $withdrawalAmount1,
            'bank_name' => 'BCA',
            'account_number' => '123456789',
            'account_name' => 'Budi Santoso',
            'status' => 'completed',
            'processed_at' => now()->subDays(1),
            'admin_notes' => 'Dana berhasil ditransfer.',
        ]);
        WalletTransaction::create([
            'wallet_id' => $partner1->wallet->id,
            'type' => 'withdrawal',
            'amount' => -$withdrawalAmount1,
            'description' => "Penarikan dana ke BCA - 123456789",
            'reference_type' => Withdrawal::class,
            'reference_id' => $w1->id,
            'created_at' => now()->subDays(1),
        ]);

        // 2. Pending withdrawal for Joko (Partner 2) of Rp 20,000
        // (Joko's current wallet balance is -Rp 2,000 from the cash platform commission, so let's top him up first to allow withdrawal)
        $partner2->wallet->increment('balance', 50000); // Top up first so he has enough
        WalletTransaction::create([
            'wallet_id' => $partner2->wallet->id,
            'type' => 'deposit',
            'amount' => 50000,
            'description' => 'Isi saldo (Top-up) via GoPay',
            'created_at' => now()->subMinutes(60),
        ]);

        // Now Joko has positive balance (Rp 48,000), do pending withdrawal of Rp 30,000
        $withdrawalAmount2 = 30000;
        $partner2->wallet->decrement('balance', $withdrawalAmount2);
        $w2 = Withdrawal::create([
            'user_id' => $partner2->id,
            'amount' => $withdrawalAmount2,
            'bank_name' => 'Mandiri',
            'account_number' => '987654321',
            'account_name' => 'Joko Widodo',
            'status' => 'pending',
        ]);
        WalletTransaction::create([
            'wallet_id' => $partner2->wallet->id,
            'type' => 'withdrawal',
            'amount' => -$withdrawalAmount2,
            'description' => "Penarikan dana ke Mandiri - 987654321",
            'reference_type' => Withdrawal::class,
            'reference_id' => $w2->id,
            'created_at' => now()->subMinutes(30),
        ]);
    }
}
