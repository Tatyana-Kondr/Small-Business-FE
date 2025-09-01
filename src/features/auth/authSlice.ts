import { createAppSlice } from "../../redux/createAppSlice";
import { fetchCurrentUser, fetchLogin, fetchLogout, fetchRefresh, fetchRegister } from "./api";
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
        return await fetchRegister(user);
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
          state.registerErrorMessage =
            action.error?.message || "Registration failed";
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
          state.user = action.payload;
        },
        rejected: (state, action) => {
          state.status = "failed";
          state.isAuthenticated = false;
          state.user = null;
          state.loginErrorMessage =
            action.error?.message || "Login failed";
        },
      }
    ),

    user: create.asyncThunk(
      async () => {
        return await fetchCurrentUser();
      },
      {
        pending: (state) => {
          state.status = "loading";
        },
        fulfilled: (state, action) => {
          state.user = action.payload;
          state.isAuthenticated = true;
          state.isSessionChecked = true;
          state.status = "idle";
        },
        rejected: (state) => {
          state.user = null;
          state.isAuthenticated = false;
          state.isSessionChecked = true;
          state.status = "idle";
        },
      }
    ),

    logout: create.asyncThunk(
      async () => {
        await fetchLogout();
      },
      {
        fulfilled: (state) => {
          state.user = null;
          state.isAuthenticated = false;
          state.isSessionChecked = true;
          state.status = "idle";
          state.error = null;
          state.loginErrorMessage = undefined;
          state.registerErrorMessage = undefined;
        },
      }
    ),

    refresh: create.asyncThunk(
      async () => {
        const refreshed = await fetchRefresh();
        if (!refreshed) throw new Error("Refresh failed");
        return await fetchCurrentUser();
      },
      {
        pending: (state) => {
          state.status = "loading";
        },
        fulfilled: (state, action) => {
          state.user = action.payload;
          state.isAuthenticated = true;
          state.isSessionChecked = true;
          state.status = "idle";
        },
        rejected: (state) => {
          state.user = null;
          state.isAuthenticated = false;
          state.isSessionChecked = true;
          state.status = "idle";
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
    selectSessionChecked: (state) => state.isSessionChecked,
  },
});

export const { register, login, user, logout, refresh } = authSlice.actions;
export const { selectUser, selectRoles, selectIsAuthenticated, selectLoginError, selectRegisterError, selectSessionChecked } = authSlice.selectors;