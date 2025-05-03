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
            'photo_path' => 'houses/default.png', // imagen genérica
            'owner_id' => rand(1, 10), // fake ID de usuario
            'average_rating' => 0, // se actualizará luego
        ];
    }
}
