<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceCategory;
use App\Services\LogService;
use Illuminate\Http\Request;

class ServiceCategoryController extends Controller
{
    public function index()
    {
        return response()->json(ServiceCategory::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'base_price' => 'required|numeric|min:0',
            'vehicle_type' => 'required|in:motor,mobil',
            'tire_type' => 'required|in:tubeless,ban_dalam',
        ]);

        $category = ServiceCategory::create($request->all());

        LogService::log(
            'Services',
            'CREATE_CATEGORY',
            "Menambahkan kategori layanan baru: {$category->name}",
            null,
            $category->toArray()
        );

        return response()->json([
            'message' => 'Kategori layanan berhasil ditambahkan.',
            'category' => $category
        ], 201);
    }

    public function update(Request $request, ServiceCategory $category)
    {
        $request->validate([
            'name' => 'string|max:255',
            'base_price' => 'numeric|min:0',
        ]);

        $category->update($request->all());

        return response()->json([
            'message' => 'Kategori layanan berhasil diperbarui.',
            'category' => $category
        ]);
    }

    public function destroy(ServiceCategory $category)
    {
        $category->delete();

        LogService::log(
            'Services',
            'DELETE_CATEGORY',
            "Menghapus kategori layanan: {$category->name}",
            $category->toArray(),
            null
        );

        return response()->json(['message' => 'Kategori layanan berhasil dihapus.']);
    }
}
