import { Component, computed, effect, inject, signal } from '@angular/core';

import { HouseCardComponent } from '../house-card/house-card.component';
import { HouseService } from '../houses.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HouseFormComponent } from '../house-form/house-form.component';
import { UserService } from '../../user/profile/user.service';
import { AuthService } from '../../../Auth/services/auth.service';
import { User } from '../../../shared/models/user.model';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { HouseImagePipe } from '../../../shared/pipes/house-image.pipe';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ReviewService } from '../review.service';
import { Review } from '../../../shared/models/review.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-house-detail',
  imports: [RouterLink, HouseFormComponent, CommonModule, HouseImagePipe, ReactiveFormsModule],
  templateUrl: './house-detail.component.html',
})
export class HouseDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  showRentalForm = false;

  id = computed(() => Number(this.route.snapshot.paramMap.get('id')));
  readonly #houseService = inject(HouseService);
  readonly #userService = inject(UserService);
  readonly #authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);
  readonly #reviewService = inject(ReviewService);

  houseReviews = signal<Review[]>([]);
  reviewForm: FormGroup;

  readonly #houseResource = rxResource({
    request: () => this.id(),
    loader: () => this.#houseService.getHouseById(this.id()),
  });

  house = computed(
    () => this.#houseResource.value() ?? this.#houseService.defaulHouse
  );

  // Usuario actual
  private userVacio: User = {
    id: 0,
    name: '',
    surname1: '',
    surname2: '',
    alias: '',
    birth_date: '',
    email: '',
    password: '',
    created_at: '',
    updated_at: '',
  };

  usuarioActual = computed(() => this.#authService.currentUser() ?? this.userVacio);

  private map: L.Map | null = null;

  constructor() {
    this.reviewForm = this.formBuilder.group({
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['']
    });

    effect(() => {
      const houseId = this.id();
      if (houseId) {
        this.#reviewService.getReviews(houseId).subscribe(reviews => {
          this.houseReviews.set(reviews);

          // Cargar los nombres de usuario asíncronamente desde el microservicio UserApi
          reviews.forEach((review) => {
            this.#userService.getUserById(review.user_id).subscribe((user: User | undefined) => {
              if (user) {
                this.houseReviews.update(curr => {
                  const updated = [...curr];
                  const idx = updated.findIndex(r => r.id === review.id);
                  if (idx !== -1) {
                    const fullName = user.name + (user.surname1 ? ' ' + user.surname1 : '');
                    updated[idx] = { ...updated[idx], userName: fullName };
                  }
                  return updated;
                });
              }
            });
          });

        });
      }
    });

    // Mostrar mapa cuando haya coordenadas
    effect(() => {
      const h = this.house();

      if (h.latitude && h.longitude && !this.map) {
        const mapDiv = document.getElementById('map');
        if (mapDiv) {
          this.initMap(h.latitude, h.longitude, h.name);
        }
      }
    });
  }

  private initMap(lat: number, lng: number, name: string): void {
    this.map = L.map('map').setView([lat, lng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    L.marker([lat, lng]).addTo(this.map).bindPopup(name).openPopup();

    setTimeout(() => {
      this.map?.invalidateSize();
    }, 100);
  }

  mostrarFormularioAlquiler() {
    if (!this.#authService.isLoggedIn()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }
    this.showRentalForm = true;
  }

  cerrarFormularioAlquiler() {
    this.showRentalForm = false;
  }

  enviarResena() {
    if (this.reviewForm.invalid || !this.#authService.isLoggedIn()) {
      return;
    }

    const reviewData = {
      house_id: this.id(),
      user_id: this.usuarioActual().id,
      rating: this.reviewForm.value.rating,
      comment: this.reviewForm.value.comment
    };

    this.#reviewService.createReview(reviewData).subscribe({
      next: (newReview) => {
        Swal.fire({
          title: '¡Gracias!',
          text: 'Tu reseña se ha guardado correctamente.',
          icon: 'success',
          confirmButtonText: 'Genial'
        });
        
        // Agregar nuestro propio nombre sin pedirlo a la api de nuevo
        const u = this.usuarioActual();
        newReview.userName = u.name + (u.surname1 ? ' ' + u.surname1 : '');

        this.houseReviews.update(reviews => [newReview, ...reviews]);
        this.reviewForm.reset({ rating: 5, comment: '' });
      },
      error: (err) => {
        const msg = err.error?.message || 'Hubo un error al enviar tu reseña.';
        Swal.fire({
          title: 'Ojo',
          text: msg,
          icon: 'warning',
          confirmButtonText: 'Entendido'
        });
      }
    });
  }
}
