import { baseApi } from "../../redux/api/baseurl";


const unwrap = (response) => response?.data ?? response;

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Upload only profile picture
    uploadProfilePicture: builder.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append("profilePicture", file);

        return {
          url: "/api/upload/profile-picture",
          method: "POST",
          body: formData,
        };
      },
      transformResponse: unwrap,
      invalidatesTags: ["Profile"],
    }),

    // Get my profile
    getMyProfile: builder.query({
      query: () => ({
        url: "/api/profile",
        method: "GET",
      }),
      transformResponse: unwrap,
      providesTags: ["Profile"],
    }),

    // Get public profile
    getPublicProfile: builder.query({
      query: (userId) => ({
        url: `/api/profile/${userId}`,
        method: "GET",
      }),
      transformResponse: unwrap,
      providesTags: ["Profile"],
    }),

    // Update profile
    updateProfile: builder.mutation({
      query: (data) => {
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
          if (
            value !== undefined &&
            value !== null &&
            value !== ""
          ) {
            if (value instanceof File) {
              formData.append(key, value);
            } else if (Array.isArray(value)) {
              formData.append(key, JSON.stringify(value));
            } else if (typeof value === "object") {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, value);
            }
          }
        });

        return {
          url: "/api/profile",
          method: "PUT",
          body: formData,
        };
      },
      transformResponse: unwrap,
      invalidatesTags: ["Profile"],
    }),

    // Update one section
    updateProfileSection: builder.mutation({
      query: ({ sectionName, data }) => ({
        url: `/api/profile/section/${sectionName}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: unwrap,
      invalidatesTags: ["Profile"],
    }),

    // Profile completeness
    getProfileCompleteness: builder.query({
      query: () => ({
        url: "/api/profile/completeness",
        method: "GET",
      }),
      transformResponse: unwrap,
      providesTags: ["Profile"],
    }),

    // Add experience
    addExperience: builder.mutation({
      query: (data) => ({
        url: "/api/profile/experience",
        method: "POST",
        body: data,
      }),
      transformResponse: unwrap,
      invalidatesTags: ["Profile"],
    }),

    // Update experience
    updateExperience: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/profile/experience/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: unwrap,
      invalidatesTags: ["Profile"],
    }),

    // Delete experience
    deleteExperience: builder.mutation({
      query: (id) => ({
        url: `/api/profile/experience/${id}`,
        method: "DELETE",
      }),
      transformResponse: unwrap,
      invalidatesTags: ["Profile"],
    }),

    // Existing scouts endpoint
    getScouts: builder.query({
      query: () => ({
        url: "/api/scouts",
        method: "GET",
      }),
      transformResponse: unwrap,
      providesTags: ["Profile"],
    }),

    // All profiles directory (paginated)
    getAllProfiles: builder.query({
      query: ({ page = 1, limit = 20 } = {}) => ({
        url: `/api/profile/all?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      transformResponse: unwrap,
      providesTags: ["Profile"],
    }),

    // Search users by name — used for @ mention/tagging autocomplete
    searchUsers: builder.query({
      query: (q = "") => ({
        url: `/api/profile/search?q=${encodeURIComponent(q)}`,
        method: "GET",
      }),
      transformResponse: unwrap,
    }),
  }),

  overrideExisting: false,
});

export const {
  useUploadProfilePictureMutation,
  useGetMyProfileQuery,
  useGetPublicProfileQuery,
  useUpdateProfileMutation,
  useUpdateProfileSectionMutation,
  useGetProfileCompletenessQuery,
  useAddExperienceMutation,
  useUpdateExperienceMutation,
  useDeleteExperienceMutation,
  useGetScoutsQuery,
  useGetAllProfilesQuery,
  useLazySearchUsersQuery,
} = profileApi;