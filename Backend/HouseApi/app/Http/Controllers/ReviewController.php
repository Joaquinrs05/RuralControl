<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\House;
use App\Models\Reservation;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Display a listing of the reviews for a specific house.
     */
    public function index($houseId)
    {
        $house = House::find($houseId);
        if (!$house) {
            return response()->json(['message' => 'House not found'], 404);
        }

        // Return latest reviews for this house
        $reviews = Review::where('house_id', $houseId)->latest()->get();
        return response()->json($reviews);
    }

    /**
     * Store a newly created review in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|integer',
            'house_id' => 'required|exists:houses,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string'
        ]);

        // Verificar si el usuario ha completado alguna reserva para esta casa (end_date pasada o terminando hoy)
        $hasStayed = Reservation::where('user_id', $validated['user_id'])
            ->where('house_id', $validated['house_id'])
            ->where('start_date', '<=', now()) // At least started the stay
            ->exists();

        if (!$hasStayed) {
            return response()->json([
                'message' => 'Solo puedes reseñar una casa en la que hayas reservado.'
            ], 403);
        }

        // Prevent multiple reviews from same user for the same house (optional generic rule)
        $existingReview = Review::where('user_id', $validated['user_id'])
            ->where('house_id', $validated['house_id'])
            ->exists();

        if ($existingReview) {
            return response()->json([
                'message' => 'Ya has enviado una reseña para esta casa.'
            ], 403);
        }

        $review = Review::create($validated);

        return response()->json($review, 201);
    }
}
