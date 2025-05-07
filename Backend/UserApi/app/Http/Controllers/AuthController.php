<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    // Registrar un nuevo usuario
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'surname1' => 'nullable|string|max:255',
            'surname2' => 'nullable|string|max:255',
            'alias' => 'nullable|string|max:255|unique:users,alias',
            'birth_date' => 'nullable|date',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'type' => 'required|string|in:admin,user',
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
            'expiresAt' => now()->addMinutes(config('jwt.ttl'))->toDateTimeString(),
        ], 201);
    }

    // Login del usuario
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        try {
            if (!$token = JWTAuth::attempt($credentials)) {
                return response()->json(['error' => 'Credenciales inválidas'], 401);
            }
        } catch (JWTException $e) {
            return response()->json(['error' => 'No se pudo crear el token'], 500);
        }

        return response()->json([
            'message' => 'Login exitoso',
            'token' => $token,
            'expiresAt' => now()->addMinutes(config('jwt.ttl'))->toDateTimeString(),
        ]);
    }

    // Logout del usuario
    public function logout(Request $request)
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
            return response()->json(['message' => 'Logout exitoso']);
        } catch (JWTException $e) {
            return response()->json(['error' => 'No se pudo cerrar la sesión'], 500);
        }
    }

    // Refrescar token
    public function refresh()
    {
        try {
            $newToken = JWTAuth::refresh(JWTAuth::getToken());
            return response()->json([
                'message' => 'Token refrescado',
                'token' => $newToken,
                'expiresAt' => now()->addMinutes(config('jwt.ttl'))->toDateTimeString(),
            ]);
        } catch (JWTException $e) {
            return response()->json(['error' => 'No se pudo refrescar el token'], 500);
        }
    }

    // Perfil del usuario autenticado
    public function profile()
    {
        return response()->json([
            'user' => Auth::user(),
        ]);
    }
}
