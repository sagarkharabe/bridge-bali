import { FETCH_LEVEL_BY_ID } from "../actions/types";

const initialState = {
  levelId: null,
  dateCreated: null,
  starCount: null,
  title: null,
  creator: null,
  levelLoaded: false
};

export default function(state = initialState, action) {
  switch (action.type) {
    case FETCH_LEVEL_BY_ID:
      const { creator, _id, starCount, title, dateCreated } = action.payload;
      return {
        ...state,
        levelId: _id,
        dateCreated: dateCreated,
        starCount: starCount,
        title: title,
        creator: creator,
        levelLoaded: true
      };
    default:
      return {
        ...state
      };
  }
}
