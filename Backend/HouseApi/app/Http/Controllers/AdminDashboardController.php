<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\House;
use App\Models\Reservation;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    /**
     * Obtener estadísticas generales del administrador
     */
    public function getAdminStats($adminId)
    {
        try {
            // Obtener casas del administrador (usando owner_id según tu modelo)
            $adminHouses = House::where('owner_id', $adminId)->pluck('id');

            // Número total de reservas
            $totalReservations = Reservation::whereIn('house_id', $adminHouses)->count();

            // Número total de personas (sumando num_people de todas las reservas)
            $totalGuests = Reservation::whereIn('house_id', $adminHouses)->sum('num_people');

            // Reservas activas (futuras o en curso - usando end_date)
            $activeReservations = Reservation::whereIn('house_id', $adminHouses)
                ->where('start_date', '>=', Carbon::now())
                ->count();

            // Reservas confirmadas (usando status)
            $confirmedReservations = Reservation::whereIn('house_id', $adminHouses)
                ->where('status', 'confirmada')
                ->count();

            // Número de casas del administrador
            $totalHouses = $adminHouses->count();

            //Total ganado en los 30 dias
            $TotalAmmount = Carbon::now()->subDays(30);

            $totalEarned = Reservation::whereIn('house_id', $adminHouses)
                ->where('created_at', '>=', $TotalAmmount)
                ->sum('total_price');
            // Tasa de ocupación promedio (últimos 30 días)
            $occupancyRate = $this->calculateOccupancyRate($adminHouses);

            return response()->json([
                'success' => true,
                'data' => [
                    'total_reservations' => $totalReservations,
                    'total_guests' => $totalGuests,
                    'active_reservations' => $activeReservations,
                    'confirmed_reservations' => $confirmedReservations,
                    'total_houses' => $totalHouses,
                    'average_rating' => round($averageRating ?? 0, 2),
                    'occupancy_rate' => $occupancyRate,
                    'TotalEarned' => $totalEarned,

                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener datos para gráfico de reservas por mes
     */
    public function getReservationsByMonth($adminId)
    {
        try {
            $adminHouses = House::where('owner_id', $adminId)->pluck('id');

            $reservationsByMonth = Reservation::whereIn('house_id', $adminHouses)
                ->selectRaw('MONTH(created_at) as month, YEAR(created_at) as year, COUNT(*) as total_reservations, SUM(num_people) as total_guests')
                ->where('created_at', '>=', Carbon::now()->subMonths(6))
                ->groupBy('year', 'month')
                ->orderBy('year', 'desc')
                ->orderBy('month', 'desc')
                ->get()
                ->map(function ($item) {
                    return [
                        'month' => Carbon::createFromDate($item->year, $item->month, 1)->format('M Y'),
                        'reservations' => $item->total_reservations,
                        'guests' => $item->total_guests
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $reservationsByMonth
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener datos por mes: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calcular tasa de ocupación
     */
    private function calculateOccupancyRate($houseIds)
    {
        if ($houseIds->isEmpty()) {
            return 0;
        }

        $totalDays = 30; // Últimos 30 días
        $startDate = Carbon::now()->subDays($totalDays);
        $endDate = Carbon::now();

        // Días ocupados en el periodo (usando start_date y end_date)
        $occupiedDays = Reservation::whereIn('house_id', $houseIds)
            ->where(function ($query) use ($startDate, $endDate) {
                $query->whereBetween('start_date', [$startDate, $endDate])
                      ->orWhereBetween('end_date', [$startDate, $endDate])
                      ->orWhere(function ($subQuery) use ($startDate, $endDate) {
                          $subQuery->where('start_date', '<=', $startDate)
                                   ->where('end_date', '>=', $endDate);
                      });
            })
            ->sum(DB::raw('DATEDIFF(LEAST(end_date, "' . $endDate . '"), GREATEST(start_date, "' . $startDate . '"))'));

        $totalPossibleDays = $houseIds->count() * $totalDays;

        return $totalPossibleDays > 0 ? round(($occupiedDays / $totalPossibleDays) * 100, 2) : 0;
    }



}
