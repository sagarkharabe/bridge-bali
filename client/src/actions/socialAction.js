import axios from "axios";
export const levelLiker = (levelId, func) => async dispatch => {
  try {
    const res = await axios.post("/api/levels/like", {
      args: levelId,
      func: func
    });
    console.log("level liker res ", res.data);
  } catch (err) {
    console.log("Error at level Liker ", err);
  }
};
