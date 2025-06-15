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
        Schema::create('houses', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->text('description');
    $table->string('photo_path')->nullable();
    $table->unsignedBigInteger('owner_id');
    $table->string('address');
    $table->decimal('latitude', 10, 8);
    $table->decimal('longitude', 11, 8);
    $table->unsignedBigInteger('visits')->default(0);
    $table->string('province');
    $table->decimal('price_per_night', 8, 2)->default(0);
    $table->timestamps();

    $table->index('owner_id');
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
