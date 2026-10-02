import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Story Feed
  stories: [],
  feedStories: [],
  selectedStory: null,

  // Loading States
  loadingStories: false,
  loadingFeedStories: false,

  // Errors
  storiesError: null,
  feedStoriesError: null,

  // Create Story
  creatingStory: false,
  createStorySuccess: false,
  createStoryError: null,

  // Delete Story
  deletingStory: false,
  deleteStorySuccess: false,
  deleteStoryError: null,

  // View Story
  viewingStory: false,
  viewStorySuccess: false,
  viewStoryError: null,
};

const storySlice = createSlice({
  name: "story",

  initialState,

  reducers: {
    setStories: (state, action) => {
      state.stories = action.payload;
    },

    setFeedStories: (state, action) => {
      state.feedStories = action.payload;
    },

    setSelectedStory: (state, action) => {
      state.selectedStory = action.payload;
    },

    setLoadingStories: (state, action) => {
      state.loadingStories = action.payload;
    },

    setLoadingFeedStories: (state, action) => {
      state.loadingFeedStories = action.payload;
    },

    setStoriesError: (state, action) => {
      state.storiesError = action.payload;
    },

    setFeedStoriesError: (state, action) => {
      state.feedStoriesError = action.payload;
    },

    setCreatingStory: (state, action) => {
      state.creatingStory = action.payload;
    },

    setCreateStorySuccess: (state, action) => {
      state.createStorySuccess = action.payload;
    },

    setCreateStoryError: (state, action) => {
      state.createStoryError = action.payload;
    },

    setDeletingStory: (state, action) => {
      state.deletingStory = action.payload;
    },

    setDeleteStorySuccess: (state, action) => {
      state.deleteStorySuccess = action.payload;
    },

    setDeleteStoryError: (state, action) => {
      state.deleteStoryError = action.payload;
    },

    setViewingStory: (state, action) => {
      state.viewingStory = action.payload;
    },

    setViewStorySuccess: (state, action) => {
      state.viewStorySuccess = action.payload;
    },

    setViewStoryError: (state, action) => {
      state.viewStoryError = action.payload;
    },

    resetStoryState: (state) => {
      state.loadingStories = false;
      state.loadingFeedStories = false;

      state.storiesError = null;
      state.feedStoriesError = null;

      state.creatingStory = false;
      state.createStorySuccess = false;
      state.createStoryError = null;

      state.deletingStory = false;
      state.deleteStorySuccess = false;
      state.deleteStoryError = null;

      state.viewingStory = false;
      state.viewStorySuccess = false;
      state.viewStoryError = null;

      state.selectedStory = null;
    },
  },
});

export const {
  setStories,
  setFeedStories,
  setSelectedStory,

  setLoadingStories,
  setLoadingFeedStories,

  setStoriesError,
  setFeedStoriesError,

  setCreatingStory,
  setCreateStorySuccess,
  setCreateStoryError,

  setDeletingStory,
  setDeleteStorySuccess,
  setDeleteStoryError,

  setViewingStory,
  setViewStorySuccess,
  setViewStoryError,

  resetStoryState,
} = storySlice.actions;

export default storySlice.reducer;