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

// Обновление refreshToken
export async function fetchRefreshToken(): Promise<AuthResponseDto> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    throw new Error("No refreshToken in storage");
  }
  return apiFetch<AuthResponseDto>("/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
    auth: false,
  });
}

// Выход пользователя
export async function fetchLogout(): Promise<void> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return;
  return apiFetch<void>("/api/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
    auth: false,
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