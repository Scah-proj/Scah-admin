import { baseApi } from "../../redux/api/baseurl";

export const onboardingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Status
    getOnboardingStatus: builder.query({
      query: () => ({
        url: "api/onboarding/status",
        method: "GET",
      }),
      providesTags: ["Onboarding"],
    }),

    // Options
    getOnboardingOptions: builder.query({
      query: () => ({
        url: "api/onboarding/options",
        method: "GET",
      }),
      providesTags: ["Onboarding"],
    }),

    // Profile
    getOnboardingProfile: builder.query({
      query: () => ({
        url: "api/onboarding/profile",
        method: "GET",
      }),
      providesTags: ["Onboarding"],
    }),

    // Step 1
    selectRole: builder.mutation({
      query: (body) => ({
        url: "api/onboarding/role",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Onboarding"],
    }),

    // Step 2
    updateBasicInfo: builder.mutation({
      query: (body) => ({
        url: "api/onboarding/basic-info",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Onboarding"],
    }),

    // Step 3
    updateLocation: builder.mutation({
      query: (body) => ({
        url: "api/onboarding/location",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Onboarding"],
    }),

    // Athlete Step 4
    updatePlayingLevel: builder.mutation({
      query: (body) => ({
        url: "api/onboarding/playing-level",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Onboarding"],
    }),

    // Scout Step 4
    updateScoutingLevel: builder.mutation({
      query: (body) => ({
        url: "api/onboarding/scouting-level",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Onboarding"],
    }),

    // Athlete Step 5
    updateActivityLevel: builder.mutation({
      query: (body) => ({
        url: "api/onboarding/activity-level",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Onboarding"],
    }),

    // Complete
    completeOnboarding: builder.mutation({
      query: () => ({
        url: "api/onboarding/complete",
        method: "POST",
      }),
      invalidatesTags: ["Onboarding"],
    }),

    // Skip
    skipOnboardingStep: builder.mutation({
      query: (body) => ({
        url: "api/onboarding/skip",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Onboarding"],
    }),
  }),

  overrideExisting: true,
});

export const {
  useGetOnboardingStatusQuery,
  useGetOnboardingOptionsQuery,
  useGetOnboardingProfileQuery,
  useSelectRoleMutation,
  useUpdateBasicInfoMutation,
  useUpdateLocationMutation,
  useUpdatePlayingLevelMutation,
  useUpdateScoutingLevelMutation,
  useUpdateActivityLevelMutation,
  useCompleteOnboardingMutation,
  useSkipOnboardingStepMutation,
} = onboardingApi;