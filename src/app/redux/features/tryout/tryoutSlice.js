import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tryouts: [],
  filteredTryouts: [],
  selectedTryout: null,

  loading: false,
  error: null,

  // Create
  creating: false,
  createSuccess: false,
  createError: null,

  // Update
  updating: false,
  updateSuccess: false,
  updateError: null,

  // Delete
  deleting: false,
  deleteSuccess: false,
  deleteError: null,

  searchQuery: "",

  // ---------------- Apply ----------------
  applying: false,
  applySuccess: false,
  applyError: null,

  // ---------------- Withdraw ----------------
  withdrawing: false,
  withdrawSuccess: false,
  withdrawError: null,

  // ---------------- Applicants ----------------
  applicants: [],
  applicantsTotal: 0,
  applicantsLoading: false,
  applicantsError: null,

  // ---------------- Applicant Status Update ----------------
  updatingApplicationStatus: false,
  updateApplicationStatusSuccess: false,
  updateApplicationStatusError: null,

  // ---------------- Save / Unsave ----------------
  saving: false,
  saveSuccess: false,
  saveError: null,

  // ---------------- Saved Tryouts List ----------------
  savedTryouts: [],
  savedTryoutsTotal: 0,
  savedTryoutsLoading: false,
  savedTryoutsError: null,
};

const tryoutSlice = createSlice({
  name: "tryout",

  initialState,

  reducers: {
    setTryouts: (state, action) => {
      state.tryouts = action.payload;
    },

    setFilteredTryouts: (state, action) => {
      state.filteredTryouts = action.payload;
    },

    setSelectedTryout: (state, action) => {
      state.selectedTryout = action.payload;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    // ---------------- Create ----------------

    setCreating: (state, action) => {
      state.creating = action.payload;
    },

    setCreateSuccess: (state, action) => {
      state.createSuccess = action.payload;
    },

    setCreateError: (state, action) => {
      state.createError = action.payload;
    },

    // ---------------- Update ----------------

    setUpdating: (state, action) => {
      state.updating = action.payload;
    },

    setUpdateSuccess: (state, action) => {
      state.updateSuccess = action.payload;
    },

    setUpdateError: (state, action) => {
      state.updateError = action.payload;
    },

    // ---------------- Delete ----------------

    setDeleting: (state, action) => {
      state.deleting = action.payload;
    },

    setDeleteSuccess: (state, action) => {
      state.deleteSuccess = action.payload;
    },

    setDeleteError: (state, action) => {
      state.deleteError = action.payload;
    },

    // ---------------- Search ----------------

    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },

    // ---------------- Apply ----------------

    setApplying: (state, action) => {
      state.applying = action.payload;
    },

    setApplySuccess: (state, action) => {
      state.applySuccess = action.payload;
    },

    setApplyError: (state, action) => {
      state.applyError = action.payload;
    },

    // ---------------- Withdraw ----------------

    setWithdrawing: (state, action) => {
      state.withdrawing = action.payload;
    },

    setWithdrawSuccess: (state, action) => {
      state.withdrawSuccess = action.payload;
    },

    setWithdrawError: (state, action) => {
      state.withdrawError = action.payload;
    },

    // ---------------- Applicants ----------------

    setApplicants: (state, action) => {
      state.applicants = action.payload;
    },

    setApplicantsTotal: (state, action) => {
      state.applicantsTotal = action.payload;
    },

    setApplicantsLoading: (state, action) => {
      state.applicantsLoading = action.payload;
    },

    setApplicantsError: (state, action) => {
      state.applicantsError = action.payload;
    },

    // ---------------- Applicant Status Update ----------------

    setUpdatingApplicationStatus: (state, action) => {
      state.updatingApplicationStatus = action.payload;
    },

    setUpdateApplicationStatusSuccess: (state, action) => {
      state.updateApplicationStatusSuccess = action.payload;
    },

    setUpdateApplicationStatusError: (state, action) => {
      state.updateApplicationStatusError = action.payload;
    },

    // ---------------- Save / Unsave ----------------

    setSaving: (state, action) => {
      state.saving = action.payload;
    },

    setSaveSuccess: (state, action) => {
      state.saveSuccess = action.payload;
    },

    setSaveError: (state, action) => {
      state.saveError = action.payload;
    },

    updateTryoutSavedState: (state, action) => {
      const { tryoutId, saved, count } = action.payload;

      const patch = (tryout) => {
        if (tryout && (tryout._id === tryoutId || tryout.id === tryoutId)) {
          tryout.isSaved = saved;
          if (count !== undefined) tryout.savedCount = count;
        }
        return tryout;
      };

      state.tryouts = state.tryouts.map(patch);
      state.filteredTryouts = state.filteredTryouts.map(patch);
      if (state.selectedTryout) {
        state.selectedTryout = patch({ ...state.selectedTryout });
      }
    },

    // ---------------- Saved Tryouts List ----------------

    setSavedTryouts: (state, action) => {
      state.savedTryouts = action.payload;
    },

    setSavedTryoutsTotal: (state, action) => {
      state.savedTryoutsTotal = action.payload;
    },

    setSavedTryoutsLoading: (state, action) => {
      state.savedTryoutsLoading = action.payload;
    },

    setSavedTryoutsError: (state, action) => {
      state.savedTryoutsError = action.payload;
    },

    // ---------------- Reset ----------------

    resetTryoutState: (state) => {
      state.loading = false;
      state.error = null;

      state.creating = false;
      state.createSuccess = false;
      state.createError = null;

      state.updating = false;
      state.updateSuccess = false;
      state.updateError = null;

      state.deleting = false;
      state.deleteSuccess = false;
      state.deleteError = null;

      state.selectedTryout = null;
      state.filteredTryouts = [];
      state.searchQuery = "";

      state.applying = false;
      state.applySuccess = false;
      state.applyError = null;

      state.withdrawing = false;
      state.withdrawSuccess = false;
      state.withdrawError = null;

      state.applicants = [];
      state.applicantsTotal = 0;
      state.applicantsLoading = false;
      state.applicantsError = null;

      state.updatingApplicationStatus = false;
      state.updateApplicationStatusSuccess = false;
      state.updateApplicationStatusError = null;

      state.saving = false;
      state.saveSuccess = false;
      state.saveError = null;

      state.savedTryouts = [];
      state.savedTryoutsTotal = 0;
      state.savedTryoutsLoading = false;
      state.savedTryoutsError = null;
    },
  },
});

export const {
  setTryouts,
  setFilteredTryouts,
  setSelectedTryout,
  setLoading,
  setError,
  setCreating,
  setCreateSuccess,
  setCreateError,
  setUpdating,
  setUpdateSuccess,
  setUpdateError,
  setDeleting,
  setDeleteSuccess,
  setDeleteError,
  setSearchQuery,
  setApplying,
  setApplySuccess,
  setApplyError,
  setWithdrawing,
  setWithdrawSuccess,
  setWithdrawError,
  setApplicants,
  setApplicantsTotal,
  setApplicantsLoading,
  setApplicantsError,
  setUpdatingApplicationStatus,
  setUpdateApplicationStatusSuccess,
  setUpdateApplicationStatusError,
  setSaving,
  setSaveSuccess,
  setSaveError,
  updateTryoutSavedState,
  setSavedTryouts,
  setSavedTryoutsTotal,
  setSavedTryoutsLoading,
  setSavedTryoutsError,
  resetTryoutState,
} = tryoutSlice.actions;

export default tryoutSlice.reducer;