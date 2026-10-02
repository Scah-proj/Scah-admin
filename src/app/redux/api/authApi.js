import { baseApi } from "../../redux/api/baseurl";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Register
    register: builder.mutation({
      query: (userData) => ({
        url: "api/auth/register",
        method: "POST",
        body: userData,
      }),
    }),

    // Login
    login: builder.mutation({
      query: (credentials) => ({
        url: "api/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),

    // Verify 2FA Login
    verify2FA: builder.mutation({
      query: (data) => ({
        url: "api/auth/login/verify-2fa",
        method: "POST",
        body: data, 
      }),
    }),

    // Verify Email OTP
    verifyEmail: builder.mutation({
      query: (data) => ({
        url: "api/auth/verify-email",
        method: "POST",
        body: data,
      }),
    }),

    // Resend Verification Code
    resendVerification: builder.mutation({
      query: (data) => ({
        url: "api/auth/resend-verification",
        method: "POST",
        body: data,
      }),
    }),

    // Google Authentication
    googleAuth: builder.mutation({
      query: (data) => ({
        url: "api/auth/google",
        method: "POST",
        body: data,
      }),
    }),

    // Check Onboarding Status
    getOnboardingStatus: builder.query({
      query: () => ({
        url: "api/auth/onboarding-status",
        method: "GET",
      }),
    }),

    // Logout
    logout: builder.mutation({
      query: () => ({
        url: "api/auth/logout",
        method: "POST",
      }),
    }),

    // Forgot Password
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: "api/auth/forgot-password",
        method: "POST",
        body: data,
      }),
    }),

    // Reset Password
    resetPassword: builder.mutation({
      query: (data) => ({
        url: "api/auth/reset-password",
        method: "POST",
        body: data,
      }),
    }),
  }),

  overrideExisting: false,
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useVerify2FAMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useGoogleAuthMutation,
  useGetOnboardingStatusQuery,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;