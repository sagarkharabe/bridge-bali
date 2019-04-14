import axios from "axios";
import { FETCH_DRAFTS, FETCH_PUBLISHED_LEVELS } from "./types";

export const fetchDrafts = () => async dispatch => {
  try {
    const res = await axios.get("/api/levels/drafts/");
    dispatch({ type: FETCH_DRAFTS, payload: res.data.results });
  } catch (err) {
    console.log("Err at fetching drafts action ", err);
  }
};

// export const fetchPublishedLevels = () => async dispatch => {
//     try {
//         const res = await axios.get("/api/levels/")
//     }
// }
