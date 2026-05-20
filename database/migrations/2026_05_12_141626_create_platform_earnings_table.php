<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('platform_earnings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->onDelete('cascade');
            $table->decimal('total_amount', 15, 2);
            $table->decimal('partner_amount', 15, 2);
            $table->decimal('platform_commission', 15, 2);
            $table->decimal('commission_rate', 5, 2); // e.g. 10.00 (%)
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('platform_earnings');
    }
};
