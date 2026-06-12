<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PartnerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PartnerServiceController extends Controller
{
    /**
     * List services for the authenticated partner
     */
    public function index()
    {
        $services = PartnerService::where('mitra_id', Auth::id())->get();
        return response()->json($services);
    }

    /**
     * Add a new service or product
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'category' => 'required|in:service,product',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
        ]);

        $data = $request->all();
        $data['mitra_id'] = Auth::id();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('services', 'public');
        }

        $service = PartnerService::create($data);

        return response()->json([
            'message' => 'Layanan/Produk berhasil ditambahkan.',
            'service' => $service
        ], 201);
    }

    /**
     * Update an existing service
     */
    public function update(Request $request, PartnerService $catalog)
    {
        if ($catalog->mitra_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'string|max:255',
            'price' => 'numeric|min:0',
            'category' => 'in:service,product',
            'is_available' => 'boolean',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
        ]);

        $data = $request->all();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('services', 'public');
        }

        $catalog->update($data);

        return response()->json([
            'message' => 'Layanan/Produk berhasil diperbarui.',
            'service' => $catalog
        ]);
    }

    /**
     * Delete a service
     */
    public function destroy(PartnerService $catalog)
    {
        if ($catalog->mitra_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $catalog->delete();

        return response()->json(['message' => 'Layanan/Produk berhasil dihapus.']);
    }
}
