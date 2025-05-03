<?php

namespace Database\Seeders;

use App\Models\House;
use App\Models\Rating;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RatingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Rating::factory()->count(50)->create();

        // Calcular y actualizar el promedio de valoraciones por casa
        $houses = House::all();

        foreach ($houses as $house) {
            $avg = Rating::where('rural_house_id', $house->id)->avg('rating');
            $house->average_rating = $avg ?? 0;
            $house->save();
        }
    }
}
