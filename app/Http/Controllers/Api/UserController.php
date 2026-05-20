<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $role = $request->query('role');
        $search = $request->query('search');

        $query = User::with('roles');

        if ($role) {
            $query->role($role);
        }

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%");
            });
        }

        return response()->json($query->paginate(10));
    }

    /**
     * Register a new staff member
     */
    public function storeStaff(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users,email',
            'phone' => 'required|string|unique:users,phone',
            'password' => 'required|string|min:8',
            'role' => 'required|exists:roles,name',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => 'admin', // Staff are technically admin-type users with specific roles
        ]);

        $user->assignRole($request->role);

        return response()->json([
            'message' => 'Staff berhasil didaftarkan.',
            'user' => $user->load('roles')
        ], 201);
    }

    /**
     * Update user role or status
     */
    public function update(Request $request, User $user)
    {
        if ($request->has('role')) {
            $user->syncRoles([$request->role]);
        }

        return response()->json([
            'message' => 'Data pengguna berhasil diperbarui.',
            'user' => $user->load('roles')
        ]);
    }
}
