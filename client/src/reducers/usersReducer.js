import { FETCH_OWN_PROFILE, FETCH_PROFILE_LEVELS } from "../actions/types";

const initialState = {
  profile: null,
  isProfileLoaded: false,
  createdLevels: null,
  draftLevels: null,
  likedLevels: null,
  followingLevels: null
};

export default function(state = initialState, action) {
  switch (action.type) {
    case FETCH_OWN_PROFILE:
      return {
        ...state,
        profile: action.payload,
        isProfileLoaded: true
      };
    case FETCH_PROFILE_LEVELS:
      if (action.levelType === "created")
        return {
          ...state,
          createdLevels: action.payload
        };
      else if (action.levelType === "drafts")
        return {
          ...state,
          draftLevels: action.payload
        };
      else if (action.levelType === "liked")
        return {
          ...state,
          likedLevels: action.payload
        };
      else if (action.levelType === "following")
        return {
          ...state,
          followingLevels: action.payload
        };
    default:
      return {
        ...state
      };
  }
}
