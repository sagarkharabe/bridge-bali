import axios from "axios";
import { FETCH_OWN_PROFILE, FETCH_PROFILE_LEVELS } from "./types";
export const fetchOwnProfile = () => async dispatch => {
  try {
    const res = await axios.get("/api/users/profile");
    dispatch({ type: FETCH_OWN_PROFILE, payload: res.data });
  } catch (err) {
    console.log("Errrorr ata fetchingOwnProfile -- ", err);
  }
};

export const fetchProfileLevels = (leveltype, page) => async dispatch => {
  try {
    const res = await axios.get("/api/users/profile/levels", {
      params: {
        levelType: leveltype,
        page: page
      }
    });
    dispatch({
      type: FETCH_PROFILE_LEVELS,
      payload: res.data,
      levelType: leveltype
    });
  } catch (err) {
    console.log("Errrorr ata fetchingOwnProfile -- ", err);
  }
};
