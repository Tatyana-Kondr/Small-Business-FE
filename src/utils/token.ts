export const ACCESS_TOKEN_KEY = "accessToken";

// Сохранить токен
export function saveToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

// Получить токен
export function getToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

// Удалить токен
export function removeToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}
