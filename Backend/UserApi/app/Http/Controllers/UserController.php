<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
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




}
