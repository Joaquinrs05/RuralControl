<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'surname1' => 'nullable|string|max:255',
            'surname2' => 'nullable|string|max:255',
            'alias' => '|string|max:255|unique:users,alias',
            'birth_date' => '|date',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:6|confirmed', // password_confirmation
            'type' => '|string|in:admin,user', // admin o user
        ]);

        $user = User::create([
            'name' => $request->name,
            'surname1' => $request->surname1,
            'surname2' => $request->surname2,
            'alias' => $request->alias,
            'birth_date' => $request->birth_date,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'type' => $request->type,
        ]);

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'message' => 'Usuario registrado correctamente',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    // Login de usuario
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json(['error' => 'Credenciales inválidas'], 401);
        }

        return response()->json([
            'message' => 'Login exitoso',
            'token' => $token, // 🔥 Aquí antes devolvías solo true, ahora el JWT real
            'expiresAt' => now()->addMinutes(JWTAuth::factory()->getTTL())->toDateTimeString()
        ]);
    }

    // Logout del usuario
    public function logout()
    {
        JWTAuth::invalidate(JWTAuth::getToken());

        return response()->json([
            'message' => 'Logout exitoso',
        ]);
    }

    // Refrescar el token (opcional pero útil)
    public function refresh()
    {
        $newToken = JWTAuth::refresh(JWTAuth::getToken());

        return response()->json([
            'message' => 'Token refrescado',
            'token' => $newToken,
        ]);
    }

    // Obtener perfil del usuario autenticado
    public function profile()
    {
        return response()->json([
            'user' => auth()->user(),
        ]);
    }
}
