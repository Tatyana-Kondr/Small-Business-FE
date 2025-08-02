import { handleFetchError } from "../../../utils/handleFetchError";
import {
  SessionUserDto,
  User,
  UserCreateDto,
  UserLoginDto,
} from "../types";

// 📌 Регистрация
export async function fetchRegister(userCreateDto: UserCreateDto): Promise<User> {
  const res = await fetch("/api/users/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
    },
    body: JSON.stringify(userCreateDto),
  });

  if (res.status === 409) {
    throw new Error("Conflict: User already exists.");
  }
  if (!res.ok) {
    await handleFetchError(res, "Failed to register user.");
  }
  return res.json();
}

// 📌 Логин
export async function fetchLogin(userLoginDto: UserLoginDto): Promise<void> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify(userLoginDto),
  });

  if (!res.ok) {
    await handleFetchError(res, "Ошибка входа");
  }
}

// 📌 Получить текущего пользователя из сессии
export async function fetchCurrentUser(): Promise<SessionUserDto> {
  const res = await fetch("/api/auth/me", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
    },
    credentials: "include", // 💡 Критично — тянем сессию
  });

  if (res.status === 401) {
    throw new Error("Not authenticated");
  }

  if (!res.ok) {
    throw new Error("Failed to fetch user");
  }

  return res.json();
}
