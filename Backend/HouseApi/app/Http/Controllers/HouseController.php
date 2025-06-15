<?php

namespace App\Http\Controllers;

use App\Models\House;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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
        // Validación de los datos
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'required|string',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg', // Validación de la imagen
            'owner_id' => 'required|integer',
            'address'=> 'required|string',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'province' => 'required|string',
            'price_per_night' => 'required|numeric',

        ]);

        // guardamos la imagen
        if ($request->hasFile('photo') && $request->file('photo')->isValid()) {
            // Subir la imagen y obtener la ruta
            $photoPath = $request->file('photo')->store('houses', 'public');
        } else {
            $photoPath = null;
        }


        $house = House::create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'photo_path' => $photoPath,
            'owner_id' => $validated['owner_id'],
            'address' => $validated['address'],
            //Vamos a probar si al poner aqui validated, se sigue guardando bien
            'latitude' => $request->input('latitude'),
            'longitude' => $request->input('longitude'),
            'province' => $validated['province'],
            'price_per_night' => $validated['price_per_night'],
        ]);

        return response()->json($house, 201);
    }

    // Actualizar una casa existente
    public function update(Request $request, $id)
    {
        $house = House::find($id);

        if (!$house) {
            return response()->json(['message' => 'Casa no encontrada'], 404);
        }

        // Validación
        $validated = $request->validate([
            'name' => 'sometimes|required|string',
            'description' => 'sometimes|required|string',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048', // Validación de la imagen
            'owner_id' => 'sometimes|required|integer',
            'city'=> 'required|string',
            'price_per_night' => 'nullable|numeric',
        ]);

        //esto esta medio implementado
        if ($request->hasFile('photo') && $request->file('photo')->isValid()) {
            // Eliminar la imagen anterior si existe
            if ($house->photo_path && Storage::exists('public/' . $house->photo_path)) {
                Storage::delete('public/' . $house->photo_path);
            }


            $photoPath = $request->file('photo')->store('houses', 'public');
        } else {
            $photoPath = $house->photo_path;
        }


        $house->update([
            'name' => $validated['name'] ?? $house->name,
            'description' => $validated['description'] ?? $house->description,
            'photo_path' => $photoPath,  // Guardamos la nueva ruta de la imagen
            'owner_id' => $validated['owner_id'] ?? $house->owner_id,
            'price_per_night' => $validated['price_per_night'] ?? $house->price_per_night,
        ]);

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
