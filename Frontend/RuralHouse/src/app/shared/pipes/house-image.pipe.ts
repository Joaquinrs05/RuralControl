import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environment/environment';

@Pipe({
  name: 'houseImage',
  standalone: true
})
export class HouseImagePipe implements PipeTransform {
  transform(photoPath: string | undefined): string {
    if (!photoPath) return '';
    return `${environment.apiBaseUrlHouses}/${photoPath}`;
  }
}
