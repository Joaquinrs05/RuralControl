<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Routing\Controller;

class UserController extends Controller
{
    // 🔐 Registro
    public function register(Request $request)
    {
        $user = User::create([
            'name'       => $request->name,
            'surname1'   => $request->surname1,
            'surname2'   => $request->surname2,
            'alias'      => $request->alias,
            'birth_date' => $request->birth_date,
            'email'      => $request->email,
            'password'   => Hash::make($request->password),
        ]);

        $token = Auth::login($user);

        return response()->json([
            'token'     => $token,
            'expiresAt' => now()->addMinutes(config('jwt.ttl'))
        ]);
    }

    // 🔑 Login
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (!$token = Auth::attempt($credentials)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return response()->json([
            'token'     => $token,
            'expiresAt' => now()->addMinutes(config('jwt.ttl'))
        ]);
    }

    // 🚪 Logout
    public function logout()
    {
        Auth::logout();
        return response()->json(['message' => 'Logged out successfully']);
    }

    // 👤 Info usuario actual
    public function me()
    {
        return response()->json(Auth::user());
    }

    // ✏️ Actualizar perfil
    public function update(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $user->update($request->all());
        return response()->json($user);
    }

    // 🗑️ Eliminar cuenta
    public function destroy()
    {
          /** @var \App\Models\User $user */
        $user = Auth::user();
        $user->delete();
        return response()->json(['message' => 'User deleted']);
    }
}
