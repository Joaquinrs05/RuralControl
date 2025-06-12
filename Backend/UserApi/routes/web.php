<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use Illuminate\Http\Middleware\HandleCors;

//Otras rutas

// RUTAS PROTEGIDAS (necesitas JWT válido)
Route::middleware(['auth:api', HandleCors::class])->group(function () {
    Route::get('profile', [UserController::class, 'profile']);
    Route::post('/logout', [UserController::class, 'logout']);
    Route::put('/user', [UserController::class, 'update']);
    Route::delete('/user', [UserController::class, 'destroy']);
});
