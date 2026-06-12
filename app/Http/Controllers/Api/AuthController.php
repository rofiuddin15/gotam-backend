<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users',
            'phone' => 'required|string|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:customer,partner',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'role' => $request->role,
            'password' => Hash::make($request->password),
        ]);

        $user->assignRole($request->role);

        $token = $user->createToken('auth_token')->plainTextToken;

        if ($user->role === 'partner') {
            $user->load(['mitraProfile', 'wallet']);
        }

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string',
            'password' => 'required',
        ]);

        $loginInput = $request->email;

        $user = User::where('email', $loginInput)
            ->orWhere('phone', $loginInput)
            ->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Kredensial yang diberikan salah.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        if ($user->role === 'partner') {
            $user->load(['mitraProfile', 'wallet']);
        }

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    public function logout(Request $request)
    {
        $token = $request->user()->currentAccessToken();
        if (method_exists($token, 'delete')) {
            $token->delete();
        }

        return response()->json([
            'message' => 'Berhasil keluar dari sistem.'
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        if ($user->role === 'partner') {
            $user->load(['mitraProfile', 'wallet']);
        }
        return response()->json($user);
    }

    public function updateMe(Request $request)
    {
        $user = $request->user();

        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users,email,' . $user->id,
            'phone' => 'required|string|unique:users,phone,' . $user->id,
            'password' => 'nullable|string|min:8',
        ];

        if ($user->role === 'partner') {
            $rules['vehicle_type_capability'] = 'required|string';
            $rules['is_mobile'] = 'required|boolean';
        }

        $request->validate($rules);

        $user->name = $request->name;
        $user->email = $request->email;
        $user->phone = $request->phone;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        if ($user->role === 'partner') {
            $user->mitraProfile()->update([
                'vehicle_type_capability' => $request->vehicle_type_capability,
                'is_mobile' => $request->is_mobile,
            ]);
        }

        if ($user->role === 'partner') {
            $user->load(['mitraProfile', 'wallet']);
        }

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',
            'user' => $user,
        ]);
    }
}
