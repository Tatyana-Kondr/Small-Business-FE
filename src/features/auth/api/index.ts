import { User, UserCreateDto, UserLoginDto, LoginResponse } from "../types";

export async function fetchRegister(userCreateDto: UserCreateDto): Promise<User> {
  const res = await fetch("/api/users/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userCreateDto),
  });

  if (!res.ok) {
    const { message } = await res.json();
    throw new Error(message || "Registration failed");
  }

  return await res.json();
}

export async function fetchLogin(userLoginDto: UserLoginDto): Promise<LoginResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userLoginDto),
  });

  if (!res.ok) {
    const { message } = await res.json();
    throw new Error(message || "Login failed");
  }

  return await res.json();
}

export async function fetchCurrentUser(): Promise<User> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const res = await fetch("/api/account", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch user data");
  }

  return await res.json();
}
