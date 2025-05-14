<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
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
