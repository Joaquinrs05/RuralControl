<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use Illuminate\Http\Request;
use App\Models\House;

class ReservationController extends Controller
{
    // Obtener todas las casas rurales que un usuario ha reservado por su id
    public function getHousesByUser($id)
    {
        $houseIds = Reservation::where('user_id', $id)
            ->pluck('house_id')
            ->unique();

        if ($houseIds->isEmpty()) {
            return response()->json(['message' => 'No se encontraron casas reservadas por este usuario'], 404);
        }

        $houses = House::whereIn('id', $houseIds)->get();

        return response()->json($houses);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|integer',
            'house_id' => 'required|exists:houses,id',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'num_personas' => 'nullable|integer|min:1',
        ]);

        // Validar usuario en UserApi
        $userApiUrl = "http://127.0.0.1:8000/api/users/{$validated['user_id']}";
        $response = \Illuminate\Support\Facades\Http::get($userApiUrl);

        if ($response->status() !== 200) {
            return response()->json([
                'message' => 'El usuario no existe en UserApi',
                'errors' => ['user_id' => ['El usuario no existe en UserApi']]
            ], 422);
        }

        $reservation = Reservation::create($validated);

        return response()->json($reservation, 201);
    }
}
