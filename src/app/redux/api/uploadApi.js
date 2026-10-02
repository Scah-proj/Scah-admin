import { baseApi } from "../../redux/api/baseurl";

export const uploadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Upload Profile Picture
    uploadProfilePicture: builder.mutation({
      query: (formData) => ({
        url: "api/upload/profile-picture",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Gallery", "Profile"],
    }),

    // Upload Cover Photo
    uploadCoverPhoto: builder.mutation({
      query: (formData) => ({
        url: "api/upload/cover-photo",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Gallery", "Profile", "CoverPhoto"],
    }),

    // Upload Action Videos
    uploadActionVideos: builder.mutation({
      query: (formData) => ({
        url: "api/upload/action-videos",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Gallery"],
    }),

    // Upload Endorsement Video
    uploadEndorsementVideo: builder.mutation({
      query: (formData) => ({
        url: "api/upload/endorsement-video",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Gallery"],
    }),

    // Upload Documents
    uploadDocuments: builder.mutation({
      query: (formData) => ({
        url: "api/upload/documents",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Gallery"],
    }),

    // Upload Organization Banner
    uploadOrganizationBanner: builder.mutation({
      query: (formData) => ({
        url: "api/upload/organization-banner",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Gallery"],
    }),

    // Upload Multiple Fields
    uploadMultipleMedia: builder.mutation({
      query: (formData) => ({
        url: "api/upload/multiple",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Gallery", "Profile"],
    }),

    // Bulk Upload
    bulkUploadMedia: builder.mutation({
      query: (formData) => ({
        url: "api/upload/bulk-upload",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Gallery"],
    }),

    // Get My Cover Photo
    getMyCoverPhoto: builder.query({
      query: () => ({
        url: "api/upload/cover-photo",
        method: "GET",
      }),
      providesTags: ["CoverPhoto"],
    }),

    // Get Another User's Cover Photo (By User ID)
    getCoverPhoto: builder.query({
      query: (userId) => ({
        url: `api/upload/cover-photo/${userId}`,
        method: "GET",
      }),
      providesTags: (result, error, userId) => [{ type: "CoverPhoto", id: userId }],
    }),

    // Get User Gallery (Own)
    getOwnGallery: builder.query({
      query: () => ({
        url: "api/upload/gallery",
        method: "GET",
      }),
      providesTags: ["Gallery"],
    }),

    // Get User Gallery (By User ID)
    getUserGallery: builder.query({
      query: (userId) => ({
        url: `api/upload/gallery/${userId}`,
        method: "GET",
      }),
      providesTags: (result, error, userId) => [{ type: "Gallery", id: userId }],
    }),

    // Get File Info
    getFileInfo: builder.query({
      query: (fileId) => ({
        url: `api/upload/file/${encodeURIComponent(fileId)}`,
        method: "GET",
      }),
    }),

    // Delete Media by DB ID
    deleteMediaById: builder.mutation({
      query: (mediaId) => ({
        url: `api/upload/media/${mediaId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Gallery", "CoverPhoto"],
    }),

    // Delete File by Cloud Path ID
    deleteFileById: builder.mutation({
      query: (fileId) => ({
        url: `api/upload/file/${encodeURIComponent(fileId)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Gallery", "CoverPhoto"],
    }),
  }),

  overrideExisting: true,
});

export const {
  useUploadProfilePictureMutation,
  useUploadCoverPhotoMutation,
  useUploadActionVideosMutation,
  useUploadEndorsementVideoMutation,
  useUploadDocumentsMutation,
  useUploadOrganizationBannerMutation,
  useUploadMultipleMediaMutation,
  useBulkUploadMediaMutation,
  useGetMyCoverPhotoQuery,
  useGetCoverPhotoQuery,
  useGetOwnGalleryQuery,
  useGetUserGalleryQuery,
  useGetFileInfoQuery,
  useDeleteMediaByIdMutation,
  useDeleteFileByIdMutation,
} = uploadApi;