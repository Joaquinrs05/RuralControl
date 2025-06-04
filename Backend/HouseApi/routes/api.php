<?php

use App\Http\Controllers\AdminDashboardController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HouseController;
use App\Http\Controllers\ReservationController;
use Illuminate\Http\Middleware\HandleCors;

Route::get('houses', [HouseController::class, 'index']);
Route::post('houses', [HouseController::class, 'store']);
Route::get('houses/{house}', [HouseController::class, 'show']);
Route::put('houses/{house}', [HouseController::class, 'update']);
Route::delete('houses/{house}', [HouseController::class, 'destroy']);

Route::middleware([HandleCors::class])->group(function () {
    Route::post('reservations', [ReservationController::class, 'store']);
    // Endpoint para obtener casas rurales de un usuario por su id
    Route::get('users/{id}/houses', [ReservationController::class, 'getHousesByUser']);

     // NUEVAS RUTAS PARA DASHBOARD DE ADMINISTRADOR
    // Estadísticas generales del administrador
    Route::get('admin/{adminId}/stats', [AdminDashboardController::class, 'getAdminStats']);
    
    // Reservas por mes para gráficos
    Route::get('admin/{adminId}/reservations-by-month', [AdminDashboardController::class, 'getReservationsByMonth']);
    
    // Casas más populares del administrador
    Route::get('admin/{adminId}/top-houses', [AdminDashboardController::class, 'getTopHouses']);
    
    // Reservas recientes
    Route::get('admin/{adminId}/recent-reservations', [AdminDashboardController::class, 'getRecentReservations']);
});