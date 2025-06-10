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

            // Rating promedio de las casas del administrador
            /*$averageRating = House::where('owner_id', $adminId)
                ->whereNotNull('average_rating')
                ->avg('average_rating');*/

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
                    'occupancy_rate' => $occupancyRate
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
     * Obtener casas más populares del administrador
     */
    public function getTopHouses($adminId)
    {
        try {
            $topHouses = House::where('owner_id', $adminId)
                ->withCount('reservations')
                ->with(['reservations' => function($query) {
                    $query->select('house_id', DB::raw('SUM(num_people) as total_guests'))
                          ->groupBy('house_id');
                }])
                ->orderBy('reservations_count', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($house) {
                    $totalGuests = $house->reservations->sum('total_guests') ?? 0;
                    return [
                        'id' => $house->id,
                        'name' => $house->name,
                        'reservations_count' => $house->reservations_count,
                        'total_guests' => $totalGuests,
                        /*'average_rating' => $house->average_rating ?? 0,*/
                        'photo_path' => $house->photo_path
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $topHouses
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener casas populares: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener reservas recientes
     */
    public function getRecentReservations($adminId, $limit = 10)
    {
        try {
            $adminHouses = House::where('owner_id', $adminId)->pluck('id');

            $recentReservations = Reservation::whereIn('house_id', $adminHouses)
                ->with(['house:id,name,photo_path', 'user:id,name,email'])
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get()
                ->map(function ($reservation) {
                    return [
                        'id' => $reservation->id,
                        'house_name' => $reservation->house->name,
                        'house_photo' => $reservation->house->photo_path,
                        'guest_name' => $reservation->user->name ?? 'N/A',
                        'guest_email' => $reservation->user->email ?? 'N/A',
                        'start_date' => $reservation->start_date,
                        'end_date' => $reservation->end_date,
                        'num_people' => $reservation->num_people,
                        'status' => $reservation->status,
                        'created_at' => $reservation->created_at->format('d/m/Y H:i')
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $recentReservations
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener reservas recientes: ' . $e->getMessage()
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
            ->where('status', '!=', 'cancelada') // Excluir reservas canceladas
            ->sum(DB::raw('DATEDIFF(LEAST(end_date, "' . $endDate . '"), GREATEST(start_date, "' . $startDate . '"))'));

        $totalPossibleDays = $houseIds->count() * $totalDays;

        return $totalPossibleDays > 0 ? round(($occupiedDays / $totalPossibleDays) * 100, 2) : 0;
    }
}

function getHouseOccupancy($adminId, $houseId)
{
    try {
        // Verificar que la casa pertenece al admin
        $house = House::where('owner_id', $adminId)->findOrFail($houseId);

        // Obtener reservas de los próximos 3 meses
        $reservations = Reservation::where('house_id', $houseId)
            ->where('end_date', '>=', now())
            ->where('start_date', '<=', now()->addMonths(3))
            ->where('status', '!=', 'cancelada')
            ->select('start_date', 'end_date', 'status', 'num_people')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'house' => $house,
                'reservations' => $reservations
            ]
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error al obtener ocupación: ' . $e->getMessage()
        ], 500);
    }
}

/**
 * Obtener estadísticas por status de reserva
 */
function getReservationsByStatus($adminId)
{
    try {
        $adminHouses = House::where('owner_id', $adminId)->pluck('id');

        $reservationsByStatus = Reservation::whereIn('house_id', $adminHouses)
            ->selectRaw('status, COUNT(*) as count, SUM(num_people) as total_guests')
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                return [
                    'status' => $item->status,
                    'count' => $item->count,
                    'total_guests' => $item->total_guests
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $reservationsByStatus
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error al obtener reservas por status: ' . $e->getMessage()
        ], 500);
    }
}

/**
 * Obtener estadísticas de huéspedes
 */
function getGuestStats($adminId)
{
    try {
        $adminHouses = House::where('owner_id', $adminId)->pluck('id');

        // Huéspedes únicos
        $uniqueGuests = Reservation::whereIn('house_id', $adminHouses)
            ->distinct('user_id')
            ->whereNotNull('user_id')
            ->count();

        // Huéspedes recurrentes
        $recurringGuests = Reservation::whereIn('house_id', $adminHouses)
            ->whereNotNull('user_id')
            ->select('user_id')
            ->groupBy('user_id')
            ->havingRaw('COUNT(*) > 1')
            ->count();

        // Promedio de huéspedes por reserva
        $avgGuestsPerReservation = Reservation::whereIn('house_id', $adminHouses)
            ->avg('num_people');

        // Distribución por número de personas
        $guestDistribution = Reservation::whereIn('house_id', $adminHouses)
            ->selectRaw('num_people, COUNT(*) as count')
            ->groupBy('num_people')
            ->orderBy('num_people')
            ->get()
            ->map(function ($item) {
                return [
                    'guests' => $item->num_people,
                    'reservations' => $item->count
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'unique_guests' => $uniqueGuests,
                'recurring_guests' => $recurringGuests,
                'avg_guests_per_reservation' => round($avgGuestsPerReservation, 1),
                'guest_distribution' => $guestDistribution
            ]
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error al obtener estadísticas de huéspedes: ' . $e->getMessage()
        ], 500);
    }
}

/**
 * Obtener reservas por periodo de tiempo
 */
function getReservationTrends($adminId)
{
    try {
        $adminHouses = House::where('owner_id', $adminId)->pluck('id');

        // Reservas por día de la semana
        $reservationsByWeekday = Reservation::whereIn('house_id', $adminHouses)
            ->selectRaw('DAYOFWEEK(start_date) as weekday, COUNT(*) as count')
            ->groupBy('weekday')
            ->get()
            ->map(function ($item) {
                $days = ['', 'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                return [
                    'weekday' => $days[$item->weekday],
                    'count' => $item->count
                ];
            });

        // Duración promedio de estancias
        $avgStayDuration = Reservation::whereIn('house_id', $adminHouses)
            ->selectRaw('AVG(DATEDIFF(end_date, start_date)) as avg_duration')
            ->first()
            ->avg_duration;

        return response()->json([
            'success' => true,
            'data' => [
                'reservations_by_weekday' => $reservationsByWeekday,
                'avg_stay_duration' => round($avgStayDuration ?? 0, 1)
            ]
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error al obtener tendencias: ' . $e->getMessage()
        ], 500);
    }
}
