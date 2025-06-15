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


    public function store(Request $request){
    $validated = $request->validate([
        'user_id' => 'required|integer',
        'house_id' => 'required|exists:houses,id',
        'start_date' => 'required|date',
        'end_date' => 'required|date|after_or_equal:start_date',
        'num_people' => 'required|integer|min:1',
    ]);

        $existingReservation = Reservation::where('house_id', $validated['house_id'])
            ->where(function ($query) use ($validated) {
                $query->Where(function ($q) use ($validated) {
                    $q->where('start_date', '>=', $validated['start_date'])
                        ->where('end_date', '<=', $validated['end_date']);
                });
            })
            ->first();

        if ($existingReservation) {
            return response()->json([
                'message' => 'La casa ya está reservada en esas fechas',
                'errors' => [
                    'start_date' => ['La casa ya está ocupada del ' . $existingReservation->start_date . ' al ' . $existingReservation->end_date],
                    'end_date' => ['La casa ya está ocupada del ' . $existingReservation->start_date . ' al ' . $existingReservation->end_date]
                ],
                'conflicting_reservation' => [
                    'id' => $existingReservation->id,
                    'start_date' => $existingReservation->start_date,
                    'end_date' => $existingReservation->end_date,
                    'status' => $existingReservation->status
                ]
            ], 422);
        }

    // Validar que el usuario existe en la API externa
    /* $userApiUrl = "http://127.0.0.1:8000/api/users/{$validated['user_id']}"*/;  //Esto es cuando estoy en local
    $userApiUrl = "http://user-api:8000/api/users/{$validated['user_id']}"; //Esto cuando estoy en Docker

    $response = \Illuminate\Support\Facades\Http::get($userApiUrl);

    if ($response->status() !== 200) {
        return response()->json([
            'message' => 'El usuario no existe en UserApi',
            'errors' => ['user_id' => ['El usuario no existe en UserApi']]
        ], 422);
    }

    // Obtener el precio de la casa desde la base de datos
    $house = House::findOrFail($validated['house_id']);
    $pricePerNight = $house->price_per_night;

    // Calcular número de noches
    $start = new \Carbon\Carbon($validated['start_date']);
    $end = new \Carbon\Carbon($validated['end_date']);
    $nights = $start->diffInDays($end);

    // Calcular precio total
    $totalPrice = $nights * $pricePerNight * $validated['num_people'];

    // Crear reserva
    $reservation = Reservation::create([
        ...$validated,
        'total_price' => $totalPrice,
        'status' => 'confirmado',
    ]);

    return response()->json($reservation, 201);
}
}
