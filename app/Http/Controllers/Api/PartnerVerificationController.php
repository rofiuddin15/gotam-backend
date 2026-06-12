<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\MitraProfile;
use Illuminate\Http\Request;

class PartnerVerificationController extends Controller
{
    public function index()
    {
        $partners = User::role('partner')
            ->with('mitraProfile')
            ->whereHas('mitraProfile', function($q) {
                $q->where('status_verified', false);
            })
            ->latest()
            ->paginate(10);

        return response()->json($partners);
    }

    public function verify(Request $request, User $user)
    {
        $status = $request->input('status', 'verified');
        $isVerified = $status === 'verified';

        $user->mitraProfile()->update(['status_verified' => $isVerified]);

        return response()->json([
            'message' => $isVerified ? 'Mitra berhasil diverifikasi.' : 'Verifikasi mitra ditolak.'
        ]);
    }
}
