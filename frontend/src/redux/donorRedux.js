import { createSlice } from '@reduxjs/toolkit'

const donorSlice = createSlice({
   name: "donor",

   initialState: {
      currentUser: null,
      isFetching: false,
      error: false
   },

   reducers: {
      loginstart: (state) => {
         state.isFetching = true
      },
      loginsuccess: (state, action) => {
         state.isFetching = false,
         state.currentUser = action.payload;
         state.error = false;
      },
      loginfailure: (state) => {
         state.isFetching = false,
            state.error = true;
      },
      logout: (state) => {
         state.isFetching = false,
            state.currentUser = null;
         state.error = false;
      },
      updateDonorSuccess: (state, action) => {
         state.currentUser = action.payload;
         state.isFetching = false;
         state.error = false;
      }
   }
})

export const { loginstart, loginsuccess, loginfailure, logout, updateDonorSuccess  } = donorSlice.actions;
export default donorSlice.reducer;