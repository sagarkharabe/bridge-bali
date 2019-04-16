import { FETCH_DRAFTS, FETCH_PUBLISHED_LEVELS } from "../actions/types";

const initialState = {
  drafts: [],
  publishedLevels: []
};

export default function(state = initialState, action) {
  switch (action.type) {
    case FETCH_DRAFTS:
      return {
        ...state,
        drafts: action.payload
      };
    case FETCH_PUBLISHED_LEVELS:
      return {
        ...state,
        publishedLevels: action.payload
      };
    default:
      return state;
  }
}
