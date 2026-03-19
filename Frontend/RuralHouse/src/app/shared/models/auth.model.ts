/**
 * Payload que envía el formulario de registro a la API.
 */
export interface RegisterUser {
  name: string;
  surname1?: string;
  surname2?: string;
  alias?: string;
  birth_date?: string;
  email: string;
  password: string;
  password_confirmation: string;
}

/**
 * Respuesta de los endpoints de autenticación (login y register).
 * El backend devuelve únicamente el token JWT.
 */
export interface AuthResponse {
  token: string;
}
