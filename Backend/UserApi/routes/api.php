<?php
use App\Http\Controllers\UserController;
use Illuminate\Http\Middleware\HandleCors;
use Illuminate\Support\Facades\Route;

// RUTAS PÚBLICAS (con CORS explícito)
Route::middleware([HandleCors::class])->group(function () {
    Route::post('auth/register', [UserController::class, 'register']);
    Route::post('auth/login', [UserController::class, 'login']);
});
