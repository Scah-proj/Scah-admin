import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  profile: null,
  profilePicture: null,
  completeness: 0,
  loading: false,
  error: null,
};

const profileSlice = createSlice({
  name: "profile",

  initialState,

  reducers: {
    // Store entire profile
    setProfile: (state, action) => {
      state.profile = action.payload;

      state.profilePicture =
        action.payload?.profilePicture ||
        action.payload?.media?.profilePicture ||
        null;
    },

    // Update profile locally
    updateProfile: (state, action) => {
      state.profile = {
        ...state.profile,
        ...action.payload,
      };

      if (
        action.payload.profilePicture ||
        action.payload?.media?.profilePicture
      ) {
        state.profilePicture =
          action.payload.profilePicture ||
          action.payload.media.profilePicture;
      }
    },

    // Update only profile picture
    setProfilePicture: (state, action) => {
      state.profilePicture = action.payload;

      if (state.profile) {
        state.profile.profilePicture = action.payload;
      }
    },

    // Profile completeness
    setProfileCompleteness: (state, action) => {
      state.completeness = action.payload;
    },

    // Loading
    setProfileLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Error
    setProfileError: (state, action) => {
      state.error = action.payload;
    },

    // Clear everything
    clearProfile: (state) => {
      state.profile = null;
      state.profilePicture = null;
      state.completeness = 0;
      state.loading = false;
      state.error = null;
    },

    // Clear only picture
    clearProfilePicture: (state) => {
      state.profilePicture = null;

      if (state.profile) {
        state.profile.profilePicture = null;
      }
    },
  },
});

export const {
  setProfile,
  updateProfile,
  setProfilePicture,
  clearProfilePicture,
  setProfileCompleteness,
  setProfileLoading,
  setProfileError,
  clearProfile,
} = profileSlice.actions;

export default profileSlice.reducer;