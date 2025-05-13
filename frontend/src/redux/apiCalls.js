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
    const res = await publicRequest.post("/donors/signin", user);
    console.log(res.data);
    dispatch(donorSuccess(res.data));
  } catch (error) {
    dispatch(donorFailure());
  }
};

export const Hospitallogin = async (dispatch, user) => {
  dispatch(hospitalStart());

  try {
    const res = await publicRequest.post("/hospitals/signin", user);
    console.log(res.data);
    dispatch(hospitalSuccess(res.data));
  } catch (error) {
    dispatch(hospitalFailure());
  }
};

export const donorSendForgotPasswordCode = async (email) => {
  try {
    const res = await publicRequest.patch("/donors/sendforgotpasswordcode", { email });
    return res.data;
  } catch (err) {
    console.error("Error sending forgot password code:", err.response?.data || err.message);
    throw err;
  }
};

export const donorVerifyForgotPasswordCode = async (data) => {
  try {
    const res = await publicRequest.patch("/donors/verifyforgotpasswordcode", data);
    return res.data;
  } catch (err) {
    console.error("Error verifying forgot password code:", err.response?.data || err.message);
    throw err;
  }
};

export const hospitalSendForgotPasswordCode = async (email) => {
  try {
    const res = await publicRequest.patch("/hospitals/sendforgotpasswordcode", { email });
    return res.data;
  } catch (err) {
    console.error("Error sending forgot password code:", err.response?.data || err.message);
    throw err;
  }
};

export const hospitalVerifyForgotPasswordCode = async (data) => {
  try {
    const res = await publicRequest.patch("/hospitals/verifyforgotpasswordcode", data);
    return res.data;
  } catch (err) {
    console.error("Error verifying forgot password code:", err.response?.data || err.message);
    throw err;
  }
};




