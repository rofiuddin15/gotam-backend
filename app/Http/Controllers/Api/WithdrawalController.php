<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Withdrawal;
use App\Models\WalletTransaction;
use App\Services\LogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class WithdrawalController extends Controller
{
    /**
     * Partner requests a withdrawal
     */
    public function store(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:50000', // Minimal tarik 50rb
            'bank_name' => 'required|string',
            'account_number' => 'required|string',
            'account_name' => 'required|string',
        ]);

        $user = Auth::user();
        $wallet = $user->wallet;

        if ($wallet->balance < $request->amount) {
            return response()->json(['message' => 'Saldo tidak mencukupi.'], 422);
        }

        return DB::transaction(function () use ($request, $user, $wallet) {
            // 1. Create Withdrawal Request
            $withdrawal = Withdrawal::create([
                'user_id' => $user->id,
                'amount' => $request->amount,
                'bank_name' => $request->bank_name,
                'account_number' => $request->account_number,
                'account_name' => $request->account_name,
                'status' => 'pending',
            ]);

            // 2. Deduct from wallet immediately to "lock" the funds
            $wallet->decrement('balance', $request->amount);

            // 3. Record transaction
            WalletTransaction::create([
                'wallet_id' => $wallet->id,
                'type' => 'withdrawal',
                'amount' => -$request->amount,
                'description' => "Penarikan dana ke {$request->bank_name} - {$request->account_number}",
                'reference_type' => Withdrawal::class,
                'reference_id' => $withdrawal->id,
            ]);

            return response()->json([
                'message' => 'Permintaan penarikan dana berhasil diajukan.',
                'withdrawal' => $withdrawal
            ], 201);
        });
    }

    /**
     * Get withdrawal history for the user
     */
    public function history()
    {
        $withdrawals = Withdrawal::where('user_id', Auth::id())
            ->latest()
            ->paginate(10);

        return response()->json($withdrawals);
    }

    /**
     * Admin: List pending withdrawals
     */
    public function pending()
    {
        $withdrawals = Withdrawal::with('user')
            ->where('status', 'pending')
            ->latest()
            ->paginate(20);

        return response()->json($withdrawals);
    }

    /**
     * Admin: Approve/Process withdrawal
     */
    public function approve(Withdrawal $withdrawal)
    {
        if ($withdrawal->status !== 'pending') {
            return response()->json(['message' => 'Permintaan sudah diproses sebelumnya.'], 422);
        }

        $withdrawal->update([
            'status' => 'completed',
            'processed_at' => now(),
            'admin_notes' => 'Dana telah ditransfer ke rekening tujuan.'
        ]);

        LogService::log(
            'Financial',
            'APPROVE_WITHDRAWAL',
            "Menyetujui penarikan dana Mitra ID: {$withdrawal->user_id} sebesar Rp " . number_format($withdrawal->amount),
            ['status' => 'pending'],
            ['status' => 'completed']
        );

        return response()->json(['message' => 'Penarikan dana telah disetujui.']);
    }

    /**
     * Admin: Reject withdrawal request and refund wallet balance
     */
    public function reject(Request $request, Withdrawal $withdrawal)
    {
        $request->validate([
            'admin_notes' => 'required|string',
        ]);

        if ($withdrawal->status !== 'pending') {
            return response()->json(['message' => 'Permintaan sudah diproses sebelumnya.'], 422);
        }

        return DB::transaction(function () use ($request, $withdrawal) {
            $withdrawal->update([
                'status' => 'rejected',
                'processed_at' => now(),
                'admin_notes' => $request->admin_notes
            ]);

            $user = $withdrawal->user;
            $wallet = $user->wallet;
            if ($wallet) {
                $wallet->increment('balance', $withdrawal->amount);

                WalletTransaction::create([
                    'wallet_id' => $wallet->id,
                    'type' => 'deposit',
                    'amount' => $withdrawal->amount,
                    'description' => "Pengembalian dana (Refund) akibat penarikan dana ditolak. Alasan: {$request->admin_notes}",
                    'reference_type' => Withdrawal::class,
                    'reference_id' => $withdrawal->id,
                ]);
            }

            LogService::log(
                'Financial',
                'REJECT_WITHDRAWAL',
                "Menolak penarikan dana Pengguna ID: {$withdrawal->user_id} sebesar Rp " . number_format($withdrawal->amount) . ". Alasan: {$request->admin_notes}",
                ['status' => 'pending'],
                ['status' => 'rejected']
            );

            return response()->json(['message' => 'Penarikan dana ditolak dan dana dikembalikan ke dompet pengguna.']);
        });
    }
}
