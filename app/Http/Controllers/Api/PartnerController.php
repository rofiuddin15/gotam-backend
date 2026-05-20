<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Events\MechanicLocationUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PartnerController extends Controller
{
    /**
     * Update partner live location
     */
    public function updateLocation(Request $request)
    {
        $request->validate([
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
            'booking_id' => 'nullable|exists:bookings,id',
        ]);

        $user = Auth::user();
        
        // Update profile location
        $user->mitraProfile()->update([
            'lat' => $request->lat,
            'lng' => $request->lng,
        ]);

        // If there is an active booking, broadcast tracking info
        if ($request->booking_id) {
            $booking = Booking::find($request->booking_id);
            
            if ($booking && $booking->mitra_id === $user->id) {
                event(new MechanicLocationUpdated($booking->id, $request->lat, $request->lng));
            }
        }

        return response()->json(['message' => 'Lokasi berhasil diperbarui.']);
    }
}
