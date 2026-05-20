<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\ServiceCategory;
use App\Events\BookingCreated;
use App\Events\BookingAccepted;
use App\Services\FinancialService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BookingController extends Controller
{
    /**
     * Create a new booking (Quick Request / Panic Button)
     */
    public function store(Request $request)
    {
        $request->validate([
            'vehicle_type' => 'required|in:Mobil,Motor,Truk',
            'tire_type' => 'required|in:Tubeless,Ban Dalam',
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
            'address' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        // Find the appropriate service category to get base price
        $category = ServiceCategory::where('vehicle_type', $request->vehicle_type)
            ->where('tire_type', $request->tire_type)
            ->first();

        if (!$category) {
            return response()->json(['message' => 'Layanan tidak tersedia untuk kombinasi ini.'], 422);
        }

        $booking = Booking::create([
            'customer_id' => Auth::id(),
            'service_category_id' => $category->id,
            'status' => 'searching',
            'geo_location_user' => [
                'lat' => $request->lat,
                'lng' => $request->lng,
                'address' => $request->address,
            ],
            'final_price' => $category->base_price,
            'notes' => $request->notes,
        ]);

        // Record Initial Log
        $booking->logStatus('searching', 'Pesanan sedang mencari mekanik terdekat.');

        // Broadcast to nearby partners
        event(new BookingCreated($booking));

        return response()->json([
            'message' => 'Mencari mekanik terdekat...',
            'booking' => $booking->load('serviceCategory'),
        ], 201);
    }

    /**
     * Get active booking for the current user
     */
    public function activeBooking()
    {
        $booking = Booking::where('customer_id', Auth::id())
            ->whereIn('status', ['searching', 'heading_to_location', 'repairing'])
            ->with(['mitra', 'serviceCategory'])
            ->latest()
            ->first();

        if (!$booking) {
            return response()->json(['message' => 'Tidak ada pesanan aktif.'], 404);
        }

        return response()->json($booking);
    }

    /**
     * Cancel booking
     */
    public function cancel(Booking $booking)
    {
        if ($booking->customer_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!in_array($booking->status, ['searching', 'heading_to_location'])) {
            return response()->json(['message' => 'Pesanan tidak dapat dibatalkan pada tahap ini.'], 422);
        }

        $booking->update(['status' => 'cancelled']);

        return response()->json(['message' => 'Pesanan berhasil dibatalkan.']);
    }

    /**
     * Partner accepts the booking
     */
    public function accept(Booking $booking)
    {
        if ($booking->status !== 'searching') {
            return response()->json(['message' => 'Pesanan sudah diambil oleh mekanik lain.'], 422);
        }

        $booking->update([
            'mitra_id' => Auth::id(),
            'status' => 'heading_to_location',
        ]);

        // Record Status Log
        $booking->logStatus('heading_to_location', 'Mekanik telah menerima pesanan dan sedang menuju lokasi Anda.');

        // Notify customer
        event(new BookingAccepted($booking));

        return response()->json([
            'message' => 'Pesanan berhasil diterima. Silakan menuju lokasi customer.',
            'booking' => $booking->load('customer'),
        ]);
    }

    /**
     * Partner arrived at location
     */
    public function arrived(Booking $booking)
    {
        if ($booking->status !== 'heading_to_location') {
            return response()->json(['message' => 'Invalid status transition.'], 422);
        }

        $booking->update(['status' => 'arrived']);
        $booking->logStatus('arrived', 'Mekanik telah sampai di lokasi Anda.');

        return response()->json(['message' => 'Status diperbarui: Mekanik sampai.', 'booking' => $booking]);
    }

    /**
     * Partner starts the repair
     */
    public function startRepair(Booking $booking)
    {
        if ($booking->status !== 'arrived') {
            return response()->json(['message' => 'Invalid status transition.'], 422);
        }

        $booking->update(['status' => 'repairing']);
        $booking->logStatus('repairing', 'Mekanik sedang melakukan perbaikan kendaraan Anda.');

        return response()->json(['message' => 'Status diperbarui: Sedang diperbaiki.', 'booking' => $booking]);
    }

    /**
     * Mark booking as completed
     */
    public function complete(Booking $booking, FinancialService $financialService)
    {
        if ($booking->status !== 'repairing') {
            return response()->json(['message' => 'Hanya pesanan dalam perbaikan yang bisa diselesaikan.'], 422);
        }

        $booking->update(['status' => 'completed']);

        // Record Status Log
        $booking->logStatus('completed', 'Pesanan telah selesai. Terima kasih telah menggunakan GoTam!');

        // Process financial settlement
        $financialService->settleBooking($booking);

        return response()->json([
            'message' => 'Pesanan telah selesai. Saldo telah diteruskan ke dompet mekanik.',
            'booking' => $booking
        ]);
    }

    /**
     * Get booking status timeline
     */
    public function timeline(Booking $booking)
    {
        $timeline = $booking->statusLogs()
            ->latest()
            ->get();

        return response()->json($timeline);
    }
}
