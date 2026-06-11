<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\PlatformEarning;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Models\Withdrawal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Financial Report (Laba Rugi & Neraca/Arus Kas Simulasian)
     */
    public function financialReport(Request $request)
    {
        // 1. Income Statement (Laba Rugi)
        $grossBookingRevenue = Booking::where('status', 'completed')->sum('final_price');
        $platformCommissionEarned = PlatformEarning::sum('platform_commission');
        $partnerSharePayout = PlatformEarning::sum('partner_amount');

        // 2. Cash Flow / Balance Sheet simulation
        $totalDeposits = WalletTransaction::where('type', 'deposit')->sum('amount');
        $totalWithdrawals = Withdrawal::where('status', 'completed')->sum('amount');
        
        // Liability (saldo mengendap milik pengguna/mitra yang dipegang perusahaan)
        $totalLiability = Wallet::sum('balance');

        // Total cash currently handled by the system (simulated bank balance)
        $netSimulatedBankBalance = $totalDeposits - $totalWithdrawals;

        return response()->json([
            'income_statement' => [
                'gross_revenue' => (float) $grossBookingRevenue,
                'gross_revenue_formatted' => 'Rp ' . number_format($grossBookingRevenue, 2, ',', '.'),
                'partner_payouts' => (float) $partnerSharePayout,
                'partner_payouts_formatted' => 'Rp ' . number_format($partnerSharePayout, 2, ',', '.'),
                'platform_commission' => (float) $platformCommissionEarned,
                'platform_commission_formatted' => 'Rp ' . number_format($platformCommissionEarned, 2, ',', '.'),
            ],
            'balance_sheet' => [
                'total_deposits' => (float) $totalDeposits,
                'total_deposits_formatted' => 'Rp ' . number_format($totalDeposits, 2, ',', '.'),
                'total_withdrawals' => (float) $totalWithdrawals,
                'total_withdrawals_formatted' => 'Rp ' . number_format($totalWithdrawals, 2, ',', '.'),
                'held_user_balances_liability' => (float) $totalLiability,
                'held_user_balances_liability_formatted' => 'Rp ' . number_format($totalLiability, 2, ',', '.'),
                'simulated_bank_balance' => (float) $netSimulatedBankBalance,
                'simulated_bank_balance_formatted' => 'Rp ' . number_format($netSimulatedBankBalance, 2, ',', '.'),
            ],
            'ledger_summary' => [
                'deposits_count' => WalletTransaction::where('type', 'deposit')->count(),
                'withdrawals_count' => Withdrawal::count(),
                'commission_transactions_count' => WalletTransaction::where('type', 'commission_deduction')->count(),
                'payment_transactions_count' => WalletTransaction::where('type', 'payment')->count(),
            ]
        ]);
    }

    /**
     * User & Partner (Mitra) Performance Report
     */
    public function userReport(Request $request)
    {
        // 1. General counts
        $customerCount = User::where('role', 'customer')
            ->orWhereHas('roles', function($q) { $q->where('name', 'customer'); })
            ->count();

        $partnerCount = User::where('role', 'partner')
            ->orWhereHas('roles', function($q) { $q->where('name', 'partner'); })
            ->count();

        // 2. Wallet Distribution
        $averageWalletBalance = Wallet::avg('balance');
        $maxWalletBalance = Wallet::max('balance');
        $totalWalletBalance = Wallet::sum('balance');

        // 3. Top Partners (Mitra) by completed bookings and earnings
        $topPartners = User::whereHas('roles', function($q) { $q->where('name', 'partner'); })
            ->withCount(['mitraBookings as completed_bookings' => function($q) {
                $q->where('status', 'completed');
            }])
            ->withSum('mitraBookings as total_gross_earnings', 'final_price')
            ->orderBy('completed_bookings', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($user) {
                $wallet = $user->wallet;
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'phone' => $user->phone,
                    'completed_bookings' => $user->completed_bookings ?? 0,
                    'total_gross_earnings' => (float) ($user->total_gross_earnings ?? 0),
                    'wallet_balance' => (float) ($wallet ? $wallet->balance : 0),
                ];
            });

        // 4. Top Customers by bookings & spending
        $topCustomers = User::whereHas('roles', function($q) { $q->where('name', 'customer'); })
            ->withCount(['customerBookings as completed_bookings' => function($q) {
                $q->where('status', 'completed');
            }])
            ->withSum('customerBookings as total_spending', 'final_price')
            ->orderBy('total_spending', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($user) {
                $wallet = $user->wallet;
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'phone' => $user->phone,
                    'completed_bookings' => $user->completed_bookings ?? 0,
                    'total_spending' => (float) ($user->total_spending ?? 0),
                    'wallet_balance' => (float) ($wallet ? $wallet->balance : 0),
                ];
            });

        return response()->json([
            'user_stats' => [
                'total_customers' => $customerCount,
                'total_partners' => $partnerCount,
            ],
            'wallet_stats' => [
                'total_balance' => (float) $totalWalletBalance,
                'average_balance' => (float) $averageWalletBalance,
                'max_balance' => (float) $maxWalletBalance,
            ],
            'top_partners' => $topPartners,
            'top_customers' => $topCustomers,
        ]);
    }

    /**
     * Laporan Arus Kas / Jurnal Umum
     */
    public function cashFlow(Request $request)
    {
        $query = WalletTransaction::with(['wallet.user']);

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('wallet.user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $transactions = $query->orderBy('created_at', 'desc')->paginate($request->input('per_page', 15));

        return response()->json($transactions);
    }

    /**
     * Laporan Uang Keluar (Withdrawals)
     */
    public function withdrawalsReport(Request $request)
    {
        $query = Withdrawal::with(['user']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $withdrawals = $query->orderBy('created_at', 'desc')->paginate($request->input('per_page', 15));

        return response()->json($withdrawals);
    }
}
