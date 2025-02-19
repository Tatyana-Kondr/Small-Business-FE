import { User, UserCreateDto, UserLoginDto, LoginResponse } from "../types";

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
    throw new Error("Conflict: User already exists.")
  }

  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.message || "Failed to register user.")
  }

  return res.json()
}

export async function fetchLogin(userLoginDto: UserLoginDto): Promise<LoginResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json", // Лучше явно указывать application/json
    },
    body: JSON.stringify(userLoginDto),
  });
  
  let data;
  try {
    data = await res.json(); // Парсим JSON один раз
  } catch (error) {
    throw new Error("Ошибка парсинга ответа от сервера");
  }

  if (!res.ok) {
    throw new Error(data?.message || "Login failed");
  }

  return data;
}


export async function fetchCurrentUser(): Promise<User> {

  const res = await fetch("/api/auth/me", {
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
      authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!res.ok) {
    throw new Error("Login failed")
  }

  return res.json();
}
