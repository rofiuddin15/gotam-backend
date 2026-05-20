<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\User;
use App\Models\Transaction;
use App\Models\PartnerService;
use App\Models\BookingItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    public function dashboardStats()
    {
        $totalTransactions = Transaction::where('status', 'success')->count();
        $totalRevenue = Transaction::where('status', 'success')->sum('amount');
        $activeBookings = Booking::whereIn('status', ['searching', 'heading_to_location', 'repairing'])->count();
        
        // Count partners using role or simple role column
        $newPartners = User::where(function($q) {
            $q->where('role', 'partner')
              ->orWhereHas('roles', function($rq) { $rq->where('name', 'partner'); });
        })->where('created_at', '>=', now()->subDays(30))->count();

        // Database agnostic Monthly Revenue (Last 6 Months)
        $isSqlite = DB::connection()->getDriverName() === 'sqlite';
        $monthFormat = $isSqlite ? "strftime('%m', created_at)" : "MONTH(created_at)";
        $monthNameFormat = $isSqlite ? "strftime('%m', created_at)" : "DATE_FORMAT(created_at, '%b')";

        $monthlyRevenueRaw = Transaction::where('status', 'success')
            ->select(
                DB::raw('SUM(amount) as value'),
                DB::raw("$monthFormat as month_num"),
                DB::raw("$monthNameFormat as name")
            )
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('month_num', 'name')
            ->orderBy('month_num')
            ->get();

        // Format names for SQLite if needed (SQLite strftime returns numbers)
        if ($isSqlite) {
            $monthlyRevenueRaw = $monthlyRevenueRaw->map(function($item) {
                $monthName = date("M", mktime(0, 0, 0, (int)$item->name, 10));
                return [
                    'value' => (float)$item->value,
                    'name' => $monthName
                ];
            });
        }

        return response()->json([
            'stats' => [
                'total_transactions' => number_format($totalTransactions),
                'total_revenue' => 'Rp ' . number_format($totalRevenue / 1000000, 1) . 'M',
                'active_bookings' => $activeBookings,
                'new_partners' => $newPartners,
            ],
            'revenue_chart' => $monthlyRevenueRaw,
            'system_status' => [
                'api' => '99.98%',
                'db' => '45ms'
            ],
            'onboarding' => [
                'verified' => User::whereHas('mitraProfile', function($q) {
                    $q->where('status_verified', true);
                })->count(),
                'target' => 100
            ],
            'top_products' => BookingItem::select('name', DB::raw('SUM(quantity) as sold'), DB::raw('SUM(subtotal) as revenue'))
                ->groupBy('name')
                ->orderBy('sold', 'desc')
                ->limit(5)
                ->get(),
            'services_summary' => [
                'total_services' => PartnerService::where('category', 'service')->count(),
                'total_products' => PartnerService::where('category', 'product')->count(),
            ]
        ]);
    }

    public function liveMonitoring()
    {
        $bookings = Booking::with(['customer', 'mitra', 'serviceCategory'])
            ->whereIn('status', ['searching', 'heading_to_location', 'repairing'])
            ->latest()
            ->limit(10)
            ->get();

        return response()->json($bookings);
    }
}
