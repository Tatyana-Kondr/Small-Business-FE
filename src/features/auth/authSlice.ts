import { createAppSlice } from "../../redux/createAppSlice";
import { fetchCurrentUser, fetchLogin, fetchRegister } from "./api";
import { AuthState, UserCreateDto, UserLoginDto } from "./types";


const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  token: localStorage.getItem("token") || null,
  status: "idle",
  error: null,
  loginErrorMessage: undefined,
  registerErrorMessage: undefined,
};

export const authSlice = createAppSlice({
  name: "auth",
  initialState,
  reducers: (create) => ({
    register: create.asyncThunk(
      async (user: UserCreateDto) => {
        const response = await fetchRegister(user)
        return response
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
          state.token = null; // Возможно, нужно сохранять токен, если API возвращает его при регистрации
        },
        rejected: (state, action) => {
          state.status = "failed";
          state.registerErrorMessage = action.error?.message || "Registration failed";
        },
      }
    ),

    login: create.asyncThunk(
      async (user: UserLoginDto) => {
        return await fetchLogin(user);
      },
      {
        pending: (state) => {
          state.status = "loading";
          state.loginErrorMessage = undefined;
        },
        fulfilled: (state, action) => {
          state.status = "idle";
          state.isAuthenticated = true;
          state.token = action.payload.accessToken;
          localStorage.setItem("token", action.payload.accessToken);
        },
        rejected: (state, action) => {
          state.status = "failed";
          state.isAuthenticated = false;
          state.token = null;
          state.loginErrorMessage = action.error?.message || "Login failed";
        },
      }
    ),

    user: create.asyncThunk(
      async () => {
        const response = await fetchCurrentUser();
        return response;
      },
      {
        pending: (state) => {},
        fulfilled: (state, action) => {
          state.user = action.payload
        },
        rejected: state => {
          state.isAuthenticated = false;
          state.token = null;
        },
      },
    ),

    logout: create.reducer(state => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    }),
    
  }),

  selectors: {
    selectUser: userState => userState.user,
    selectRoles: userState => userState.user?.role,
    selectIsAuthenticated: userState => userState.isAuthenticated,
    selectLoginError: userState => userState.loginErrorMessage,
    selectRegisterError: userState => userState.registerErrorMessage,
    selectToken: userState => userState.token,
  },
});

export const { register, login, user, logout } = authSlice.actions;
export const { selectUser, selectRoles, selectIsAuthenticated, selectLoginError, selectRegisterError, selectToken } = authSlice.selectors;

