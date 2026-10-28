import type { PayloadAction } from "@reduxjs/toolkit";

import { createAppSlice } from "../../redux/createAppSlice";

import {
  fetchChangePassword,
  fetchEditUser,
  fetchLogin,
  fetchLogout,
  fetchRegister,
  fetchUpdateUserRole,
  fetchUser,
  fetchUserProfile,
  fetchUsers,
} from "./api";

import type {
  AuthRequestDto,
  AuthState,
  ChangePasswordDto,
  NewUserDto,
  Role,
  UpdateUserDto,
  UserDto,
} from "./types";

import { getCompany } from "../company/companiesSlice";

import {
  clearSessionTokens,
  getAccessToken,
  getSessionVersion,
  isSessionCurrent,
  refreshSession,
  saveSession,
} from "./session";
import { ApiError, toApiError } from "../../utils/errors/apiError";
import { getApiErrorMessage } from "../../utils/errors/handleApiError";

const SESSION_ENDED = "Die Sitzung wurde beendet.";

type AuthRootState = {
  auth: AuthState;
};

const initialState: AuthState = {
  usersList: [],
  user: null,
  selectedUser: null,
  accessToken: null,
  status: "idle",
  error: null,
  loginErrorMessage: undefined,
  registerErrorMessage: undefined,
  isSessionChecked: false,
  isAuthenticated: false,
  initializationRequestId: null,
  initializationSessionVersion: null,
  loginRequestId: null,
};

// Проверяем, что запрос login всё ещё актуален
const isLoginRequestCurrent = (
  getState: () => unknown,
  requestId: string,
): boolean => {
  const state = getState() as AuthRootState;

  return state.auth.loginRequestId === requestId;
};

