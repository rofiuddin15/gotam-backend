<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('partner_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mitra_id')->constrained('users')->onDelete('cascade');
            $table->string('name'); // e.g. Ganti Oli, Ban Dalam FDR 80/90
            $table->text('description')->nullable();
            $table->decimal('price', 15, 2);
            $table->enum('category', ['service', 'product'])->default('service');
            $table->boolean('is_available')->default(true);
            $table->string('image')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('partner_services');
    }
};
