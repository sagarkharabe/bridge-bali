import { SUBMIT_LEVEL } from "./types";
import axios from "axios";
export const submitLevel = (
  objArr,
  title,
  girderCount,
  skyColor,
  isPublished,
  id
) => {
  console.log("id", id, "is published", isPublished);
  try {
    var map = {
      startGirders: girderCount,
      objects: objArr,
      skyColor: skyColor
    };
    var level = {
      title: title,
      map: map,
      published: isPublished || false
    };
    level = JSON.parse(JSON.stringify(level));
    if (!id || isPublished)
      return axios.post("/api/levels", level).then(res => res.data);
    else return axios.put("/api/levels/" + id, level).then(res => res.data);
  } catch (e) {
    console.error(e);
  }
};
