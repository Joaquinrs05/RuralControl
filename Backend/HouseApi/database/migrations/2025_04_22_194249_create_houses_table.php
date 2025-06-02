<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    // TODO en un futuro revisar que el usuario existe y que es admin 
    public function up(): void
    {
        Schema::create('houses', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->text('description');
    $table->string('photo_path')->nullable();
    $table->unsignedBigInteger('owner_id'); // ya no es clave foránea
    $table->float('average_rating')->default(0);
    $table->unsignedBigInteger('visits')->default(0);
    $table->decimal('price_per_night', 8, 2)->default(0);
    $table->timestamps();

    $table->index('owner_id'); // útil para agrupar por propietario
    $table->index('visits');
});
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('houses');
    }
};
