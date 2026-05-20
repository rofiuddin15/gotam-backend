<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $logs = ActivityLog::with('user')
            ->when($request->module, function($q) use ($request) {
                $q->where('module', $request->module);
            })
            ->latest()
            ->paginate(20);

        return response()->json($logs);
    }
}
