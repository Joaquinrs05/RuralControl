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
        $locations = [
            // Cuevas de San Marcos
            ['lat' => 37.2891, 'lng' => -4.4239, 'address' => 'Cam. de Las Pilas, 16, 29210 Cuevas de San Marcos, Málaga', 'province' => 'Malaga'],
            // Antequera
            ['lat' => 37.0197, 'lng' => -4.5597, 'address' => 'Calle Infante Don Fernando, 29200 Antequera, Málaga', 'province' => 'Malaga'],
            // Ronda
            ['lat' => 36.7426, 'lng' => -5.1675, 'address' => 'Calle Espíritu Santo, 29400 Ronda, Málaga', 'province' => 'Malaga'],
            // Nerja
            ['lat' => 36.7574, 'lng' => -3.8747, 'address' => 'Calle Maravillas, 29780 Nerja, Málaga', 'province' => 'Malaga'],
            // Mijas
            ['lat' => 36.5968, 'lng' => -4.6376, 'address' => 'Calle San Sebastián, 29650 Mijas, Málaga', 'province' => 'Malaga'],
            // Casares
            ['lat' => 36.4445, 'lng' => -5.2718, 'address' => 'Calle Villa, 29690 Casares, Málaga', 'province' => 'Malaga'],
            // Frigiliana
            ['lat' => 36.7881, 'lng' => -3.8979, 'address' => 'Calle Real, 29788 Frigiliana, Málaga', 'province' => 'Malaga'],
        ];
        $photo_path=[
            ['url'=> 'houses/mqCNPn1F7R945aQSSSiV4DCNuU4PX9t3f0sVgl8k.jpg'],
            ['url'=> 'houses/YkIxbvAGnBz306RBP4zqqMzSuGdizbfAbEpjNqPz.jpg'],
        ];

        $location = $this->faker->randomElement($locations);
        $photo_path = $this->faker->randomElement($photo_path);


        return [
            'name' => $this->faker->company . ' Rural House',
            'description' => $this->faker->paragraph,
            'photo_path' =>$photo_path['url'],
            'owner_id' => "1", // fake ID de usuario

            'price_per_night' => rand(10,50),
            'address' => $location['address'],
            'latitude' => $location['lat'],
            'longitude' => $location['lng'],
            'province'  => $location['province'],
        ];
    }
}
