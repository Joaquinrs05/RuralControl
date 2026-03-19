import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { AuthInterceptor } from './Auth/interceptor/auth.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';

import {
  NbThemeModule,
  NbLayoutModule,
  NbCardModule,
  NbSpinnerModule,
  NbSidebarModule,
  NbMenuModule,
  NbContextMenuModule,
  NbUserModule,
  NbSelectModule,
} from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';

import { routes } from './app.routes';
import { NgxEchartsModule } from 'ngx-echarts';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    provideAnimations(),
    importProvidersFrom(
      NbThemeModule.forRoot({ name: 'default' }),
      NbLayoutModule,
      NbEvaIconsModule,
      NbCardModule,
      NbSpinnerModule,
      NgxEchartsModule.forRoot({
        echarts: () => import('echarts'),
      })
    ),
  ],
};
