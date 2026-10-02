import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activeFeed: "home",
  selectedPost: null,
  selectedComment: null,
  commentsOpen: false,

  creatingPost: false,
  createPostSuccess: false,
  createPostError: null,

  // Delete Post (ADDED)
  deletingPost: false,
  deletePostSuccess: false,
  deletePostError: null,

  // My Posts
  myPosts: [],
  loadingMyPosts: false,
  myPostsError: null,

  // Saved Posts
  savedPosts: [],
  loadingSavedPosts: false,
  savedPostsError: null,

  // Reposted Posts
  repostedPosts: [],
  loadingRepostedPosts: false,
  repostedPostsError: null,

  // Like Post
  likingPost: false,
  likePostSuccess: false,
  likePostError: null,

  // Save Post
  savingPost: false,
  savePostSuccess: false,
  savePostError: null,

  // Repost Post
  repostingPost: false,
  repostPostSuccess: false,
  repostPostError: null,
};

const feedSlice = createSlice({
  name: "feed",

  initialState,

  reducers: {
    setActiveFeed: (state, action) => {
      state.activeFeed = action.payload;
    },

    setSelectedPost: (state, action) => {
      state.selectedPost = action.payload;
    },

    setSelectedComment: (state, action) => {
      state.selectedComment = action.payload;
    },

    openComments: (state) => {
      state.commentsOpen = true;
    },

    closeComments: (state) => {
      state.commentsOpen = false;
    },

    setCreatingPost: (state, action) => {
      state.creatingPost = action.payload;
    },

    setCreatePostSuccess: (state, action) => {
      state.createPostSuccess = action.payload;
    },

    setCreatePostError: (state, action) => {
      state.createPostError = action.payload;
    },

    // ======================
    // Delete Post (ADDED)
    // ======================

    setDeletingPost: (state, action) => {
      state.deletingPost = action.payload;
    },

    setDeletePostSuccess: (state, action) => {
      state.deletePostSuccess = action.payload;
    },

    setDeletePostError: (state, action) => {
      state.deletePostError = action.payload;
    },

    // ======================
    // My Posts
    // ======================

    setMyPosts: (state, action) => {
      state.myPosts = action.payload;
    },

    setLoadingMyPosts: (state, action) => {
      state.loadingMyPosts = action.payload;
    },

    setMyPostsError: (state, action) => {
      state.myPostsError = action.payload;
    },

    // ======================
    // Saved Posts
    // ======================

    setSavedPosts: (state, action) => {
      state.savedPosts = action.payload;
    },

    setLoadingSavedPosts: (state, action) => {
      state.loadingSavedPosts = action.payload;
    },

    setSavedPostsError: (state, action) => {
      state.savedPostsError = action.payload;
    },

    // ======================
    // Reposted Posts
    // ======================

    setRepostedPosts: (state, action) => {
      state.repostedPosts = action.payload;
    },

    setLoadingRepostedPosts: (state, action) => {
      state.loadingRepostedPosts = action.payload;
    },

    setRepostedPostsError: (state, action) => {
      state.repostedPostsError = action.payload;
    },

    // ======================
    // Like Post
    // ======================

    setLikingPost: (state, action) => {
      state.likingPost = action.payload;
    },

    setLikePostSuccess: (state, action) => {
      state.likePostSuccess = action.payload;
    },

    setLikePostError: (state, action) => {
      state.likePostError = action.payload;
    },

    // ======================
    // Save Post
    // ======================

    setSavingPost: (state, action) => {
      state.savingPost = action.payload;
    },

    setSavePostSuccess: (state, action) => {
      state.savePostSuccess = action.payload;
    },

    setSavePostError: (state, action) => {
      state.savePostError = action.payload;
    },

    // ======================
    // Repost Post
    // ======================

    setRepostingPost: (state, action) => {
      state.repostingPost = action.payload;
    },

    setRepostPostSuccess: (state, action) => {
      state.repostPostSuccess = action.payload;
    },

    setRepostPostError: (state, action) => {
      state.repostPostError = action.payload;
    },

    resetFeed: (state) => {
      state.activeFeed = "home";
      state.selectedPost = null;
      state.selectedComment = null;
      state.commentsOpen = false;

      state.creatingPost = false;
      state.createPostSuccess = false;
      state.createPostError = null;

      state.deletingPost = false;
      state.deletePostSuccess = false;
      state.deletePostError = null;

      state.myPosts = [];
      state.loadingMyPosts = false;
      state.myPostsError = null;

      state.savedPosts = [];
      state.loadingSavedPosts = false;
      state.savedPostsError = null;

      state.repostedPosts = [];
      state.loadingRepostedPosts = false;
      state.repostedPostsError = null;

      state.likingPost = false;
      state.likePostSuccess = false;
      state.likePostError = null;

      state.savingPost = false;
      state.savePostSuccess = false;
      state.savePostError = null;

      state.repostingPost = false;
      state.repostPostSuccess = false;
      state.repostPostError = null;
    },
  },
});

export const {
  setActiveFeed,
  setSelectedPost,
  setSelectedComment,
  openComments,
  closeComments,
  setCreatingPost,
  setCreatePostSuccess,
  setCreatePostError,
  setDeletingPost,
  setDeletePostSuccess,
  setDeletePostError,
  setMyPosts,
  setLoadingMyPosts,
  setMyPostsError,
  setSavedPosts,
  setLoadingSavedPosts,
  setSavedPostsError,
  setRepostedPosts,
  setLoadingRepostedPosts,
  setRepostedPostsError,
  setLikingPost,
  setLikePostSuccess,
  setLikePostError,
  setSavingPost,
  setSavePostSuccess,
  setSavePostError,
  setRepostingPost,
  setRepostPostSuccess,
  setRepostPostError,

  resetFeed,
} = feedSlice.actions;

export default feedSlice.reducer;