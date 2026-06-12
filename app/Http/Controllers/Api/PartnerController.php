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

    /**
     * Update partner online status
     */
    public function updateStatus(Request $request)
    {
        $request->validate([
            'is_online' => 'required|boolean',
        ]);

        $user = Auth::user();
        
        $user->mitraProfile()->update([
            'is_online' => $request->is_online,
        ]);

        return response()->json([
            'message' => 'Status online berhasil diperbarui.',
            'is_online' => (bool)$user->mitraProfile->fresh()->is_online,
        ]);
    }

    /**
     * Get nearby verified & online partners (for customer booking screen)
     */
    public function nearby(Request $request)
    {
        $customerLat = (float) $request->query('lat', -6.2146);
        $customerLng = (float) $request->query('lng', 106.8451);

        $partners = \App\Models\User::where('role', 'partner')
            ->whereHas('mitraProfile', function ($q) {
                $q->where('status_verified', true)
                  ->where('is_online', true)
                  ->whereNotNull('lat')
                  ->whereNotNull('lng');
            })
            ->with(['mitraProfile'])
            ->get()
            ->map(function ($partner) use ($customerLat, $customerLng) {
                $profile = $partner->mitraProfile;
                $lat = (float) $profile->lat;
                $lng = (float) $profile->lng;

                // Haversine distance in km
                $earthRadius = 6371;
                $dLat = deg2rad($lat - $customerLat);
                $dLng = deg2rad($lng - $customerLng);
                $a = sin($dLat / 2) * sin($dLat / 2)
                    + cos(deg2rad($customerLat)) * cos(deg2rad($lat))
                    * sin($dLng / 2) * sin($dLng / 2);
                $distance = $earthRadius * 2 * atan2(sqrt($a), sqrt(1 - $a));

                return [
                    'id'             => $partner->id,
                    'name'           => $partner->name,
                    'phone'          => $partner->phone,
                    'avatar'         => $profile->avatar,
                    'lat'            => $lat,
                    'lng'            => $lng,
                    'distance'       => round($distance, 2),
                    'distance_label' => $distance < 1
                        ? round($distance * 1000) . ' m'
                        : round($distance, 1) . ' km',
                ];
            })
            ->sortBy('distance')
            ->values();

        return response()->json($partners);
    }
}
