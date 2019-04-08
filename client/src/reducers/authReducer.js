import { FETCH_USER, LOGIN_SUCCESS } from "../actions/types";

const initialState = {
  isAuthenticated: null,
  user: null
};
export default function(state = initialState, action) {
  switch (action.type) {
    case FETCH_USER:
      return action.payload || false;
    case LOGIN_SUCCESS:
      return {
        ...state,
        ...action.payload,
        isAuthenticated: true
      };
    default:
      return state;
  }
}
