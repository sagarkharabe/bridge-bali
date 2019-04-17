import axios from "axios";
import { FETCH_LEVEL_BY_ID } from "./types";
export const fetchLevelById = levelId => async dispatch => {
  try {
    const res = await axios.get("/api/levels/" + levelId);
    dispatch({ type: FETCH_LEVEL_BY_ID, payload: res.data });
  } catch (err) {
    console.log("error at fetching level by Id ", err);
  }
};
