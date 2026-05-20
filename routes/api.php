<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\StatsController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PartnerVerificationController;
use App\Http\Controllers\Api\WithdrawalController;
use App\Http\Controllers\Api\PartnerServiceController;
use App\Http\Controllers\Api\ServiceCategoryController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\ActivityLogController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Booking Routes
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings/active', [BookingController::class, 'activeBooking']);
    Route::post('/bookings/{booking}/cancel', [BookingController::class, 'cancel']);
    Route::post('/bookings/{booking}/accept', [BookingController::class, 'accept']);
    Route::post('/bookings/{booking}/arrived', [BookingController::class, 'arrived']);
    Route::post('/bookings/{booking}/start-repair', [BookingController::class, 'startRepair']);
    Route::post('/bookings/{booking}/complete', [BookingController::class, 'complete']);
    Route::get('/bookings/{booking}/timeline', [BookingController::class, 'timeline']);

    // Partner Routes
    Route::post('/partner/location', [\App\Http\Controllers\Api\PartnerController::class, 'updateLocation']);
    Route::post('/partner/withdrawals', [WithdrawalController::class, 'store']);
    Route::get('/partner/withdrawals', [WithdrawalController::class, 'history']);
    Route::apiResource('/partner/catalog', PartnerServiceController::class);

    // Admin Routes
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/stats', [StatsController::class, 'dashboardStats']);
        Route::get('/admin/monitoring', [StatsController::class, 'liveMonitoring']);

        // User Management
        Route::get('/admin/users', [UserController::class, 'index']);

        // Partner Verification
        Route::get('/admin/partners/pending', [PartnerVerificationController::class, 'index']);
        Route::post('/admin/partners/{user}/verify', [PartnerVerificationController::class, 'verify']);

        // Withdrawal Management
        Route::get('/admin/withdrawals/pending', [WithdrawalController::class, 'pending']);
        Route::post('/admin/withdrawals/{withdrawal}/approve', [WithdrawalController::class, 'approve']);

        // Global Service Categories
        Route::apiResource('/admin/service-categories', ServiceCategoryController::class);

        // RBAC Management
        Route::get('/admin/roles', [RoleController::class, 'index']);
        Route::get('/admin/permissions', [RoleController::class, 'permissions']);
        Route::post('/admin/roles', [RoleController::class, 'store']);
        Route::put('/admin/roles/{role}', [RoleController::class, 'update']);
        Route::delete('/admin/roles/{role}', [RoleController::class, 'destroy']);

        // Audit Trails
        Route::get('/admin/logs', [ActivityLogController::class, 'index']);
    });
});
