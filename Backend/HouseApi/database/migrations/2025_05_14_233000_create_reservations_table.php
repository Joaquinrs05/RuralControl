<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
       Schema::create('reservations', function (Blueprint $table) {
    $table->id();

    $table->unsignedBigInteger('user_id');

    $table->foreignId('house_id')->constrained('houses')->onDelete('cascade');

    $table->date('start_date');
    $table->date('end_date');

    $table->unsignedInteger('num_people')->nullable(); // nombre en inglés

    $table->enum('status', ['pendiente', 'confirmado', 'cancelado'])->default('pendiente');

    $table->decimal('total_price', 8, 2)->default(0);

    $table->timestamps();

    $table->index('user_id');
    $table->index('house_id');
    $table->index('created_at');
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
