import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  privacy: null,
  notifications: null,
  isDeactivated: false,
  loading: false,
  error: null,
};

const settingsSlice = createSlice({
  name: "settings",

  initialState,

  reducers: {
    // Store the full settings response (from getAccountSettings)
    setSettings: (state, action) => {
      state.privacy = action.payload?.privacy ?? state.privacy;
      state.notifications = action.payload?.notifications ?? state.notifications;
      state.isDeactivated = action.payload?.isDeactivated ?? false;
    },

   
    setPrivacySettings: (state, action) => {
      state.privacy = action.payload;
    },

   
    updatePrivacySettingsLocal: (state, action) => {
      state.privacy = { ...state.privacy, ...action.payload };
    },

    setNotificationSettings: (state, action) => {
      state.notifications = action.payload;
    },

    updateNotificationSettingsLocal: (state, action) => {
      const updates = action.payload || {};
      const nestedKeys = [
        "newFollower",
        "postLiked",
        "postCommented",
        "profileViewed",
        "suggestions",
        "announcements",
        "weeklyDigest",
      ];

      const next = { ...state.notifications };

      Object.entries(updates).forEach(([key, value]) => {
        if (nestedKeys.includes(key) && value && typeof value === "object") {
          next[key] = { ...next[key], ...value };
        } else {
          next[key] = value;
        }
      });

      state.notifications = next;
    },

    setDeactivated: (state, action) => {
      state.isDeactivated = action.payload;
    },

    setSettingsLoading: (state, action) => {
      state.loading = action.payload;
    },

    setSettingsError: (state, action) => {
      state.error = action.payload;
    },

    clearSettings: (state) => {
      state.privacy = null;
      state.notifications = null;
      state.isDeactivated = false;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setSettings,
  setPrivacySettings,
  updatePrivacySettingsLocal,
  setNotificationSettings,
  updateNotificationSettingsLocal,
  setDeactivated,
  setSettingsLoading,
  setSettingsError,
  clearSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;