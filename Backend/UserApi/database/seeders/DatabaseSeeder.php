<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // Crear un usuario administrador
        User::create([
            'name' => 'Admin',
            'surname1' => 'Sistema',
            'surname2' => 'prueba',
            'alias' => 'admin',
            'birth_date' => '1990-01-01',
            'email' => 'admin@example.com',
            'email_verified_at' => now(),
            'password' => Hash::make('admin123'),
        ]);

        // Crear un usuario de prueba
        User::create([
            'name' => 'Usuario',
            'surname1' => 'Prueba',
            'surname2' => 'Demo',
            'alias' => 'usuario_prueba',
            'birth_date' => '1995-05-15',
            'email' => 'usuario@example.com',
            'email_verified_at' => now(),
            'password' => Hash::make('usuario123'),
        ]);

        // Crear usuarios aleatorios utilizando el factory
        User::factory()->count(20)->create();
    }
}
