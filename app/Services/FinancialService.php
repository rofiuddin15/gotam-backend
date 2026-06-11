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
    public function settleBooking(Booking $booking, $paymentMethod = 'Tunai')
    {
        return DB::transaction(function () use ($booking, $paymentMethod) {
            $totalAmount = $booking->final_price;
            $platformCommission = ($totalAmount * $this->commissionRate) / 100;
            $partnerAmount = $totalAmount - $platformCommission;

            // 1. Create transaction record for payment gateway tracking
            \App\Models\Transaction::create([
                'booking_id' => $booking->id,
                'payment_method' => $paymentMethod,
                'status' => 'success',
                'amount' => $totalAmount,
            ]);

            // 2. Record Platform Earning
            PlatformEarning::create([
                'booking_id' => $booking->id,
                'total_amount' => $totalAmount,
                'partner_amount' => $partnerAmount,
                'platform_commission' => $platformCommission,
                'commission_rate' => $this->commissionRate,
            ]);

            // 3. Double-entry Wallet adjustments based on payment method
            if (strtolower($paymentMethod) === 'wallet') {
                $customer = $booking->customer;
                $customerWallet = $customer->wallet;

                if (!$customerWallet || $customerWallet->balance < $totalAmount) {
                    throw new \Exception("Saldo dompet pelanggan tidak mencukupi untuk melakukan pembayaran.");
                }

                // Decrement customer wallet balance
                $customerWallet->decrement('balance', $totalAmount);

                // Record wallet transaction for customer (payment)
                WalletTransaction::create([
                    'wallet_id' => $customerWallet->id,
                    'type' => 'payment',
                    'amount' => -$totalAmount,
                    'description' => "Pembayaran pesanan #{$booking->id}",
                    'reference_type' => Booking::class,
                    'reference_id' => $booking->id,
                ]);

                // Increment partner wallet balance
                $partner = $booking->mitra;
                $partnerWallet = $partner->wallet;
                if ($partnerWallet) {
                    $partnerWallet->increment('balance', $partnerAmount);

                    // Record wallet transaction for partner (earnings)
                    WalletTransaction::create([
                        'wallet_id' => $partnerWallet->id,
                        'type' => 'earnings',
                        'amount' => $partnerAmount,
                        'description' => "Pendapatan dari pesanan #{$booking->id}",
                        'reference_type' => Booking::class,
                        'reference_id' => $booking->id,
                    ]);
                }
            } else {
                // Cash Payment: Customer pays partner directly.
                // Platform fee is deducted from partner's wallet balance.
                $partner = $booking->mitra;
                $partnerWallet = $partner->wallet;

                if ($partnerWallet) {
                    $partnerWallet->decrement('balance', $platformCommission);

                    // Record wallet transaction for partner (commission deduction)
                    WalletTransaction::create([
                        'wallet_id' => $partnerWallet->id,
                        'type' => 'commission_deduction',
                        'amount' => -$platformCommission,
                        'description' => "Pemotongan komisi platform ({$this->commissionRate}%) untuk pesanan tunai #{$booking->id}",
                        'reference_type' => Booking::class,
                        'reference_id' => $booking->id,
                    ]);
                }
            }

            return true;
        });
    }
}
