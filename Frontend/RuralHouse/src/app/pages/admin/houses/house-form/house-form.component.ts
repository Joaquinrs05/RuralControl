// formulario-crear-casa.component.ts
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../Auth/services/auth.service';
import { User } from '../../../../shared/models/user.model';
import * as L from 'leaflet';

@Component({
  selector: 'app-house-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './house-form.component.html',
  styleUrl: './house-form.component.scss',
})
export class HouseFormComponent {
  casaForm: FormGroup;
  selectedFile: File | null = null;
  private router = inject(Router);
  private authservice = inject(AuthService);

  private map: L.Map | null = null;
  private marker: L.Marker | null = null;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.casaForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      average_rating: [''],
      photo: [null, Validators.required],
      price_per_night: ['', Validators.required],
      address: ['', Validators.required],
      latitude: [
        '',
        [Validators.required, Validators.min(-90), Validators.max(90)],
      ],
      longitude: [
        '',
        [Validators.required, Validators.min(-180), Validators.max(180)],
      ],
    });
  }

  ngOnInit() {
    // Configurar iconos de Leaflet
    this.setupLeafletIcons();
  }

  ngAfterViewInit() {
    // Inicializar el mapa después de que la vista esté lista
    setTimeout(() => {
      this.initMap();
    }, 100);
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  private setupLeafletIcons() {
    // Fix para los iconos de Leaflet en Angular
    const iconRetinaUrl = 'assets/marker-icon-2x.png';
    const iconUrl = 'assets/marker-icon.png';
    const shadowUrl = 'assets/marker-shadow.png';
    const iconDefault = L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41],
    });
    L.Marker.prototype.options.icon = iconDefault;
  }

  private initMap() {
    // Coordenadas por defecto (centro de España)
    const defaultLat = 40.4168;
    const defaultLng = -3.7038;

    this.map = L.map('map').setView([defaultLat, defaultLng], 6);

    // Añadir capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    // Evento de clic en el mapa
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.setMapLocation(e.latlng.lat, e.latlng.lng);
      this.reverseGeocode(e.latlng.lat, e.latlng.lng);
    });
  }

  private setMapLocation(lat: number, lng: number) {
    if (!this.map) return;

    // Remover marcador anterior si existe
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    // Añadir nuevo marcador
    this.marker = L.marker([lat, lng]).addTo(this.map);

    // Actualizar formulario
    this.casaForm.patchValue({
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    });

    // Centrar mapa en la nueva ubicación
    this.map.setView([lat, lng], 15);
  }

  // Geocodificación inversa (coordenadas -> dirección)
  private reverseGeocode(lat: number, lng: number) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;

    this.http.get<any>(url).subscribe({
      next: (response) => {
        if (response && response.display_name) {
          this.casaForm.patchValue({
            address: response.display_name,
          });
        }
      },
      error: (err) => {
        console.error('Error en geocodificación inversa:', err);
      },
    });
  }

  // Geocodificación directa (dirección -> coordenadas)
  searchAddress() {
    const address = this.casaForm.get('address')?.value;

    if (!address) {
      alert('Por favor, introduce una dirección');
      return;
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address
    )}&limit=1`;

    this.http.get<any[]>(url).subscribe({
      next: (response) => {
        if (response && response.length > 0) {
          const result = response[0];
          const lat = parseFloat(result.lat);
          const lng = parseFloat(result.lon);

          this.setMapLocation(lat, lng);
          this.casaForm.patchValue({
            address: result.display_name,
          });
        } else {
          alert(
            'No se encontró la dirección. Intenta con otra dirección o haz clic en el mapa.'
          );
        }
      },
      error: (err) => {
        console.error('Error en la búsqueda:', err);
        alert('Error al buscar la dirección');
      },
    });
  }

  getUser() {
    const token = this.authservice.getToken() as string;
    if (!token) {
      console.error('No token found');
      return null; // o lanzar un error si prefieres
    }
    const user = this.authservice.getUserFromToken(token);
    console.log('Usuario obtenido del token:', user);
    return user;
  }

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  onSubmit() {
    if (this.casaForm.invalid) {
      return;
    }
    const user = this.getUser();
    if (!user || !user.id) {
      alert('No se ha podido obtener el usuario del token');
      return;
    }

    const formData = new FormData();
    formData.append('name', this.casaForm.value.name);
    formData.append('description', this.casaForm.value.description);
    formData.append('owner_id', user.id);
    formData.append('price_per_night', this.casaForm.value.price_per_night);
    formData.append('address', this.casaForm.value.address);
    formData.append('latitude', this.casaForm.value.latitude);
    formData.append('longitude', this.casaForm.value.longitude);

    if (this.casaForm.value.average_rating) {
      formData.append('average_rating', this.casaForm.value.average_rating);
    }

    if (this.selectedFile) {
      formData.append('photo', this.selectedFile);
    }

    console.log(
      '📤 Datos que se envían a la API:',
      Object.fromEntries(formData.entries())
    ); // <-- OPCIONAL PARA DEBUG

    this.http.post('http://localhost:8001/api/houses', formData).subscribe({
      next: () => {
        // TODO: Mostrar un mensaje de éxito con librería tipo SweetAlert
        alert('Casa creada correctamente');
        this.casaForm.reset();
        this.selectedFile = null;
        this.router.navigate(['/admin/home']); // o la ruta que toque
      },
      error: (err) => {
        console.error('Error al crear la casa:', err);
        alert('Error al crear la casa');
      },
    });
  }
}
