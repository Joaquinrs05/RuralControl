<?php

namespace Database\Factories;

use App\Models\Rating;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Model>
 */
class RatingFactory extends Factory
{
    protected $model = Rating::class;

    public function definition(): array
    {
        return [
            'user_id' => rand(1, 20), // fake
            'rural_house_id' => rand(1, 10), // asumimos que hay 10 casas
            'rating' => rand(1, 5),
        ];
    }
}
