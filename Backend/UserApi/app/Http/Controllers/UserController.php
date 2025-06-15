<?php

namespace App\Http\Controllers;

use App\Models\Logo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class UserController extends Controller
{
    public function profile()
    {
        return response()->json(Auth::user());
    }

    //FIXME Revisar el show y profile porque creo que realmente los dos hacen lo mismo
    // Obtener usuario por ID (nuevo método)
    public function show($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['error' => 'Usuario no encontrado'], 404);
        }
        return response()->json($user);
    }

    public function update(Request $request)
    {
        $user = Auth::user();
        $user->fill($request->only([
            'name', 'surname1', 'surname2', 'alias', 'birth_date', 'email'
        ]));
        $user->save();

        return response()->json($user);
    }

    public function destroy()
    {
        $user = Auth::user();
        $user->delete();
        JWTAuth::invalidate(JWTAuth::getToken());
        return response()->json(['message' => 'User deleted']);
    }


    public function uploadLogo(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'logo' => 'required|image|max:2048', // Máx 2MB
        ]);

        // Guardar el archivo
        $path = $request->file('logo')->store('logos', 'public');

        // Borrar logo anterior (opcional)
        $existingLogo = Logo::first();
        if ($existingLogo) {
            Storage::disk('public')->delete($existingLogo->url_photo);
            $existingLogo->delete();
        }

        // Crear nuevo logo
        $logo = Logo::create([
            'url_photo' => $path,
        ]);

        return response()->json([
            'message' => 'Logo subido correctamente',
            'url' => Storage::url($path)
        ]);
    }

    public function getLogo()
    {
        $logo = Logo::latest()->first(); // Obtener el logo más reciente

        if (!$logo) {
            return response()->json(['error' => 'No hay logo disponible'], 404);
        }

        return response()->json([
            'url' => asset('storage/' . $logo->url_photo),
        ]);
    }

}
