import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { House } from './house.model';

@Injectable({
  providedIn: 'root'
})
export class HouseService {
  private apiUrl = 'http://127.0.0.1:8001/api/houses'; // Ajusta la URL según tu backend

  constructor(private http: HttpClient) { }

  getHouses(): Observable<House[]> {
    return this.http.get<House[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError<House[]>('getHouses', []))
      );
  }

  getHouseById(id: number): Observable<House | undefined> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<House>(url)
      .pipe(
        catchError(this.handleError<House>(`getHouse id=${id}`))
      );
  }

  // Para pruebas, si aún no tienes el backend listo
  getMockHouses(): Observable<House[]> {
    const mockHouses: House[] = [
      {
        id: 1,
        name: 'Villa con vistas al campo',
        description: 'Hermosa villa rural con impresionantes vistas panorámicas del valle y las montañas. Ideal para familias que buscan tranquilidad.',
        photo_path: 'assets/images/house1.jpg',
        owner_id: 1,
        average_rating: 4.7,
        created_at: '2024-01-15T10:20:30',
        updated_at: '2024-01-15T10:20:30'
      },
      {
        id: 2,
        name: 'Casa rural renovada',
        description: 'Casa rural completamente renovada con materiales tradicionales. Conserva el encanto rústico con todas las comodidades modernas.',
        photo_path: 'assets/images/house2.jpg',
        owner_id: 2,
        average_rating: 4.5,
        created_at: '2024-02-22T14:35:40',
        updated_at: '2024-02-22T14:35:40'
      },
      {
        id: 3,
        name: 'Finca con terreno',
        description: 'Amplia finca con terreno de cultivo y bosque privado. Perfecto para amantes de la naturaleza y la agricultura.',
        photo_path: 'assets/images/house3.jpg',
        owner_id: 1,
        average_rating: 4.9,
        created_at: '2024-03-10T09:15:20',
        updated_at: '2024-03-10T09:15:20'
      },
      {
        id: 4,
        name: 'Cabaña en el monte',
        description: 'Acogedora cabaña de madera ubicada en plena naturaleza. Desconexión garantizada en un entorno único.',
        photo_path: 'assets/images/house4.jpg',
        owner_id: 3,
        average_rating: 4.2,
        created_at: '2024-03-28T11:40:15',
        updated_at: '2024-03-28T11:40:15'
      },
      {
        id: 5,
        name: 'Cortijo andaluz',
        description: 'Tradicional cortijo andaluz con patio interior y piscina. Disfruta del sol del sur en esta auténtica casa rural.',
        photo_path: 'assets/images/house5.jpg',
        owner_id: 2,
        average_rating: 4.8,
        created_at: '2024-04-05T16:25:10',
        updated_at: '2024-04-05T16:25:10'
      },
      {
        id: 6,
        name: 'Casa de piedra',
        description: 'Auténtica casa de piedra rehabilitada con encanto rústico. Gruesos muros que mantienen la temperatura ideal en cualquier estación.',
        photo_path: 'assets/images/house6.jpg',
        owner_id: 3,
        average_rating: 4.6,
        created_at: '2024-04-17T13:50:25',
        updated_at: '2024-04-17T13:50:25'
      }
    ];

    return of(mockHouses);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      // Devuelve un resultado vacío para seguir ejecutando la aplicación
      return of(result as T);
    };
  }
}