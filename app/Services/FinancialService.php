<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\PlatformEarning;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;

class FinancialService
{
    protected $commissionRate = 10.00; // 10% platform fee

    /**
     * Process financial settlement after a booking is completed
     */
    public function settleBooking(Booking $booking)
    {
        return DB::transaction(function () use ($booking) {
            $totalAmount = $booking->final_price;
            $platformCommission = ($totalAmount * $this->commissionRate) / 100;
            $partnerAmount = $totalAmount - $platformCommission;

            // 1. Record Platform Earning
            PlatformEarning::create([
                'booking_id' => $booking->id,
                'total_amount' => $totalAmount,
                'partner_amount' => $partnerAmount,
                'platform_commission' => $platformCommission,
                'commission_rate' => $this->commissionRate,
            ]);

            // 2. Update Partner Wallet
            $partner = $booking->mitra;
            $wallet = $partner->wallet;
            
            $wallet->increment('balance', $partnerAmount);

            // 3. Record Wallet Transaction
            WalletTransaction::create([
                'wallet_id' => $wallet->id,
                'type' => 'earnings',
                'amount' => $partnerAmount,
                'description' => "Pendapatan dari pesanan #{$booking->id}",
                'reference_type' => Booking::class,
                'reference_id' => $booking->id,
            ]);

            return true;
        });
    }
}
