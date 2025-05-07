import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent  {
  // Nombre de la empresa
  companyName: string = 'RuralControl';
  
  // Ruta al logo
  logoPath: string = 'assets/images/logo.png';
}