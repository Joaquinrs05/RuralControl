<?php

use App\Http\Controllers\AdminDashboardController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HouseController;
use App\Http\Controllers\ReservationController;
use Illuminate\Http\Middleware\HandleCors;

Route::middleware([HandleCors::class])->group(function () {
    // Houses
    Route::get('houses', [HouseController::class, 'index']);
    Route::post('houses', [HouseController::class, 'store']);
    Route::get('houses/{house}', [HouseController::class, 'show']);
    Route::put('houses/{house}', [HouseController::class, 'update']);
    Route::delete('houses/{house}', [HouseController::class, 'destroy']);

    // Reservations
    Route::post('reservations', [ReservationController::class, 'store']);
    Route::get('users/{id}/houses', [ReservationController::class, 'getHousesByUser']);

    // Admin Dashboard
    Route::get('admin/{adminId}/stats', [AdminDashboardController::class, 'getAdminStats']);
    Route::get('admin/{adminId}/reservations-by-month', [AdminDashboardController::class, 'getReservationsByMonth']);
});
