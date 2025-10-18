import { apiFetch } from "../../../utils/apiFetch";
import {
  AuthRequestDto,
  AuthResponseDto,
  ChangePasswordDto,
  NewUserDto,
  Role,
  UpdateUserDto,
  UserDto,
} from "../types";


// Регистрация нового пользователя (только для ADMIN)
export async function fetchRegister(newUserDto: NewUserDto): Promise<UserDto> {
  return apiFetch<UserDto>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(newUserDto),
    auth: true, // нужно быть залогиненным
  });
}

// Логин пользователя
export async function fetchLogin(authRequestDto: AuthRequestDto): Promise<AuthResponseDto> {
  return apiFetch<AuthResponseDto>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(authRequestDto),
  });
}

// Обновление accessToken по refreshToken
export async function fetchRefreshToken(): Promise<AuthResponseDto> {
  return apiFetch<AuthResponseDto>("/api/auth/refresh", {
    method: "POST",
    auth: true, // нужно, чтобы куки с refreshToken ушли на сервер
  });
}

// Выход пользователя
export async function fetchLogout(): Promise<void> {
  return apiFetch<void>("/api/auth/logout", {
    method: "POST",
    auth: true,
  });
}

// Получение профиля текущего пользователя
export async function fetchUserProfile(): Promise<UserDto> {
  return apiFetch<UserDto>("/api/auth/me", {
    method: "GET",
    auth: true,
  });
}

// -------------------- Users --------------------

// Получение списка всех пользователей (только ADMIN)
export async function fetchUsers(): Promise<UserDto[]> {
  return apiFetch<UserDto[]>("/api/users", {
    auth: true,
  },
"Fehler beim Laden der Liste der Benutzer."
);
}

// Получение  пользователя по id 
export async function fetchUser(id: number): Promise<UserDto> {
  return apiFetch<UserDto>(`/api/users/${id}`, 
    { auth: true, },
    "Fehler beim Laden des Benutzers."
  );
}

export async function fetchEditUser(userId: number, updateUserDto: UpdateUserDto): Promise<UserDto> {
  return apiFetch<UserDto>(`/api/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(updateUserDto),
    auth: true,
  },
  "Fehler beim Aktualisieren des Benutzers."
);
}

// Обновление роли пользователя (только ADMIN)
export async function fetchUpdateUserRole(userId: number, role: Role): Promise<UserDto> {
  return apiFetch<UserDto>(`/api/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
    auth: true,
  },
 "Fehler beim Aktualisieren der Rolle."
);
}

export async function fetchChangePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<UserDto> {
  return apiFetch<UserDto>(`/api/users/${userId}/change-password`, {
    method: "PATCH",
    body: JSON.stringify(changePasswordDto),
    auth: true,
  },
  "Fehler beim Ändern des Passworts."
);
}