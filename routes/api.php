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
use App\Http\Controllers\Api\WalletController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\BankAccountController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/me', [AuthController::class, 'updateMe']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/service-categories', [ServiceCategoryController::class, 'index']);

    // Booking Routes
    Route::get('/bookings', [BookingController::class, 'index']);
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
    Route::post('/partner/status', [\App\Http\Controllers\Api\PartnerController::class, 'updateStatus']);
    Route::post('/partner/withdrawals', [WithdrawalController::class, 'store']);
    Route::get('/partner/withdrawals', [WithdrawalController::class, 'history']);
    Route::apiResource('/partner/catalog', PartnerServiceController::class);
    Route::apiResource('/partner/bank-accounts', BankAccountController::class);

    // Wallet Routes
    Route::post('/wallet/topup', [WalletController::class, 'topup']);
    Route::get('/wallet/balance', [WalletController::class, 'balance']);
    Route::post('/wallet/withdraw', [WithdrawalController::class, 'store']);

    // Admin Routes
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/stats', [StatsController::class, 'dashboardStats']);
        Route::get('/admin/monitoring', [StatsController::class, 'liveMonitoring']);

        // User Management
        Route::get('/admin/users', [UserController::class, 'index']);
        Route::get('/admin/users/{user}', [UserController::class, 'show']);

        // Partner Verification
        Route::get('/admin/partners/pending', [PartnerVerificationController::class, 'index']);
        Route::post('/admin/partners/{user}/verify', [PartnerVerificationController::class, 'verify']);

        // Withdrawal Management
        Route::get('/admin/withdrawals/pending', [WithdrawalController::class, 'pending']);
        Route::post('/admin/withdrawals/{withdrawal}/approve', [WithdrawalController::class, 'approve']);
        Route::post('/admin/withdrawals/{withdrawal}/reject', [WithdrawalController::class, 'reject']);

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

        // Reports Management
        Route::get('/admin/reports/financial', [ReportController::class, 'financialReport']);
        Route::get('/admin/reports/users', [ReportController::class, 'userReport']);
        Route::get('/admin/reports/cash-flow', [ReportController::class, 'cashFlow']);
        Route::get('/admin/reports/withdrawals', [ReportController::class, 'withdrawalsReport']);
    });
});
