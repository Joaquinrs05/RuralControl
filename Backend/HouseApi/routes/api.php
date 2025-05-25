<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HouseController;
use App\Http\Controllers\ReservationController;
use Illuminate\Http\Middleware\HandleCors;

Route::get('houses', [HouseController::class, 'index']);
//TODO Revisar el post porque no se porque pero no me funciona, me dice que no se puede insertar una casa
Route::post('houses', [HouseController::class, 'store']);
Route::get('houses/{house}', [HouseController::class, 'show']);
Route::put('houses/{house}', [HouseController::class, 'update']);
Route::delete('houses/{house}', [HouseController::class, 'destroy']);

Route::middleware([HandleCors::class])->group(function () {
    Route::post('reservations', [ReservationController::class, 'store']);
});