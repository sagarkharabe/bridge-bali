import axios from "axios";
import { FETCH_USER, LOGIN_SUCCESS, AUTH_ERROR, LOGIN_FAIL } from "./types";

export const fetchUser = () => async dispatch => {
  try {
    const res = await axios.get("/auth/verify");
    dispatch({
      type: FETCH_USER,
      payload: {
        data: res.data,
        isLoaded: true
      }
    });
  } catch (err) {
    console.log("err at fetch user action ", err);
    dispatch({ type: AUTH_ERROR });
  }
};

export const login = () => async dispatch => {
  try {
    const res = await axios.get("/auth/google");
    console.log(res.data);
    dispatch({ type: LOGIN_SUCCESS, payload: res.data });
  } catch (err) {
    dispatch({ type: LOGIN_FAIL });
    // return errors
    dispatch({ type: AUTH_ERROR });
  }
};
