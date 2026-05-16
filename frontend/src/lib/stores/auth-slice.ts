import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { STORAGE_KEYS } from "@/lib/constants";
import type { User } from "@/types/api";

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  hydrated: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  hydrated: false,
};

const writeLS = (key: string, value: string | null) => {
  if (typeof window === "undefined") return;
  if (value === null) window.localStorage.removeItem(key);
  else window.localStorage.setItem(key, value);
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession: (
      state,
      action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      writeLS(STORAGE_KEYS.ACCESS_TOKEN, action.payload.accessToken);
      writeLS(STORAGE_KEYS.REFRESH_TOKEN, action.payload.refreshToken);
      writeLS(STORAGE_KEYS.USER, JSON.stringify(action.payload.user));
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      writeLS(STORAGE_KEYS.USER, JSON.stringify(action.payload));
    },
    clearSession: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      writeLS(STORAGE_KEYS.ACCESS_TOKEN, null);
      writeLS(STORAGE_KEYS.REFRESH_TOKEN, null);
      writeLS(STORAGE_KEYS.USER, null);
    },
    hydrate: (state) => {
      if (typeof window === "undefined") {
        state.hydrated = true;
        return;
      }
      state.accessToken = window.localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      state.refreshToken = window.localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      const userJson = window.localStorage.getItem(STORAGE_KEYS.USER);
      if (userJson) {
        try {
          state.user = JSON.parse(userJson) as User;
        } catch {
          state.user = null;
        }
      }
      state.hydrated = true;
    },
  },
});

export const { setSession, setUser, clearSession, hydrate } = authSlice.actions;
export default authSlice.reducer;
