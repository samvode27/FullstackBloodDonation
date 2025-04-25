import {loginfailure, loginstart, loginsuccess} from './userRedux.js'
import {publicRequest} from '../requestMethods.js'

export const login = async (dispatch, user) => {
  dispatch(loginstart())  
  
  try {
     const res = await publicRequest.post("/auth/login", user);
     console.log(res.data)
     dispatch(loginsuccess(res.data))                                                                                                 
   } catch (error) {
     dispatch(loginfailure())  
   }
}