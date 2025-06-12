<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Middleware\HandleCors;
use Illuminate\Support\Facades\Route;


// RUTAS PÚBLICAS (con CORS explícito)
Route::middleware([HandleCors::class])->group(function () {
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login', [AuthController::class, 'login']);
});

Route::get('/users/{id}', [UserController::class, 'show']);

Route::post('/admin/logo', [UserController::class, 'uploadLogo'])->middleware('auth:api');
