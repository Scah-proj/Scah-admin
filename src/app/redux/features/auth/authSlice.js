import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user"))
      : null,

  token:
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null,

  role:
    typeof window !== "undefined"
      ? localStorage.getItem("role")
      : null,

  onboarding:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("onboarding"))
      : null,

  athleteProfile:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("athleteProfile"))
      : null,

  scoutProfile:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("scoutProfile"))
      : null,

  requiresOnboarding:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("requiresOnboarding") || "false")
      : false,

  isAuthenticated:
    typeof window !== "undefined"
      ? !!localStorage.getItem("token")
      : false,
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    setCredentials: (state, action) => {
      const {
        user,
        token,
        role,
        onboarding,
        athleteProfile,
        scoutProfile,
        requiresOnboarding,
      } = action.payload;

      state.user = user;
      state.token = token;
      state.role = role || null;
      state.onboarding = onboarding || null;
      state.athleteProfile = athleteProfile || null;
      state.scoutProfile = scoutProfile || null;
      state.requiresOnboarding = requiresOnboarding ?? false;
      state.isAuthenticated = true;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (role) {
        localStorage.setItem("role", role);
      } else {
        localStorage.removeItem("role");
      }

      if (onboarding) {
        localStorage.setItem(
          "onboarding",
          JSON.stringify(onboarding)
        );
      } else {
        localStorage.removeItem("onboarding");
      }

      if (athleteProfile) {
        localStorage.setItem(
          "athleteProfile",
          JSON.stringify(athleteProfile)
        );
      } else {
        localStorage.removeItem("athleteProfile");
      }

      if (scoutProfile) {
        localStorage.setItem(
          "scoutProfile",
          JSON.stringify(scoutProfile)
        );
      } else {
        localStorage.removeItem("scoutProfile");
      }

      localStorage.setItem(
        "requiresOnboarding",
        JSON.stringify(requiresOnboarding ?? false)
      );
    },

    updateOnboardingStatus: (state, action) => {
      state.requiresOnboarding = action.payload.requiresOnboarding;
      state.onboarding = action.payload.onboarding;

      localStorage.setItem(
        "requiresOnboarding",
        JSON.stringify(action.payload.requiresOnboarding)
      );

      localStorage.setItem(
        "onboarding",
        JSON.stringify(action.payload.onboarding)
      );
    },

    updateAthleteProfile: (state, action) => {
      state.athleteProfile = action.payload;
      localStorage.setItem(
        "athleteProfile",
        JSON.stringify(action.payload)
      );
    },

    updateScoutProfile: (state, action) => {
      state.scoutProfile = action.payload;
      localStorage.setItem(
        "scoutProfile",
        JSON.stringify(action.payload)
      );
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.onboarding = null;
      state.athleteProfile = null;
      state.scoutProfile = null;
      state.requiresOnboarding = false;
      state.isAuthenticated = false;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.removeItem("onboarding");
      localStorage.removeItem("athleteProfile");
      localStorage.removeItem("scoutProfile");
      localStorage.removeItem("requiresOnboarding");
    },
  },
});

export const {
  setCredentials,
  updateOnboardingStatus,
  updateAthleteProfile,
  updateScoutProfile,
  logout,
} = authSlice.actions;

export default authSlice.reducer;