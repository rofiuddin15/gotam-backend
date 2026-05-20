<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index()
    {
        return response()->json(Role::with('permissions')->get());
    }

    public function permissions()
    {
        return response()->json(Permission::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:roles,name',
            'permissions' => 'array'
        ]);

        $role = Role::create(['name' => $request->name]);
        
        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        return response()->json([
            'message' => 'Role berhasil dibuat.',
            'role' => $role->load('permissions')
        ], 201);
    }

    public function update(Request $request, Role $role)
    {
        $request->validate([
            'permissions' => 'required|array'
        ]);

        $role->syncPermissions($request->permissions);

        return response()->json([
            'message' => 'Izin Role berhasil diperbarui.',
            'role' => $role->load('permissions')
        ]);
    }

    public function destroy(Role $role)
    {
        if (in_array($role->name, ['admin', 'customer', 'partner'])) {
            return response()->json(['message' => 'Role bawaan tidak dapat dihapus.'], 422);
        }

        $role->delete();
        return response()->json(['message' => 'Role berhasil dihapus.']);
    }
}
