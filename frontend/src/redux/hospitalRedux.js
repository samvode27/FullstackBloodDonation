import { createSlice } from '@reduxjs/toolkit';

const hospitalSlice = createSlice({
  name: 'hospital',
  initialState: {
    currentUser: null,       // ✅ FIXED key name here
    isFetching: false,
    error: false,
  },
  reducers: {
    loginstart: (state) => {
      state.isFetching = true;
    },
    loginsuccess: (state, action) => {
      state.isFetching = false;
      state.currentUser = action.payload; // ✅ This now matches initialState
      state.error = false;
    },
    loginfailure: (state) => {
      state.isFetching = false;
      state.error = true;
    },
    logout: (state) => {
      state.isFetching = false;
      state.currentUser = null; // ✅ This now works
      state.error = false;
    },
  },
});

export const { loginstart, loginsuccess, loginfailure, logout } = hospitalSlice.actions;
export default hospitalSlice.reducer;
