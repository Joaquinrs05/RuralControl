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
    // 🔐 Registro
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
        ]);

        $user = User::create([
            'name'       => $request->name,
            'surname1'   => $request->surname1,
            'surname2'   => $request->surname2,
            'alias'      => $request->alias,
            'birth_date' => $request->birth_date,
            'email'      => $request->email,
            'password'   => Hash::make($request->password),
        ]);

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'token'     => $token,
            'expiresAt' => now()->addMinutes(config('jwt.ttl'))->toDateTimeString(),
            'user' => $user,
        ], 201);
    }

    // 🔑 Login
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return response()->json([
            'token'     => $token,
            'expiresAt' => now()->addMinutes(config('jwt.ttl'))->toDateTimeString(),
            'user' => Auth::user(),
        ]);
    }

    // 🚪 Logout
    public function logout()
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
            return response()->json(['message' => 'Logged out successfully']);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Failed to logout, token not valid'], 500);
        }
    }

    // 👤 Info usuario actual
    public function me()
    {
        return response()->json(Auth::user());
    }

    // ✏️ Actualizar perfil
    public function update(Request $request)
    {
        $user = Auth::user();
        $user->update($request->only([
            'name', 'surname1', 'surname2', 'alias', 'birth_date', 'email'
        ]));

        return response()->json($user);
    }

    // 🗑️ Eliminar cuenta
    public function destroy()
    {
        $user = Auth::user();
        $user->delete();
        JWTAuth::invalidate(JWTAuth::getToken());
        return response()->json(['message' => 'User deleted']);
    }
}
