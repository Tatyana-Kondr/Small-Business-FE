import { apiFetch } from "../../../utils/apiFetch";
import { getToken, removeToken, saveToken } from "../../../utils/token";
import {
  SessionUserDto,
  UserCreateDto,
  UserLoginDto,
} from "../types";

// Регистрация
export async function fetchRegister(userCreateDto: UserCreateDto): Promise<SessionUserDto> {
  const data = await apiFetch<{ token: string }>("/api/users/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userCreateDto),
  }, "Fehler bei der Registrierung.");

  saveToken(data.token);
  return fetchCurrentUser();
}

// Логин
export async function fetchLogin(userLoginDto: UserLoginDto): Promise<SessionUserDto> {
  const data = await apiFetch<{ token: string }>("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userLoginDto),
  }, "Fehler beim Anmelden.");

  saveToken(data.token);
  return fetchCurrentUser();
}

// Получение текущего пользователя
export async function fetchCurrentUser(): Promise<SessionUserDto> {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  return apiFetch<SessionUserDto>("/api/auth/me", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }, "Benutzer nicht gefunden.");
}

// Логаут
export async function fetchLogout(): Promise<void> {
   try {
  await apiFetch("/api/auth/logout", {
    method: "POST",
    credentials: "include", 
  }, "Logout-Fehler");
   } finally {
    removeToken(); // удаляем токен в любом случае
  } 
}

// Refresh
export async function fetchRefresh(): Promise<string | null> {
  try {
    const data = await apiFetch<{ token: string }>("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    }, "Fehler beim Refresh.", true); // ⚡ передаём retry=true, чтобы не уйти в цикл

    saveToken(data.token);
    return data.token;
  } catch {
    return null;
  }
}