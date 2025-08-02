import { createAppSlice } from "../../redux/createAppSlice";
import { fetchCurrentUser, fetchLogin, fetchRegister } from "./api";
import { AuthState, UserCreateDto, UserLoginDto } from "./types";


const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  status: "idle",
  error: null,
  loginErrorMessage: undefined,
  registerErrorMessage: undefined,
  isSessionChecked: false,
};

export const authSlice = createAppSlice({
  name: "auth",
  initialState,
  reducers: (create) => ({
    register: create.asyncThunk(
      async (user: UserCreateDto) => {
        const response = await fetchRegister(user);
        return response;
      },
      {
        pending: (state) => {
          state.status = "loading";
          state.registerErrorMessage = undefined;
        },
        fulfilled: (state, action) => {
          state.status = "idle";
          state.user = action.payload;
          state.isAuthenticated = true;
        },
        rejected: (state, action) => {
          state.status = "failed";
          state.registerErrorMessage = action.error?.message || "Registration failed";
        },
      }
    ),

    login: create.asyncThunk(
      async (user: UserLoginDto) => {
        await fetchLogin(user); // 🔐 просто логинимся — сервер создаст сессию
        const userData = await fetchCurrentUser(); // 🧠 затем получаем user из сессии
        return userData;
      },
      {
        pending: (state) => {
          state.status = "loading";
          state.loginErrorMessage = undefined;
        },
        fulfilled: (state, action) => {
          state.status = "idle";
          state.isAuthenticated = true;
          state.user = action.payload;
        },
        rejected: (state, action) => {
          state.status = "failed";
          state.isAuthenticated = false;
          state.user = null;
          state.loginErrorMessage = action.error?.message || "Login failed";
        },
      }
    ),

    user: create.asyncThunk(
      async () => {
        return await fetchCurrentUser(); // ⚙️ просто получаем текущего пользователя из сессии
      },
      {
        pending: () => {},
        fulfilled: (state, action) => {
          state.user = action.payload;
          state.isAuthenticated = true;
          state.isSessionChecked = true;
        },
        rejected: (state) => {
          state.user = null;
          state.isAuthenticated = false;
          state.isSessionChecked = true;
        },
      }
    ),

    logout: create.asyncThunk(
      async () => {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include", // обязательно для удаления сессии
        });
      },
      {
        fulfilled: (state) => {
          state.user = null;
          state.isAuthenticated = false;
        },
      }
    ),
  }),

  selectors: {
    selectUser: (userState) => userState.user,
    selectRoles: (userState) => userState.user?.role,
    selectIsAuthenticated: (userState) => userState.isAuthenticated,
    selectLoginError: (userState) => userState.loginErrorMessage,
    selectRegisterError: (userState) => userState.registerErrorMessage,
  },
});

export const { register, login, user, logout } = authSlice.actions;
export const { selectUser, selectRoles, selectIsAuthenticated, selectLoginError, selectRegisterError } = authSlice.selectors;