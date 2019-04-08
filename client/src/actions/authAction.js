import axios from "axios";
import { FETCH_USER, LOGIN_SUCCESS } from "./types";

export const fetchUser = () => async dispatch => {
  const res = await axios.get("/auth/verify");
  dispatch({ type: FETCH_USER, payload: res.data });
};

export const login = () => async dispatch => {
  try {
    const res = await axios.get("/auth/google");
    console.log(res.data);
  } catch (err) {
    console.log("err at login action ", err);
  }
};
