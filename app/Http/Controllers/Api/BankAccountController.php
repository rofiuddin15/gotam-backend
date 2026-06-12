<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BankAccountController extends Controller
{
    /**
     * Display a listing of the partner's bank accounts.
     */
    public function index(Request $request)
    {
        $accounts = Auth::user()->bankAccounts()->latest()->get();
        return response()->json($accounts);
    }

    /**
     * Store a newly created bank account in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'bank_name' => 'required|string|max:255',
            'account_number' => 'required|string|max:255',
            'account_name' => 'required|string|max:255',
        ]);

        $account = Auth::user()->bankAccounts()->create([
            'bank_name' => $request->bank_name,
            'account_number' => $request->account_number,
            'account_name' => $request->account_name,
        ]);

        return response()->json([
            'message' => 'Rekening / E-Wallet berhasil ditambahkan.',
            'bank_account' => $account
        ], 201);
    }

    /**
     * Remove the specified bank account from storage.
     */
    public function destroy(BankAccount $bankAccount)
    {
        if ($bankAccount->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $bankAccount->delete();

        return response()->json([
            'message' => 'Rekening / E-Wallet berhasil dihapus.'
        ]);
    }
}
