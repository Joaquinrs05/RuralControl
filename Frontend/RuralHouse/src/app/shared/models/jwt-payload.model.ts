/**
 * Tipado del payload del token JWT emitido por la UserApi.
 * Se usa en guards, interceptor y auth.service para reemplazar `decoded: any`.
 */
export interface JwtPayload {
  /** ID del usuario (subject) */
  sub: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  /** Timestamp de expiración (segundos desde epoch) */
  exp: number;
  /** Timestamp de emisión */
  iat: number;
}

/**
 * Objeto de usuario que maneja internamente la app.
 * `getUserFromToken` mapea `sub` → `id` para que los componentes
 * puedan usar `user.id` de forma consistente.
 */
export interface TokenUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}
