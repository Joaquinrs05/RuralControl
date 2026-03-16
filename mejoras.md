# 🚀 Plan de Mejoras — RuralControl (Frontend + Backend)

> Documento generado tras un análisis exhaustivo del frontend (Angular 19 + TailwindCSS) y del backend (Laravel × 2 APIs + Docker + MySQL).
> Las mejoras están ordenadas por **prioridad** (🔴 Crítica, 🟡 Media, 🟢 Baja) y por **categoría**.

---

## Índice

### Frontend
1. [🔴 Seguridad (Frontend)](#1--seguridad)
2. [🔴 Arquitectura y Calidad de Código](#2--arquitectura-y-calidad-de-código)
3. [🟡 Gestión de Estado y Datos](#3--gestión-de-estado-y-datos)
4. [🟡 UX / Diseño / Accesibilidad](#4--ux--diseño--accesibilidad)
5. [🟡 Rendimiento](#5--rendimiento)
6. [🟢 Testing (Frontend)](#6--testing)
7. [🟢 SEO y Meta Tags](#7--seo-y-meta-tags)
8. [🟢 Otras Mejoras (Frontend)](#8--otras-mejoras)

### Backend
9. [🔴 Seguridad (Backend)](#9--seguridad-backend)
10. [🔴 Arquitectura Backend](#10--arquitectura-backend)
11. [🟡 Lógica de Negocio y Datos](#11--lógica-de-negocio-y-datos)
12. [🟡 Docker y Despliegue](#12--docker-y-despliegue)
13. [🟢 Testing y Calidad (Backend)](#13--testing-y-calidad-backend)

---

# FRONTEND

---

## 1. 🔴 Seguridad

### 1.1 URLs de API hardcodeadas por todo el proyecto
**Problema:** Las URLs de la API (`http://92.112.127.238:8000`, `http://92.112.127.238:8001`) están escritas directamente en al menos **7 archivos diferentes** en vez de usar los environments de Angular.

**Archivos afectados:**
- `Auth/services/auth.service.ts` → línea 19
- `pages/houses/houses.service.ts` → líneas 12-14
- `pages/houses/reservation.service.ts` → línea 26
- `pages/admin/admin.service.ts` → línea 17
- `pages/user/profile/user.service.ts` → línea 14
- `pages/user/profile/profile.component.ts` → línea 23
- `pages/admin/houses/house-form/house-form.component.ts` → línea 226
- Todas las templates con `[src]="'http://92.112.127.238:8001/' + ..."` (house-card, house-detail, reservas, profile)

**Solución:** Ya existe un archivo `environment.ts` con `apiUsersUrl` y `apiHousesUrl`, pero **no se usa en ningún servicio**. Centralizar todas las URLs ahí y crear un `environment.development.ts` para localhost.

```typescript
// environment.ts
export const environment = {
  production: true,
  apiUsersUrl: 'http://www.ruralcontrol.com/api/users',
  apiHousesUrl: 'http://www.ruralcontrol.com/api/houses',
  apiBaseUrlUsers: 'http://92.112.127.238:8000',
  apiBaseUrlHouses: 'http://92.112.127.238:8001',
};
```

### 1.2 El Interceptor HTTP no se registra en `app.config.ts`
**Problema:** Existe un `AuthInterceptor` con lógica para adjuntar el token JWT, pero **nunca se registra** como provider en `appConfig`. Esto significa que las peticiones HTTP **no llevan el token `Authorization`** automáticamente.

**Solución:** Registrar el interceptor en `app.config.ts`:
```typescript
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './Auth/interceptor/auth.interceptor';

providers: [
  provideHttpClient(withInterceptorsFromDi()),
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
]
```
O mejor aún, migrar a la nueva API funcional de interceptores de Angular 19.

### 1.3 Guard de autenticación con bug crítico
**Problema:** El `auth.guard.ts` **siempre devuelve `false`** y redirige. La línea `return true` (línea 41) es **código muerto** — nunca se alcanza porque tanto el `if` como el `else` hacen `return false`.

```typescript
// Código actual (BUGGY)
if (decoded.role === 'admin') {
  router.navigate(['/admin/home']);
  return false;  // ← Siempre false
} else {
  router.navigate(['/home']);
  return false;  // ← Siempre false
}
return true; // ← NUNCA se ejecuta
```

**Solución:** El guard debería verificar si el usuario ya está en la ruta correcta para su rol y dejarle pasar, o implementar guards separados para admin y usuario.

### 1.4 Token JWT: no se valida la expiración al cargar desde localStorage
**Problema:** En `AuthService.constructor()`, al recuperar el token de `localStorage`, no se verifica si ha expirado. Un token caducado se carga como válido hasta que el interceptor (que tampoco está registrado) lo detecte.

**Solución:** Verificar `exp` del token antes de setear `currentUserSignal`.

---

## 2. 🔴 Arquitectura y Calidad de Código

### 2.1 Eliminar el boilerplate de Angular en `app.component.html`
**Problema:** El archivo `app.component.html` tiene **325 líneas de template de ejemplo de Angular** (el SVG con el logo "Angular", los enlaces de docs, etc.) comentadas con `<!-- ... -->`. Esto añade peso innecesario y dificulta la lectura.

**Solución:** Eliminar todo el contenido comentado y dejar solo:
```html
<app-header></app-header>
<router-outlet></router-outlet>
```

### 2.2 Duplicación de componentes entre cliente y admin
**Problema:** Existen componentes duplicados con distintas implementaciones:
- `pages/houses/house-card/` vs `pages/admin/houses/house-card/`
- `pages/houses/house-list/` vs `pages/admin/houses/house-list/`
- `pages/houses/house-form/` vs `pages/admin/houses/house-form/`

**Solución:** Crear componentes compartidos con inputs de configuración (`mode: 'client' | 'admin'`) o usar composición/herencia para evitar duplicar lógica.

### 2.3 Mezcla de estilos SCSS propios con clases Tailwind inline
**Problema:** La app mezcla estilos SCSS en archivos separados (`.component.scss`) con clases Tailwind inline en los templates. Ejemplo: `house-card.component.scss` define clases como `.house-card`, `.house-image`, etc., pero el template usa exclusivamente clases de Tailwind y **no usa ninguna de las clases SCSS definidas**.

**Solución:** Elegir una estrategia y ser consistente:
- **Opción A:** Usar Tailwind en todas partes y eliminar los archivos SCSS innecesarios.
- **Opción B:** Crear clases SCSS con `@apply` para patrones repetidos y usarlas en los templates.

### 2.4 Inconsistencia en el uso de `any`
**Problema:** Se usa `any` frecuentemente en vez de interfaces tipadas:
- `registerForm(): Observable<any>` en `auth.service.ts`
- `login(): Observable<any>`
- `decoded: any` en múltiples archivos
- `createReservation(reservation: any)` en `houses.service.ts`

**Solución:** Crear interfaces para todas las respuestas de API y los datos del JWT.

```typescript
interface JwtPayload {
  sub: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  exp: number;
  iat: number;
}

interface LoginResponse {
  token: string;
  user: User;
}
```

### 2.5 Formulario de registro usa `computed()` incorrectamente
**Problema:** En `register.component.ts`, `registerForm` se crea con `computed()`, lo que significa que se **recrea en cada tick del change detection**. Un `FormGroup` debería crearse una sola vez.

```typescript
// ❌ Mal — se recalcula continuamente
registerForm: Signal<FormGroup> = computed(() => this.formBuilder.group({...}));

// ✅ Bien — se crea una vez
registerForm = this.formBuilder.group({...});
```

### 2.6 Inconsistencia de convenciones de nombrado
- Carpeta `Auth` con **A mayúscula** (debería ser `auth`).
- Mezcla de español e inglés en nombres: `reservasUsuario`, `cerrarModal`, `mostrarFormularioAlquiler` vs `showRentalForm`, `loading`, `errorMessage`.
- Componente exportado como `UsersComponent` pero la ruta es `profile` y el archivo es `profile.component.ts`.

### 2.7 Modelo `User` contiene `password`
**Problema:** La interfaz `User` tiene un campo `password: string`. Nunca debería existir el password del usuario en el frontend.

**Solución:** Eliminarlo de la interfaz y asegurarse de que el backend no lo envíe.

---

## 3. 🟡 Gestión de Estado y Datos

### 3.1 Múltiples fuentes de verdad para los datos de usuario
**Problema:** El usuario actual se obtiene de formas distintas en cada componente:
- `profile.component.ts`: decodifica el token → llama `getProfile()` → `getUserById()`
- `house-detail.component.ts`: decodifica el token → llama `getUserById()`
- `reservas.component.ts`: `getUserFromToken()` directamente en el constructor

**Solución:** Centralizar la obtención del usuario actual en `AuthService` con un `Signal<User | null>` que se actualice al login y se limpie al logout.

### 3.2 Console.logs de desarrollo en producción
**Problema:** Hay `console.log()` y `console.error()` esparcidos por toda la aplicación con mensajes de debug:
- `console.log('📤 Datos que se envían a la API:', ...)` en house-form
- `console.log('[Perfil] userId para reservas:', ...)` en profile
- `console.log('🏠 Casa eliminada correctamente')` en admin house-card
- `console.log('[AuthService] Token recibido del backend:', ...)` en auth.service

**Solución:** Implementar un `LoggerService` que solo loguee en desarrollo, o eliminar todos los logs manuales.

### 3.3 No hay manejo global de errores HTTP
**Problema:** Cada servicio y componente maneja sus errores de forma local e inconsistente. Algunos silencian errores (`handleError` devuelve `of(result)`), otros los muestran con `console.error()`.

**Solución:** Implementar un interceptor de errores global que:
- Muestre un toast/notificación al usuario
- Redirija a login en caso de 401
- Logee errores para debugging

### 3.4 `adminId` hardcodeado en el Dashboard
**Problema:** En `admin-dashboard.component.ts`, `adminId = 1` está hardcodeado. Debería obtenerse del token JWT del usuario autenticado.

---

## 4. 🟡 UX / Diseño / Accesibilidad

### 4.1 No hay un Footer
**Problema:** La aplicación no tiene footer. Añadir un footer con información de contacto, links legales (privacidad, cookies, etc.) y branding daría un aspecto más completo y profesional.

### 4.2 No hay página 404
**Problema:** La ruta wildcard `{ path: '**', redirectTo: 'auth/login' }` redirige cualquier URL no encontrada al login. Sería mejor tener una **página 404 personalizada** que muestre un mensaje claro y un botón para volver al inicio.

### 4.3 Las imágenes de casas no tienen fallback
**Problema:** Si la imagen de una casa no carga (URL rota, servidor caído), se muestra el icono de imagen rota del navegador. Solo `house-detail` tiene un fallback ("Sin imagen").

**Solución:** Añadir un `(error)` handler en todos los `<img>` o usar una directiva global:
```html
<img [src]="imageUrl" (error)="img.src = '/images/placeholder-house.png'" #img />
```

### 4.4 No hay animaciones de carga (skeletons)
**Problema:** Cuando se cargan las casas o los datos del perfil, no hay indicación visual de carga (excepto en el dashboard con `nb-spinner`). El usuario ve una pantalla vacía.

**Solución:** Implementar **skeleton loaders** o spinners en:
- Lista de casas (home)
- Detalle de casa
- Perfil de usuario
- Historial de reservas

### 4.5 Formulario de reserva: sin validación de fechas
**Problema:** El formulario de reserva no valida que:
- La fecha de inicio sea **posterior a hoy**
- La fecha de fin sea **posterior a la fecha de inicio**
- El número de personas sea > 0

El usuario puede seleccionar fechas pasadas o poner la fecha de fin antes que la de inicio.

### 4.6 La tabla de reservas no es responsive
**Problema:** En `reservas.component.html`, la tabla tiene altura fija `h-64` y no se adapta bien a móviles. Las columnas se comprimen y el contenido se desborda.

**Solución:** En móvil, cambiar a un layout de tarjetas en vez de tabla, o usar `overflow-x-auto` correctamente con scroll horizontal.

### 4.7 El menú del header no se cierra al hacer clic fuera
**Problema:** El submenú del header se abre con un clic y solo se cierra al hacer clic en un enlace o en el botón "Menú". Debería cerrarse también al hacer **clic fuera** del menú (click outside).

**Solución:** Añadir un `@HostListener('document:click')` o un overlay transparente.

### 4.8 Falta "Recordar contraseña" y "Mostrar/Ocultar contraseña"
**Problema:** El formulario de login no tiene:
- Enlace de "¿Olvidaste tu contraseña?"
- Toggle para mostrar/ocultar la contraseña

### 4.9 No hay confirmación al cerrar sesión
**Problema:** Al hacer clic en "Cerrar sesión", el logout se ejecuta inmediatamente sin confirmación. Un modal de confirmación evitaría cierres accidentales.

### 4.10 Inconsistencia visual entre Login y Register
**Problema:** La página de Login usa `bg-gradient-to-br from-blue-100 to-indigo-200` (tonos suaves), mientras que Register usa `bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500` (tonos vibrantes). Los estilos de los inputs y botones también difieren. Deberían compartir el mismo design system.

### 4.11 Detalle de casa: diseño mejorable
**Problema:** La página de detalle de casa es muy simple: imagen + texto + mapa + botones. Se podría mejorar con:
- **Galería de imágenes** (carrusel si hay varias fotos)
- **Rating y reviews** de usuarios
- **Amenidades/características** con iconos (WiFi, piscina, parking, etc.)
- **Precio por noche** visible de forma prominente
- **Calendario de disponibilidad**
- **Casas similares** sugeridas

---

## 5. 🟡 Rendimiento

### 5.1 FontAwesome cargado vía CDN + npm simultáneamente
**Problema:** FontAwesome se carga de dos formas:
- Kit de FontAwesome vía `<script>` en `index.html` (CDN)
- Paquetes `@fortawesome/*` instalados vía npm

Esto duplica la carga del bundle. Elegir **una sola estrategia**.

### 5.2 Nebular UI importado pero apenas usado
**Problema:** Se importan muchos módulos de `@nebular/theme` en `app.config.ts` (`NbLayoutModule`, `NbCardModule`, `NbSpinnerModule`, `NbSidebarModule`, `NbMenuModule`, `NbContextMenuModule`, `NbUserModule`, `NbSelectModule`), pero solo se usan `NbCardModule` y `NbSpinnerModule` en el dashboard del admin. El resto añade peso al bundle sin usarse.

**Solución:** Eliminar los módulos no usados o migrar el dashboard a componentes propios con Tailwind.

### 5.3 ECharts importado de forma pesada
**Problema:** `echarts` se importa completamente:
```typescript
echarts: () => import('echarts')
```
Esto trae **todo el bundle de ECharts** (~800KB min). Solo se usan gráficos de barras, líneas y pie.

**Solución:** Importar solo los módulos necesarios:
```typescript
echarts: () => import('echarts/core').then(ec => {
  // Registrar solo lo necesario
})
```

### 5.4 Leaflet se importa en componentes que no siempre se usan
**Problema:** `import * as L from 'leaflet'` se importa de forma estática en `house-detail` y `house-form`. Debería usarse **lazy import** ya que Leaflet es una librería pesada (~200KB).

### 5.5 Imágenes no optimizadas
**Problema:** Las imágenes de las casas se sirven directamente desde el backend sin ningún tipo de optimización (no hay lazy loading de imágenes, no hay formato webp, no hay thumbnails).

**Solución:**
- Añadir `loading="lazy"` a todos los `<img>` que no estén en el viewport inicial
- Considerar servir thumbnails para las tarjetas y full-size para el detalle

---

## 6. 🟢 Testing

### 6.1 Los test specs están vacíos o son boilerplate
**Problema:** Existen archivos `.spec.ts` pero la mayoría son los generados automáticamente por Angular CLI sin tests reales. Ejemplos: `app.component.spec.ts`, `login.component.spec.ts`, `house-list.component.spec.ts`.

**Solución:** Implementar tests unitarios al menos para:
- **Servicios:** `AuthService`, `HouseService`, `ReservationService`
- **Guards:** `auth.guard.ts` (especialmente dado el bug actual)
- **Componentes con lógica:** `LoginComponent`, `RegisterComponent`, `HouseFormComponent`
- **Pipes y directivas** si se crean

### 6.2 No hay tests e2e configurados
**Problema:** No hay configuración de Cypress, Playwright, ni Protractor para tests end-to-end.

**Solución:** Configurar Playwright o Cypress para testear flujos críticos:
- Login → Ver casas → Detalle → Reservar
- Registro de usuario
- Admin: crear casa → ver en listado → editar → eliminar

---

## 7. 🟢 SEO y Meta Tags

### 7.1 Sin meta description ni Open Graph tags
**Problema:** El `index.html` solo tiene `<title>RuralHouse</title>`. Falta:
- `<meta name="description" content="...">`
- Open Graph tags para compartir en redes sociales
- `<meta name="robots" content="index, follow">`

### 7.2 No se usa la directiva `Title` de Angular
**Problema:** Todas las páginas muestran el mismo título "RuralHouse". Cada vista debería tener su propio título dinámico.

**Solución:** Usar `Title` service de Angular en cada componente o en un route resolver:
```typescript
import { Title } from '@angular/platform-browser';

constructor(private title: Title) {
  this.title.setTitle('Detalle de Casa - RuralControl');
}
```

### 7.3 `lang="en"` cuando la app está en español
**Problema:** `<html lang="en">` en `index.html`, pero toda la interfaz está en español. Debería ser `lang="es"`.

---

## 8. 🟢 Otras Mejoras

### 8.1 Conflicto de merge en `Readme.md`
**Problema:** El archivo `Readme.md` contiene marcadores de conflicto de Git (`<<<<<<< HEAD`, `=======`, `>>>>>>> develop`). Limpiar y unificar las dos versiones del contenido.

### 8.2 Conflicto de versiones de Tailwind
**Problema:** En `package.json` hay `tailwindcss: ^3.4.17` como devDependency, pero también `@tailwindcss/postcss: ^4.1.7` como dependency. Estas son versiones incompatibles (v3 vs v4). Se debe unificar.

### 8.3 Añadir Lazy Loading a las rutas admin
**Problema:** Aunque ya se usa `loadComponent` para lazy loading de componentes, se podría agrupar todas las rutas admin bajo un **lazy loaded module/routes** para que los usuarios normales nunca descarguen el código del admin.

```typescript
{
  path: 'admin',
  loadChildren: () => import('./pages/admin/admin.routes').then(m => m.ADMIN_ROUTES),
  canActivate: [adminGuard],
}
```

### 8.4 Crear un `AdminGuard` separado
**Problema:** No existe un guard específico para rutas de administrador. Cualquier usuario autenticado puede acceder a `/admin/*` si conoce la URL.

**Solución:** Crear un `adminGuard` que verifique `decoded.role === 'admin'` y lo aplique a todas las rutas `/admin/*`.

### 8.5 Formulario de registro: sin validación visual de errores
**Problema:** El formulario de registro no muestra mensajes de error campo por campo (como sí lo hace el de login). El usuario no sabe qué campo tiene el error.

**Solución:** Añadir mensajes de validación debajo de cada campo:
```html
@if (registerForm().get('email')?.dirty && registerForm().get('email')?.invalid) {
  <div class="text-xs text-red-600">Email inválido</div>
}
```

### 8.6 Implementar tema oscuro (Dark Mode)
**Problema:** La app solo tiene tema claro. Un dark mode sería una mejora de UX muy valorada.

### 8.7 Variables de entorno para la URL base de imágenes
**Problema:** La URL base para las imágenes de las casas (`http://92.112.127.238:8001/`) está hardcodeada en múltiples templates HTML.

**Solución:** Crear una pipe o un servicio que construya la URL completa de la imagen:
```typescript
@Pipe({ name: 'houseImage' })
export class HouseImagePipe implements PipeTransform {
  transform(photoPath: string): string {
    return `${environment.apiBaseUrlHouses}/${photoPath}`;
  }
}
```

### 8.8 PWA (Progressive Web App)
**Solución:** Considerar añadir `@angular/pwa` para que la app funcione offline y se pueda instalar como aplicación nativa en móviles. Ideal para usuarios que buscan casas rurales en zonas con mala cobertura.

### 8.9 i18n (Internacionalización)
**Problema:** La app está íntegramente en español. Si se quiere expandir, se debería preparar para internacionalización usando `@angular/localize`.

### 8.10 Añadir un sistema de notificaciones
**Problema:** Actualmente se usa `SweetAlert2` para notificaciones, pero solo en algunos sitios. Sería mejor tener un sistema de **toast notifications** global y consistente (por ejemplo, con un servicio de notificaciones).

---

# BACKEND

## 9. 🔴 Seguridad (Backend)

### 9.1 Credenciales expuestas en el repositorio
**Problema CRÍTICO:** Los archivos `.env` están incluidos en el repositorio con credenciales reales:
- `UserApi/.env`: `DB_USERNAME=zudex`, `DB_PASSWORD=Alameda005`
- `HouseApi/.env`: `DB_USERNAME=zudex`, `DB_PASSWORD=Alameda005`
- `docker-compose.yml`: `MYSQL_ROOT_PASSWORD: root`, `MYSQL_PASSWORD: 1234`

Además, el `.gitignore` de UserApi **no incluye `.env`** (solo tiene 316 bytes, probablemente el default).

**Solución:**
1. Añadir `.env` al `.gitignore` de ambas APIs (si no está)
2. Eliminar los `.env` del historial de Git con `git filter-branch` o `BFG Repo Cleaner`
3. Rotar TODAS las contraseñas expuestas inmediatamente
4. Usar solo `.env.example` con valores placeholder en el repo

### 9.2 JWT Secret inseguro
**Problema:** En `UserApi/.env`, la línea `JWT_SECRET=tukey` establece un secret de solo **5 caracteres**. Esto hace que los tokens JWT sean triviales de falsificar por fuerza bruta.

**Solución:** Generar un secret seguro con `php artisan jwt:secret` (mínimo 32 caracteres aleatorios).

### 9.3 Todas las rutas de HouseApi son públicas (sin autenticación)
**Problema:** En `HouseApi/routes/api.php`, **ninguna ruta tiene middleware de autenticación**:
```php
Route::post('houses', [HouseController::class, 'store']);      // ❌ Cualquiera puede crear casas
Route::put('houses/{house}', [HouseController::class, 'update']); // ❌ Cualquiera puede editar
Route::delete('houses/{house}', [HouseController::class, 'destroy']); // ❌ Cualquiera puede eliminar
Route::post('reservations', [ReservationController::class, 'store']); // ❌ Cualquiera puede reservar
```

**Solución:** Proteger las rutas de escritura con middleware de autenticación. Idealmente, la HouseApi debería verificar el JWT emitido por la UserApi, o implementar una comunicación inter-servicios segura.

### 9.4 La ruta `GET /api/users/{id}` devuelve datos sin autenticación
**Problema:** En `UserApi/routes/api.php`, `Route::get('/users/{id}', ...)` es pública. Cualquier persona puede obtener la información de cualquier usuario solo conociendo su ID.

**Solución:** Proteger esta ruta o limitar los campos devueltos (solo nombre, no email ni datos sensibles).

### 9.5 `APP_DEBUG=true` en producción
**Problema:** Ambos archivos `.env` tienen `APP_DEBUG=true`. En producción, esto expone stack traces completos, variables de entorno y rutas internas al usuario en caso de error.

**Solución:** Crear archivos `.env.production` con `APP_DEBUG=false` y `APP_ENV=production`.

### 9.6 `APP_KEY` compartido entre las dos APIs
**Problema:** Ambas APIs usan la misma `APP_KEY`:
```
APP_KEY=base64:ppD2YueAqam3Qb09gtW4IkHmYEp3LfH+D2rBmIiANFo=
```
Cada aplicación Laravel debería tener su propia `APP_KEY` única.

### 9.7 No hay rate limiting en endpoints de autenticación
**Problema:** Los endpoints `auth/login` y `auth/register` no tienen protección contra ataques de fuerza bruta. Un atacante puede intentar miles de contraseñas por minuto.

**Solución:** Añadir el middleware `throttle:5,1` (5 intentos por minuto) a las rutas de login:
```php
Route::middleware(['throttle:5,1'])->group(function () {
    Route::post('auth/login', [AuthController::class, 'login']);
});
```

### 9.8 Endpoint de geocodificación sin validación
**Problema:** El endpoint `geocode/reverse` en `HouseController` pasa los parámetros `lat` y `lon` directamente a una petición HTTP externa sin validar que sean números válidos.

**Solución:** Validar los parámetros:
```php
$request->validate([
    'lat' => 'required|numeric|between:-90,90',
    'lon' => 'required|numeric|between:-180,180',
]);
```

---

## 10. 🔴 Arquitectura Backend

### 10.1 CORS headers manuales en HouseController
**Problema:** En `HouseController::index()`, los CORS headers se añaden **manualmente** en la respuesta:
```php
return response()->json($houses)
    ->header('Access-Control-Allow-Origin', 'http://localhost:4200')
    ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
```
Esto es **redundante** y **potencialmente conflictivo** porque ya existe `config/cors.php` que maneja CORS globalmente. Además, esa cabecera manual solo permite `localhost:4200`, ignorando los otros origins del config.

**Solución:** Eliminar las cabeceras manuales y confiar en `config/cors.php`.

### 10.2 Inconsistencia: el modelo `User` existe en HouseApi
**Problema:** La HouseApi tiene su propio modelo `User` (`HouseApi/app/Models/User.php`) y su propia tabla `users`, pero la gestión de usuarios la hace la UserApi. Esto crea **dos tablas de usuarios en la misma base de datos** (`houses_service`) que nunca se sincroniza con la tabla real de usuarios.

**Solución:** Eliminar el modelo `User` y la migración de `users` de la HouseApi. Para validar usuarios, la HouseApi ya hace una petición HTTP a la UserApi (como en `ReservationController::store()`).

### 10.3 Verificación de usuario inter-API solo por HTTP, sin caché ni fallback
**Problema:** En `ReservationController::store()`, se hace una petición HTTP síncrona a la UserApi para verificar que el usuario existe:
```php
$userApiUrl = "http://user-api:8000/api/users/{$validated['user_id']}";
$response = Http::get($userApiUrl);
```
Si la UserApi está caída, la creación de reservas falla por completo. No hay timeout definido, no hay retry, no hay caché.

**Solución:**
- Añadir timeout: `Http::timeout(5)->get(...)`
- Considerar caché de verificación de usuario
- Manejar el error con un mensaje claro

### 10.4 Código comentado y funcionalidad a medias en `HouseController::update()`
**Problema:** El método `update()` tiene código comentado que indica funcionalidad incompleta:
```php
//  'photo_path' => $photoPath,  // Guardamos la nueva ruta de la imagen
//  'owner_id' => $validated['owner_id'] ?? $house->owner_id,
```
La lógica de actualización de imagen está "medio implementada" (como dice el propio comentario en línea 105).

**Solución:** Completar la funcionalidad de actualización de imagen o eliminar el código muerto.

### 10.5 El `Dockerfile` de HouseApi expone el puerto incorrecto
**Problema:** El `Dockerfile` de HouseApi dice `EXPOSE 8000`, pero en `docker-compose.yml` el servicio escucha en el puerto `8001`. Esto puede causar confusión.

**Solución:** Cambiar a `EXPOSE 8001` en el Dockerfile de HouseApi.

### 10.6 Falta relación `House → Reservation` en el modelo
**Problema:** El modelo `House` no define la relación `hasMany` con `Reservation`, aunque `Reservation` sí tiene `belongsTo(House::class)`. Esto impide usar `$house->reservations` en queries.

**Solución:**
```php
// House.php
public function reservations()
{
    return $this->hasMany(Reservation::class);
}
```

### 10.7 No hay Form Requests (validación en controladores)
**Problema:** Toda la validación se hace directamente en los métodos del controlador con `$request->validate()`. En Laravel, la práctica recomendada es usar **Form Request classes** para separar la lógica de validación.

**Solución:** Crear Form Requests como `StoreHouseRequest`, `StoreReservationRequest`, etc.

---

## 11. 🟡 Lógica de Negocio y Datos

### 11.1 Bug: `$averageRating` no definida en AdminDashboardController
**Problema:** En `AdminDashboardController::getAdminStats()`, la línea 59 usa `$averageRating`:
```php
'average_rating' => round($averageRating ?? 0, 2),
```
Pero **`$averageRating` nunca se define** en el método. Esto causará un warning de PHP y siempre devolverá 0. Probablemente se eliminó la query pero no la referencia.

**Solución:** Implementar el cálculo del rating promedio o eliminar el campo de la respuesta.

### 11.2 Bug: Lógica de solapamiento de reservas incorrecta
**Problema:** En `ReservationController::store()`, la verificación de solapamiento de fechas es incorrecta:
```php
$query->Where(function ($q) use ($validated) {
    $q->where('start_date', '>=', $validated['start_date'])
        ->where('end_date', '<=', $validated['end_date']);
});
```
Esta query solo detecta reservas **completamente contenidas** dentro del rango solicitado. **No detecta** reservas que:
- Empiezan antes y terminan dentro del rango
- Empiezan dentro y terminan después del rango
- Envuelven completamente el rango solicitado

**Solución:** Usar la lógica de solapamiento estándar:
```php
$query->where('start_date', '<', $validated['end_date'])
      ->where('end_date', '>', $validated['start_date']);
```

### 11.3 Inconsistencia en status de reserva
**Problema:** La migración define los status como `['pendiente', 'confirmado', 'cancelado']`, pero en `AdminDashboardController::getAdminStats()` se busca `status = 'confirmada'` (con la 'a' final). Esto hará que nunca encuentre reservas confirmadas para esa métrica.

### 11.4 El `owner_id` no se valida contra la UserApi
**Problema:** Al crear una casa (`HouseController::store()`), el `owner_id` se acepta sin verificar que exista como usuario administrador en la UserApi. Cualquiera podría asignar cualquier `owner_id`.

### 11.5 No hay paginación en los listados
**Problema:** `House::all()` devuelve **todas** las casas sin paginación. Con muchas casas, esto afecta al rendimiento y consume memoria.

**Solución:** Implementar paginación:
```php
public function index(Request $request)
{
    return House::paginate($request->get('per_page', 20));
}
```

### 11.6 La tabla `houses` no tiene `average_rating` en la migración
**Problema:** El modelo `House` incluye `average_rating` en `$fillable`, y el factory genera un campo `average_rating`, pero **la migración de la tabla `houses` no tiene esa columna**. Esto da error al intentar guardar una casa con rating.

### 11.7 Factory asigna todas las casas a `owner_id = "1"`
**Problema:** En `HouseFactory.php`, `'owner_id' => "1"` está hardcodeado como string. Todas las casas de seed pertenecen al admin. Además, debería ser un integer, no un string.

---

## 12. � Docker y Despliegue

### 12.1 `docker-compose.yml` usa versión obsoleta
**Problema:** `version: '3.8'` está deprecated en versiones actuales de Docker Compose. Se puede eliminar.

### 12.2 No hay healthchecks en docker-compose
**Problema:** Los servicios `user-api` y `house-api` usan `depends_on: - mysql`, pero esto solo garantiza que el contenedor MySQL **se inicie**, no que esté **listo para aceptar conexiones**. El `wait-for-it.sh` mitiga esto parcialmente, pero un healthcheck nativo es más robusto.

**Solución:**
```yaml
mysql:
  healthcheck:
    test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
    interval: 5s
    timeout: 5s
    retries: 10

user-api:
  depends_on:
    mysql:
      condition: service_healthy
```

### 12.3 Los seeders se ejecutan con `--force` en cada arranque
**Problema:** El `command` del docker-compose incluye `php artisan db:seed --force`, lo que ejecuta los seeders **cada vez** que se reinicia el contenedor. Esto creará registros duplicados (admin, casas de ejemplo) en cada restart.

**Solución:** Usar `php artisan migrate --seed` solo en el primer arranque, o añadir lógica de `firstOrCreate` en los seeders.

### 12.4 No hay `.dockerignore`
**Problema:** No hay archivo `.dockerignore` en ninguna de las APIs. Esto significa que `node_modules/`, `vendor/`, `.git/`, los `.zip`, etc., se copian al contexto de Docker, haciendo que las builds sean lentas e innecesariamente grandes.

**Solución:** Crear `.dockerignore` en ambas APIs:
```
vendor/
node_modules/
.git/
storage/logs/*
.env
*.zip
```

### 12.5 APP_URL incorrecta en HouseApi
**Problema:** En `HouseApi/.env`, `APP_URL=http://TuURL` es un placeholder no configurado. Esto puede afectar a la generación de URLs de assets y links.

---

## 13. 🟢 Testing y Calidad (Backend)

### 13.1 No hay tests implementados
**Problema:** Ni la UserApi ni la HouseApi tienen tests más allá de los archivos de ejemplo que genera Laravel.

**Solución:** Implementar tests al menos para:
- **AuthController:** registro, login, logout, token expirado
- **ReservationController:** crear reserva, verificar solapamiento, validar usuario
- **AdminDashboardController:** estadísticas, reservas por mes
- **HouseController:** CRUD completo

### 13.2 No hay API documentation
**Problema:** No existe documentación de la API (ni Swagger/OpenAPI, ni Postman actualizado). El archivo `Endpoints.postman_collection.json` solo tiene 3.6KB, probablemente incompleto.

**Solución:** Usar un paquete como `l5-swagger` o `scramble` para generar documentación OpenAPI automáticamente.

### 13.3 No hay logging estructurado
**Problema:** Los errores en controladores se devuelven directamente al usuario con `$e->getMessage()`. No hay logging centralizado para monitorización.

**Solución:** Usar `Log::error()` en los catch blocks y configurar un canal de logging apropiado para producción.

---

## �📊 Resumen de Impacto (Frontend + Backend)

| Categoría | Críticas 🔴 | Medias 🟡 | Bajas 🟢 |
|---|---|---|---|
| **FRONTEND** | | | |
| Seguridad | 4 | — | — |
| Arquitectura | 7 | — | — |
| Estado y Datos | — | 4 | — |
| UX / Diseño | — | 11 | — |
| Rendimiento | — | 5 | — |
| Testing (FE) | — | — | 2 |
| SEO | — | — | 3 |
| Otras (FE) | — | — | 10 |
| **BACKEND** | | | |
| Seguridad (BE) | 8 | — | — |
| Arquitectura (BE) | 7 | — | — |
| Lógica y Datos | — | 7 | — |
| Docker/Deploy | — | 5 | — |
| Testing (BE) | — | — | 3 |
| **Total** | **26** | **32** | **18** |

---

## ✅ Orden recomendado de implementación

### 🔥 Fase 0 — Urgente (hoy)
- **Sacar `.env` del repositorio** y rotar credenciales de BD
- **Cambiar `JWT_SECRET`** por uno seguro (32+ caracteres)
- **`APP_DEBUG=false`** en producción

### Fase 1 — Crítico (1-2 días)
- Proteger rutas de escritura de HouseApi con autenticación
- Rate limiting en login/register
- Corregir el bug del `authGuard` (frontend)
- Registrar el `AuthInterceptor` en `app.config.ts`
- Centralizar URLs de API usando `environment.ts`
- Crear `AdminGuard` para proteger rutas admin (frontend)
- Limpiar boilerplate de `app.component.html`

### Fase 2 — Bugs y calidad (2-3 días)
- Corregir solapamiento de reservas en `ReservationController`
- Corregir `$averageRating` no definida en dashboard
- Corregir status `'confirmada'` vs `'confirmado'`
- Eliminar CORS manuales de `HouseController::index()`
- Eliminar `any` → crear interfaces tipadas (frontend)
- Corregir `registerForm` con `computed` (frontend)
- Centralizar manejo de errores HTTP
- Eliminar `console.log` de producción
- Corregir `lang="es"` y añadir meta tags

### Fase 3 — UX y estructura (3-5 días)
- Añadir paginación al listado de casas (backend)
- Completar funcionalidad de update de imágenes (backend)
- Añadir relaciones Eloquent faltantes
- Añadir skeleton loaders (frontend)
- Mejorar responsive de tablas
- Validación de fechas en reservas
- Unificar estilo Login/Register
- Añadir footer y página 404

### Fase 4 — Docker y rendimiento (1 semana)
- Crear `.dockerignore`
- Añadir healthchecks a docker-compose
- Arreglar seeders para que no dupliquen datos
- Eliminar módulos Nebular no usados
- Optimizar imports de ECharts y Leaflet
- Lazy loading agrupado para admin

### Fase 5 — Extras y futuro
- Implementar tests unitarios (frontend + backend)
- Documentación API con Swagger/OpenAPI
- Form Request classes en Laravel
- Dark mode, PWA (opcionales)

