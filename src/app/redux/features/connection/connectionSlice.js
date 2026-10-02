import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  suggestions: [],
  followers: [],
  following: [],
  mutualFollowers: [],
  notifications: [],

  connectionStatus: null,
  connectionCounts: {
    followers: 0,
    following: 0,
  },

  unreadNotificationCount: 0,

  loading: false,
  error: null,
};

const connectionSlice = createSlice({
  name: "connection",

  initialState,

  reducers: {
    setSuggestions: (state, action) => {
      state.suggestions = action.payload;
    },

    setFollowers: (state, action) => {
      state.followers = action.payload;
    },

    setFollowing: (state, action) => {
      state.following = action.payload;
    },

    setMutualFollowers: (state, action) => {
      state.mutualFollowers = action.payload;
    },

    setNotifications: (state, action) => {
      state.notifications = action.payload;
    },

    setConnectionStatus: (state, action) => {
      state.connectionStatus = action.payload;
    },

    setConnectionCounts: (state, action) => {
      state.connectionCounts = action.payload;
    },

    setUnreadNotificationCount: (state, action) => {
      state.unreadNotificationCount = action.payload;
    },

    setConnectionLoading: (state, action) => {
      state.loading = action.payload;
    },

    setConnectionError: (state, action) => {
      state.error = action.payload;
    },

    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadNotificationCount = 0;
    },

    resetConnections: (state) => {
      state.suggestions = [];
      state.followers = [];
      state.following = [];
      state.mutualFollowers = [];
      state.notifications = [];
      state.connectionStatus = null;
      state.connectionCounts = {
        followers: 0,
        following: 0,
      };
      state.unreadNotificationCount = 0;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setSuggestions,
  setFollowers,
  setFollowing,
  setMutualFollowers,
  setNotifications,
  setConnectionStatus,
  setConnectionCounts,
  setUnreadNotificationCount,
  setConnectionLoading,
  setConnectionError,
  clearNotifications,
  resetConnections,
} = connectionSlice.actions;

export default connectionSlice.reducer;