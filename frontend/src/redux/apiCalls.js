import { loginstart as donorStart, loginsuccess as donorSuccess, loginfailure as donorFailure } from './donorRedux.js';
import { loginstart as hospitalStart, loginsuccess as hospitalSuccess, loginfailure as hospitalFailure } from './hospitalRedux';
import { loginstart as adminStart, loginsuccess as adminSuccess, loginfailure as adminFailure } from './adminRedux';
import { publicRequest } from '../requestMethods.js';

export const Adminlogin = async (dispatch, user) => {
  dispatch(adminStart());
  
  try {
   console.log("Sending login data:", user);
     const res = await publicRequest.post("/admin/adminlogin", user);
     console.log(res.data);
     dispatch(adminSuccess(res.data));
  } catch (error) {
     dispatch(adminFailure());
  }
};

export const Donorlogin = async (dispatch, user) => {
  dispatch(donorStart());
  
  try {
     const res = await publicRequest.post("/donors/donorlogin", user);
     console.log(res.data);
     dispatch(donorSuccess(res.data));
  } catch (error) {
     dispatch(donorFailure());
  }
};

export const Hospitallogin = async (dispatch, user) => {
  dispatch(hospitalStart());
  
  try {
     const res = await publicRequest.post("/hospitals/hospitallogin", user);
     console.log(res.data);
     dispatch(hospitalSuccess(res.data));
  } catch (error) {
     dispatch(hospitalFailure());
  }
};
