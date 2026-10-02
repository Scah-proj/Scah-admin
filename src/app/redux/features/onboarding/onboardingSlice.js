import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  role:
    typeof window !== "undefined"
      ? localStorage.getItem("onboarding_role")
      : null,

  currentStep:
    typeof window !== "undefined"
      ? Number(localStorage.getItem("onboarding_currentStep")) || 1
      : 1,

  onboardingCompleted:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("onboarding_completed") || "false")
      : false,

  progress:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("onboarding_progress") || "{}")
      : {},

  availableData:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("onboarding_data") || "null")
      : null,

  options:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("onboarding_options") || "null")
      : null,
};

const onboardingSlice = createSlice({
  name: "onboarding",

  initialState,

  reducers: {
    setOnboardingStatus: (state, action) => {
      const {
        role,
        currentStep,
        onboardingCompleted,
        progress,
        availableData,
      } = action.payload;

      state.role = role;
      state.currentStep = currentStep;
      state.onboardingCompleted = onboardingCompleted;
      state.progress = progress;
      state.availableData = availableData;

      localStorage.setItem("onboarding_role", role || "");

      localStorage.setItem(
        "onboarding_currentStep",
        String(currentStep ?? 1)
      );

      localStorage.setItem(
        "onboarding_completed",
        JSON.stringify(onboardingCompleted)
      );

      localStorage.setItem(
        "onboarding_progress",
        JSON.stringify(progress || {})
      );

      localStorage.setItem(
        "onboarding_data",
        JSON.stringify(availableData)
      );
    },

    setOnboardingOptions: (state, action) => {
      state.options = action.payload;

      localStorage.setItem(
        "onboarding_options",
        JSON.stringify(action.payload)
      );
    },

    updateCurrentStep: (state, action) => {
      state.currentStep = action.payload;

      localStorage.setItem(
        "onboarding_currentStep",
        String(action.payload)
      );
    },

    setRole: (state, action) => {
      state.role = action.payload;

      localStorage.setItem(
        "onboarding_role",
        action.payload
      );
    },

    completeOnboarding: (state) => {
      state.onboardingCompleted = true;

      localStorage.setItem(
        "onboarding_completed",
        JSON.stringify(true)
      );
    },

    resetOnboarding: (state) => {
      state.role = null;
      state.currentStep = 1;
      state.onboardingCompleted = false;
      state.progress = {};
      state.availableData = null;
      state.options = null;

      localStorage.removeItem("onboarding_role");
      localStorage.removeItem("onboarding_currentStep");
      localStorage.removeItem("onboarding_completed");
      localStorage.removeItem("onboarding_progress");
      localStorage.removeItem("onboarding_data");
      localStorage.removeItem("onboarding_options");
    },
  },
});

export const {
  setOnboardingStatus,
  setOnboardingOptions,
  updateCurrentStep,
  setRole,
  completeOnboarding,
  resetOnboarding,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;