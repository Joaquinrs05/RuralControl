<?php

namespace Database\Factories;

use App\Models\House;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Model>
 */
class HouseFactory extends Factory
{
    protected $model = House::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->company . ' Rural House',
            'description' => $this->faker->paragraph,
            'photo_path' => 'houses/mqCNPn1F7R945aQSSSiV4DCNuU4PX9t3f0sVgl8k.jpg', // imagen genérica
            'owner_id' => "1", // fake ID de usuario
            'average_rating' => 0, // se actualizará luego
        ];
    }
}
