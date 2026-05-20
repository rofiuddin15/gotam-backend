<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('mitra_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('service_category_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['searching', 'heading_to_location', 'repairing', 'completed', 'cancelled'])->default('searching');
            $table->json('geo_location_user'); // {lat, lng, address}
            $table->json('geo_location_mitra')->nullable(); // {lat, lng}
            $table->decimal('final_price', 12, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
