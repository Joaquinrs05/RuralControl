import { Component, OnInit, OnDestroy } from '@angular/core';
import { AdminDashboardService } from '../admin.service';
import { NbCardModule, NbSpinnerModule, NbThemeService } from '@nebular/theme';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ReservationsByMonthItem } from '../../../shared/interfaces/reservation.interface';
import { AdminStats } from '../../../shared/interfaces/adminStats.interface';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule, NbCardModule, NbSpinnerModule],
  selector: 'ngx-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  adminId = 1; // O como obtengas el adminId dinámicamente

  stats: AdminStats | null = null;
  reservationsByMonth: ReservationsByMonthItem[] = [];

  loadingStats = true;
  loadingReservations = true;

  themeVariables: any;

  reservationsChartOptions: any = {};
  occupancyChartOptions: any = {};

  constructor(
    private adminDashboardService: AdminDashboardService,
    private theme: NbThemeService
  ) {}

  ngOnInit(): void {
    this.theme
      .getJsTheme()
      .pipe(takeUntil(this.destroy$))
      .subscribe((theme) => {
        this.themeVariables = theme.variables;
        this.loadData();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    forkJoin({
      statsResponse: this.adminDashboardService.getAdminStats(this.adminId),
      reservationsResponse: this.adminDashboardService.getReservationsByMonth(
        this.adminId
      ),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ statsResponse, reservationsResponse }) => {
          if (statsResponse.success) {
            this.stats = statsResponse.data;
            this.loadingStats = false;
            this.setupOccupancyChart();
          }
          if (reservationsResponse.success) {
            this.reservationsByMonth = reservationsResponse.data;
            this.loadingReservations = false;
            this.setupReservationsChart();
          }
        },
        error: (err) => {
          console.error('Error loading dashboard data:', err);
          this.loadingStats = false;
          this.loadingReservations = false;
        },
      });
  }

  setupReservationsChart(): void {
    if (!this.reservationsByMonth || this.reservationsByMonth.length === 0)
      return;

    this.reservationsChartOptions = {
      backgroundColor: this.themeVariables.bg,
      color: [this.themeVariables.primary],
      tooltip: {
        trigger: 'axis',
      },
      xAxis: {
        type: 'category',
        data: this.reservationsByMonth.map((item) => item.month),
        axisLine: {
          lineStyle: { color: this.themeVariables.separator },
        },
        axisLabel: {
          color: this.themeVariables.fgText,
        },
      },
      yAxis: {
        type: 'value',
        name: 'Reservas',
        axisLine: {
          lineStyle: { color: this.themeVariables.separator },
        },
        axisLabel: {
          color: this.themeVariables.fgText,
        },
        splitLine: {
          lineStyle: { color: this.themeVariables.separator },
        },
      },
      series: [
        {
          name: 'Reservas',
          type: 'bar',
          data: this.reservationsByMonth.map((item) => item.reservations),
          itemStyle: {
            color: this.themeVariables.primary,
          },
        },
      ],
    };
  }

  setupOccupancyChart(): void {
    if (!this.stats) return;

    this.occupancyChartOptions = {
      backgroundColor: this.themeVariables.bg,
      tooltip: {
        trigger: 'item',
      },
      legend: {
        orient: 'horizontal',
        bottom: 10,
        textStyle: { color: this.themeVariables.fgText },
      },
      series: [
        {
          name: 'Ocupación',
          type: 'pie',
          radius: '50%',
          data: [
            { value: this.stats.occupancy_rate, name: 'Ocupado (%)' },
            { value: 100 - this.stats.occupancy_rate, name: 'Libre (%)' },
          ],
          label: {
            color: this.themeVariables.fgText,
            formatter: '{b}: {d}%',
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
      color: [this.themeVariables.success, this.themeVariables.warning],
    };
  }

  // Métodos para mostrar datos en el template
  get totalReservations(): number {
    return this.stats?.total_reservations ?? 0;
  }

  get totalGuests(): number {
    return this.stats?.total_guests ?? 0;
  }

  get totalHouses(): number {
    return this.stats?.total_houses ?? 0;
  }

  get averageRating(): number {
    return this.stats?.average_rating ?? 0;
  }
}
