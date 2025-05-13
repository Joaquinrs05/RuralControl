<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HouseController;

Route::get('houses', [HouseController::class, 'index']);
Route::post('houses', [HouseController::class, 'store']);
Route::get('houses/{house}', [HouseController::class, 'show']);
Route::put('houses/{house}', [HouseController::class, 'update']);
Route::delete('houses/{house}', [HouseController::class, 'destroy']);

