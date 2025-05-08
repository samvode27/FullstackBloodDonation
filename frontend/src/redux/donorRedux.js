import { createSlice } from '@reduxjs/toolkit'

const donorSlice = createSlice({
   name: "donor",
   
   initialState: {
      donorcurrentUser: null,
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
      }
   }
})

export const {loginstart, loginsuccess, loginfailure, logout} = donorSlice.actions;
export default donorSlice.reducer;