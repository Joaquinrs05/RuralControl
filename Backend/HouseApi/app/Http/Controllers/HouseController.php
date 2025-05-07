<?php

namespace App\Http\Controllers;

use App\Models\House;
use Illuminate\Http\Request;

class HouseController extends Controller
{
    // Mostrar todas las casas
    public function index()
    {
        return House::all();
    }

    // Mostrar una casa específica
    public function show($id)
    {
        $house = House::find($id);

        if (!$house) {
            return response()->json(['message' => 'Casa no encontrada'], 404);
        }

        return $house;
    }

    // Crear una nueva casa
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'required|string',
            'photo_path' => 'nullable|string',
            'owner_id' => 'required|integer',
            'average_rating' => 'nullable|numeric',
        ]);

        $house = House::create($validated);

        return response()->json($house, 201);
    }

    // Actualizar una casa existente
    public function update(Request $request, $id)
    {
        $house = House::find($id);

        if (!$house) {
            return response()->json(['message' => 'Casa no encontrada'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string',
            'description' => 'sometimes|required|string',
            'photo_path' => 'nullable|string',
            'owner_id' => 'sometimes|required|integer',
            'average_rating' => 'nullable|numeric',
        ]);

        $house->update($validated);

        return response()->json($house);
    }

    // Eliminar una casa
    public function destroy($id)
    {
        $house = House::find($id);

        if (!$house) {
            return response()->json(['message' => 'Casa no encontrada'], 404);
        }

        $house->delete();

        return response()->json(['message' => 'Casa eliminada']);
    }
}