export const authSlice = createAppSlice({
  name: "auth",
  initialState,

  reducers: (create) => ({
    // --------------------------------------------------
    // REGISTER
    // --------------------------------------------------
    register: create.asyncThunk<UserDto, NewUserDto, { rejectValue: ApiError }>(
      async (newUser, { rejectWithValue }) => {
        try {
          return await fetchRegister(newUser);
        } catch (error) {
          return rejectWithValue(toApiError(error));
        }
      },
      {
        pending: (state) => {
          state.status = "loading";
          state.registerErrorMessage = undefined;
        },

        fulfilled: (state, action) => {
          state.status = "idle";
          state.usersList.push(action.payload);
        },

        rejected: (state, action) => {
          state.status = "failed";

          state.registerErrorMessage = getApiErrorMessage(
            action.payload ?? action.error,
            "Registrierung fehlgeschlagen.",
          );
        },
      },
    ),

    // --------------------------------------------------
    // SESSION CHECKED
    // --------------------------------------------------
    setSessionChecked: create.reducer(
      (state, action: PayloadAction<boolean>) => {
        state.isSessionChecked = action.payload;
      },
    ),

    // --------------------------------------------------
    // CLEAR AUTH
    // --------------------------------------------------
    clearAuth: create.reducer((state) => {
      state.user = null;
      state.selectedUser = null;
      state.usersList = [];
      state.accessToken = null;

      state.isAuthenticated = false;
      state.isSessionChecked = true;

      state.status = "idle";
      state.error = null;

      state.loginErrorMessage = undefined;
      state.registerErrorMessage = undefined;

      // Инвалидируем старые запросы
      state.loginRequestId = null;
      state.initializationRequestId = null;
      state.initializationSessionVersion = null;
    }),

    // --------------------------------------------------
    // LOGIN
    // --------------------------------------------------
    login: create.asyncThunk<UserDto, AuthRequestDto>(
      async (credentials, { dispatch, getState, requestId }) => {
        // Версия сессии перед началом login
        const startVersion = getSessionVersion();

        const authResponse = await fetchLogin(credentials);

        // Пока выполнялся login, пользователь мог выйти
        // или запустить другой login
        if (
          !isSessionCurrent(startVersion) ||
          !isLoginRequestCurrent(getState, requestId)
        ) {
          throw new Error(SESSION_ENDED);
        }

        saveSession(authResponse.accessToken, authResponse.refreshToken);
        localStorage.setItem("lastActivity", String(Date.now()));

        const loginVersion = getSessionVersion();

        try {
          const userProfile = await fetchUserProfile();

          if (
            !isSessionCurrent(loginVersion) ||
            !isLoginRequestCurrent(getState, requestId)
          ) {
            throw new Error(SESSION_ENDED);
          }

          // Загружаем компанию, не блокируя login
          void dispatch(getCompany());

          return userProfile;
        } catch (error) {
          // Не удаляем токены новой сессии
          if (
            isSessionCurrent(loginVersion) &&
            isLoginRequestCurrent(getState, requestId)
          ) {
            clearSessionTokens();
          }

          throw error;
        }
      },
      {
        pending: (state, action) => {
          state.status = "loading";
          state.loginErrorMessage = undefined;
          state.loginRequestId = action.meta.requestId;
        },

        fulfilled: (state, action) => {
          if (state.loginRequestId !== action.meta.requestId) {
            return;
          }

          const token = getAccessToken();

          if (!token) {
            state.status = "failed";
            state.isSessionChecked = true;
            state.loginRequestId = null;
            return;
          }

          state.status = "idle";
          state.user = action.payload;
          state.accessToken = token;

          state.isAuthenticated = true;
          state.isSessionChecked = true;

          state.loginRequestId = null;
        },

        rejected: (state, action) => {
          if (state.loginRequestId !== action.meta.requestId) {
            return;
          }

          state.status = "failed";
          state.user = null;
          state.accessToken = null;

          state.isAuthenticated = false;
          state.isSessionChecked = true;

          state.loginErrorMessage = action.error.message || "Login failed";

          state.loginRequestId = null;
        },
      },
    ),

    // --------------------------------------------------
    // INITIALIZE SESSION
    // --------------------------------------------------
    initializeSession: create.asyncThunk<UserDto>(
      async (_, { dispatch, getState, requestId }) => {
        const version = getSessionVersion();

        try {
          await refreshSession();

          if (!isSessionCurrent(version)) {
            throw new Error(SESSION_ENDED);
          }

          const userProfile = await fetchUserProfile();

          if (!isSessionCurrent(version)) {
            throw new Error(SESSION_ENDED);
          }

          const state = getState() as AuthRootState;

          if (state.auth.initializationRequestId !== requestId) {
            throw new Error(SESSION_ENDED);
          }

          void dispatch(getCompany());

          return userProfile;
        } catch (error) {
          // Очищаем только ту сессию,
          // которую пытались восстановить
          if (isSessionCurrent(version)) {
            clearSessionTokens();
            dispatch(clearAuth());
          }

          throw error;
        }
      },
      {
        pending: (state, action) => {
          state.status = "loading";
          state.isSessionChecked = false;

          state.initializationRequestId = action.meta.requestId;

          state.initializationSessionVersion = getSessionVersion();
        },

        fulfilled: (state, action) => {
          if (state.initializationRequestId !== action.meta.requestId) {
            return;
          }

          if (state.initializationSessionVersion !== getSessionVersion()) {
            return;
          }

          const token = getAccessToken();

          if (!token) {
            state.status = "idle";
            state.isSessionChecked = true;
            state.initializationRequestId = null;
            state.initializationSessionVersion = null;
            return;
          }

          state.user = action.payload;
          state.accessToken = token;

          state.isAuthenticated = true;
          state.isSessionChecked = true;
          state.status = "idle";

          state.initializationRequestId = null;
          state.initializationSessionVersion = null;
        },

        rejected: (state, action) => {
          if (state.initializationRequestId !== action.meta.requestId) {
            return;
          }

          state.status = "idle";
          state.isSessionChecked = true;

          state.user = null;
          state.accessToken = null;
          state.isAuthenticated = false;

          state.initializationRequestId = null;
          state.initializationSessionVersion = null;
        },
      },
    ),

    // --------------------------------------------------
    // REFRESH
    // --------------------------------------------------
    refresh: create.asyncThunk<string>(
      async () => {
        return refreshSession();
      },
      {
        fulfilled: (state, action) => {
          // Старый refresh не должен менять Redux
          // после logout или другого обновления токена
          if (state.isAuthenticated && getAccessToken() === action.payload) {
            state.accessToken = action.payload;
          }
        },
      },
    ),

    // --------------------------------------------------
    // LOGOUT
    // --------------------------------------------------

    logout: create.asyncThunk<void>(async (_, { dispatch }) => {
      const refreshToken = localStorage.getItem("refreshToken");

      // Сначала завершаем локальную сессию
      clearSessionTokens();
      dispatch(clearAuth());

      // Удаляем время последней активности
      localStorage.removeItem("lastActivity");

      // Уведомляем другие вкладки о выходе
      localStorage.setItem("forceLogout", String(Date.now()));

      // Затем завершаем серверную сессию
      if (refreshToken) {
        try {
          await fetchLogout(refreshToken);
        } catch (error) {
          console.warn("Server logout failed:", error);
        }
      }
    }),

    // --------------------------------------------------
    // GET ALL USERS
    // --------------------------------------------------

    getAllUsers: create.asyncThunk<UserDto[], void, { rejectValue: ApiError }>(
      async (_, { rejectWithValue }) => {
        try {
          return await fetchUsers();
        } catch (error) {
          return rejectWithValue(toApiError(error));
        }
      },
      {
        pending: (state) => {
          state.status = "loading";
          state.error = null;
        },

        fulfilled: (state, action) => {
          state.status = "idle";
          state.usersList = action.payload;
        },

        rejected: (state, action) => {
          state.status = "failed";
          state.error = getApiErrorMessage(
            action.payload ?? action.error,
            "Die Benutzerliste konnte nicht geladen werden.",
          );
        },
      },
    ),

    // --------------------------------------------------
    // GET USER
    // --------------------------------------------------

    getUser: create.asyncThunk<
      UserDto,
      { id: number },
      { rejectValue: ApiError }
    >(
      async ({ id }, { rejectWithValue }) => {
        try {
          return await fetchUser(id);
        } catch (error) {
          return rejectWithValue(toApiError(error));
        }
      },
      {
        pending: (state) => {
          state.status = "loading";
          state.error = null;
          state.selectedUser = null;
        },

        fulfilled: (state, action) => {
          state.status = "idle";
          state.selectedUser = action.payload;
        },

        rejected: (state, action) => {
          state.status = "failed";
          state.selectedUser = null;

          state.error = getApiErrorMessage(
            action.payload ?? action.error,
            "Der Benutzer konnte nicht geladen werden.",
          );
        },
      },
    ),

    // --------------------------------------------------
    // UPDATE USER
    // --------------------------------------------------

    updateUser: create.asyncThunk<
      UserDto,
      {
        id: number;
        updateUserDto: UpdateUserDto;
      },
      { rejectValue: ApiError }
    >(
      async ({ id, updateUserDto }, { rejectWithValue }) => {
        try {
          return await fetchEditUser(id, updateUserDto);
        } catch (error) {
          return rejectWithValue(toApiError(error));
        }
      },
      {
        pending: (state) => {
          state.status = "loading";
          state.error = null;
        },

        fulfilled: (state, action) => {
          state.status = "idle";

          const updatedUser = action.payload;

          // Обновляем пользователя в общем списке
          const index = state.usersList.findIndex(
            (user) => user.id === updatedUser.id,
          );

          if (index !== -1) {
            state.usersList[index] = updatedUser;
          }

          // Обновляем выбранного пользователя
          if (state.selectedUser?.id === updatedUser.id) {
            state.selectedUser = updatedUser;
          }

          // Обновляем текущего пользователя,
          // только если редактировали его собственную запись
          if (state.user?.id === updatedUser.id) {
            state.user = updatedUser;
          }
        },

        rejected: (state, action) => {
          state.status = "failed";
          state.error = getApiErrorMessage(
            action.payload ?? action.error,
            "Der Benutzer konnte nicht aktualisiert werden.",
          );
        },
      },
    ),

    // --------------------------------------------------
    // UPDATE USER ROLE
    // --------------------------------------------------

    updateUserRole: create.asyncThunk<
      UserDto,
      { id: number; role: Role },
      { rejectValue: ApiError }
    >(
      async ({ id, role }, { rejectWithValue }) => {
        try {
          return await fetchUpdateUserRole(id, role);
        } catch (error) {
          return rejectWithValue(toApiError(error));
        }
      },
      {
        pending: (state) => {
          state.status = "loading";
          state.error = null;
        },

        fulfilled: (state, action) => {
          state.status = "idle";

          const updatedUser = action.payload;

          // Обновляем пользователя в общем списке
          const index = state.usersList.findIndex(
            (user) => user.id === updatedUser.id,
          );

          if (index !== -1) {
            state.usersList[index] = updatedUser;
          }

          // Обновляем выбранного пользователя
          if (state.selectedUser?.id === updatedUser.id) {
            state.selectedUser = updatedUser;
          }

          // Обновляем текущего пользователя,
          // только если редактировали его собственную запись
          if (state.user?.id === updatedUser.id) {
            state.user = updatedUser;
          }
        },

        rejected: (state, action) => {
          state.status = "failed";
          state.error = getApiErrorMessage(
            action.payload ?? action.error,
            "Die Benutzerrolle konnte nicht geändert werden.",
          );
        },
      },
    ),

    // --------------------------------------------------
    // CHANGE PASSWORD
    // --------------------------------------------------

    changePassword: create.asyncThunk<
      UserDto,
      { id: number; dto: ChangePasswordDto },
      { rejectValue: ApiError }
    >(
      async ({ id, dto }, { rejectWithValue }) => {
        try {
          return await fetchChangePassword(id, dto);
        } catch (error) {
          return rejectWithValue(toApiError(error));
        }
      },
      {
        pending: (state) => {
          state.status = "loading";
          state.error = null;
        },

        fulfilled: (state, action) => {
          state.status = "idle";

          const updatedUser = action.payload;

          // Обновляем пользователя в общем списке
          const index = state.usersList.findIndex(
            (user) => user.id === updatedUser.id,
          );

          if (index !== -1) {
            state.usersList[index] = updatedUser;
          }

          // Обновляем выбранного пользователя
          if (state.selectedUser?.id === updatedUser.id) {
            state.selectedUser = updatedUser;
          }

          // Обновляем текущего пользователя,
          // только если редактировали его собственную запись
          if (state.user?.id === updatedUser.id) {
            state.user = updatedUser;
          }
        },

        rejected: (state, action) => {
          state.status = "failed";
          state.error = getApiErrorMessage(
            action.payload ?? action.error,
            "Das Passwort konnte nicht geändert werden.",
          );
        },
      },
    ),

    clearSelectedUser: create.reducer((state) => {
      state.selectedUser = null;
    }),
  }),

  selectors: {
    selectUsers: (state) => state.usersList,
    selectUser: (state) => state.user,
    selectSelectedUser: (state) => state.selectedUser,
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
  clearAuth,
  clearSelectedUser,
  initializeSession,
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
  selectSelectedUser,
  selectRoles,
  selectAccessToken,
  selectIsAuthenticated,
  selectStatus,
  selectError,
  selectLoginError,
  selectRegisterError,
  selectSessionChecked,
} = authSlice.selectors;
