<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WalletTransaction;
use App\Services\LogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class WalletController extends Controller
{
    /**
     * Top-up wallet balance (simulated payment gateway)
     */
    public function topup(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:10000', // Minimal topup 10rb
            'payment_method' => 'required|string', // e.g. "OVO", "Dana", "Transfer Bank"
        ]);

        $user = Auth::user();
        $wallet = $user->wallet;

        if (!$wallet) {
            return response()->json(['message' => 'Wallet tidak ditemukan.'], 404);
        }

        return DB::transaction(function () use ($request, $user, $wallet) {
            $amount = $request->amount;

            // 1. Increment Wallet Balance
            $wallet->increment('balance', $amount);

            // 2. Record Wallet Transaction
            $transaction = WalletTransaction::create([
                'wallet_id' => $wallet->id,
                'type' => 'deposit',
                'amount' => $amount,
                'description' => "Isi saldo (Top-up) via {$request->payment_method}",
                'reference_type' => null,
                'reference_id' => null,
            ]);

            // 3. Log Activity for Admin Audit Trail
            LogService::log(
                'Financial',
                'TOPUP_WALLET',
                "Pengguna ID: {$user->id} ({$user->name}) melakukan top-up sebesar Rp " . number_format($amount) . " via {$request->payment_method}",
                null,
                ['new_balance' => $wallet->balance]
            );

            return response()->json([
                'message' => 'Top-up saldo berhasil diproses.',
                'balance' => $wallet->balance,
                'transaction' => $transaction
            ], 200);
        });
    }

    /**
     * Get wallet balance and recent transactions
     */
    public function balance(Request $request)
    {
        $user = Auth::user();
        $wallet = $user->wallet;

        if (!$wallet) {
            return response()->json(['message' => 'Wallet tidak ditemukan.'], 404);
        }

        $transactions = $wallet->transactions()
            ->latest()
            ->paginate(15);

        return response()->json([
            'balance' => $wallet->balance,
            'currency' => $wallet->currency,
            'transactions' => $transactions
        ]);
    }
}
