import { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../redux/createAppSlice";
import { HttpError } from "../../utils/handleFetchError";
import { fetchChangePassword, fetchEditUser, fetchLogin, fetchLogout, fetchRefreshToken, fetchRegister, fetchUpdateUserRole, fetchUser, fetchUserProfile, fetchUsers } from "./api";
import { AuthRequestDto, AuthState, ChangePasswordDto, NewUserDto, Role, UpdateUserDto, UserDto, } from "./types";
import { getCompany } from "../company/companiesSlice";

const initialState: AuthState = {
  usersList: [],
  user: null,
  accessToken: null,
  status: "idle",
  error: null,
  loginErrorMessage: undefined,
  registerErrorMessage: undefined,
  isSessionChecked: false,
  isAuthenticated: false,
};

export const authSlice = createAppSlice({
  name: "auth",
  initialState,
  reducers: (create) => ({

    register: create.asyncThunk<UserDto, NewUserDto>(
      (newUser) => fetchRegister(newUser),
      {
        pending: (state) => {
          state.status = "loading";
          state.registerErrorMessage = undefined;
        },
        fulfilled: (state) => {
          state.status = "idle";
        },
        rejected: (state, action) => {
          state.status = "failed";
          state.registerErrorMessage = action.error?.message || "Registration failed";
        },
      }
    ),

    setSessionChecked: create.reducer(
      (state: AuthState, action: PayloadAction<boolean>) => {
        state.isSessionChecked = action.payload;
      }
    ),

    login: create.asyncThunk<UserDto, AuthRequestDto>(
      async (credentials, { dispatch }) => {
        const authResponse = await fetchLogin(credentials);

        // сохраняем accessToken и refreshToken в localStorage для последующих запросов
        localStorage.setItem("accessToken", authResponse.accessToken);
        localStorage.setItem("refreshToken", authResponse.refreshToken);

        // Загружаем профиль пользователя
        const userProfile = await fetchUserProfile();

        // Загружаем данные компании сразу после login
        await dispatch(getCompany());

        return userProfile;
      },
      {
        pending: (state) => {
          state.status = "loading";
          state.loginErrorMessage = undefined;
        },
        fulfilled: (state, action) => {
          state.status = "idle";
          state.user = action.payload;
          state.isAuthenticated = true;
          state.accessToken = localStorage.getItem("accessToken"); // можно хранить в state
        },
        rejected: (state, action) => {
          state.status = "failed";
          state.user = null;
          state.isAuthenticated = false;
          state.isSessionChecked = true;
          state.accessToken = null;
          state.loginErrorMessage = action.error?.message || "Login failed";
        },
      }
    ),

    refresh: create.asyncThunk<UserDto>(
      async (_, { dispatch }) => {
        try {
          const authResponse = await fetchRefreshToken();
          localStorage.setItem("accessToken", authResponse.accessToken);
          localStorage.setItem("refreshToken", authResponse.refreshToken);
          const userProfile = await fetchUserProfile();

          // Загружаем компанию после refresh
          await dispatch(getCompany());

          return userProfile;
        } catch (err: any) {
          if (err instanceof HttpError && (err.status === 401 || err.status === 403)) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            dispatch(logout());
          }

          throw err;
        }
      },
      {
        pending: (state) => {
          state.status = "loading";
        },
        fulfilled: (state, action) => {
          state.user = action.payload;
          state.isAuthenticated = true;
          state.isSessionChecked = true;
          state.accessToken = localStorage.getItem("accessToken");
          state.status = "idle";
        },
        rejected: (state) => {
          state.user = null;
          state.isAuthenticated = false;
          state.isSessionChecked = true;
          state.accessToken = null;
          state.status = "idle";
        },
      }
    ),

    logout: create.asyncThunk<void>(
      async () => {
        await fetchLogout();
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
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
          state.accessToken = null;
        },
      }
    ),

    getAllUsers: create.asyncThunk<UserDto[]>(
      () => fetchUsers(),
      {
        pending: (state) => {
          state.status = "loading";
        },
        fulfilled: (state, action) => {
          state.status = "idle";
          state.usersList = action.payload;
        },
        rejected: (state, action) => {
          state.status = "failed";
          state.error = action.error?.message || "Users list fetch failed";
        },
      }
    ),

    getUser: create.asyncThunk<UserDto, { id: number }>(
      ({ id }) => fetchUser(id),
      {
        pending: (state) => {
          state.status = "loading";
          state.error = null;
        },
        fulfilled: (state, action) => {
          state.status = "idle";
          state.user = action.payload;
        },
        rejected: (state, action) => {
          state.status = "failed";
          state.error = action.error?.message || "Fehler beim Laden des Benutzer.";
        },
      }
    ),

    updateUser: create.asyncThunk<UserDto, { id: number; updateUserDto: UpdateUserDto }>(
      ({ id, updateUserDto }) => fetchEditUser(id, updateUserDto),
      {
        pending: (state) => {
          state.status = "loading";
          state.error = null;
        },
        fulfilled: (state, action) => {
          state.status = "idle";
          state.user = action.payload;
          const index = state.usersList.findIndex(u => u.id === action.payload.id);
          if (index !== -1) {
            state.usersList[index] = action.payload; // обновляем в списке
          }
        },
        rejected: (state, action) => {
          state.status = "failed";
          state.error = action.error?.message || "Fehler beim Laden des Benutzer.";
        },
      }
    ),

    updateUserRole: create.asyncThunk<UserDto, { id: number; role: Role }>(
      ({ id, role }) => fetchUpdateUserRole(id, role),
      {
        pending: (state) => {
          state.status = "loading";
        },
        fulfilled: (state, action) => {
          state.status = "idle";
          const index = state.usersList.findIndex(u => u.id === action.payload.id);
          if (index !== -1) state.usersList[index] = action.payload;
        },
        rejected: (state, action) => {
          state.status = "failed";
          state.error = action.error?.message || "Update role failed";
        },
      }
    ),
    changePassword: create.asyncThunk<UserDto, { id: number; dto: ChangePasswordDto }>(
      ({ id, dto }) => fetchChangePassword(id, dto),
      {
        pending: (state) => {
          state.status = "loading";
          state.error = null;
        },
        fulfilled: (state, action) => {
          state.status = "idle";
          state.user = action.payload; // обновим текущего юзера
        },
        rejected: (state, action) => {
          state.status = "failed";
          state.error = action.error?.message || "Fehler beim Ändern des Passworts.";
        },
      }
    ),
  }),

  selectors: {
    selectUsers: (state) => state.usersList,
    selectUser: (state) => state.user,
    selectRoles: (state) => state.user?.role,
    selectAccessToken: (state) => state.accessToken,
    selectIsAuthenticated: (state) => state.isAuthenticated,
    selectStatus: (state) => state.status,
    selectError: (state) => state.error,
    selectLoginError: (state) => state.loginErrorMessage,
    selectRegisterError: (state) => state.registerErrorMessage,
    selectSessionChecked: (state) => state.isSessionChecked,
  },
});

export const {
  register,
  login,
  refresh,
  setSessionChecked,
  logout,
  getAllUsers,
  getUser,
  updateUser,
  updateUserRole,
  changePassword,
} = authSlice.actions;

export const {
  selectUsers,
  selectUser,
  selectRoles,
  selectAccessToken,
  selectIsAuthenticated,
  selectStatus,
  selectError,
  selectLoginError,
  selectRegisterError,
  selectSessionChecked,
} = authSlice.selectors;