import { FETCH_USER, LOGIN_SUCCESS, AUTH_ERROR } from "../actions/types";

const initialState = {
  isAuthenticated: null,
  user: null
};
export default function(state = initialState, action) {
  switch (action.type) {
    case FETCH_USER:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        ...action.payload,
        isAuthenticated: true
      };
    case AUTH_ERROR:
      return {
        ...state,
        user: null,
        isAuthenticated: false
      };
    default:
      return state;
  }
}
