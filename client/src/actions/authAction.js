import axios from "axios";
import { FETCH_USER, LOGIN_SUCCESS, AUTH_ERROR } from "./types";

export const fetchUser = () => async dispatch => {
  try {
    const res = await axios.get("/auth/verify");
    dispatch({ type: FETCH_USER, payload: res.data });
  } catch (err) {
    console.log("err at fetch user action ", err);
    dispatch({ type: AUTH_ERROR });
  }
};
