import {
  FETCH_USER,
  LOGIN_SUCCESS,
  AUTH_ERROR,
  LOGOUT_SUCCESS,
  LOGIN_FAIL
} from "../actions/types";

const initialState = {
  isAuthenticated: null,
  user: null,
  isLoaded: false
};
export default function(state = initialState, action) {
  switch (action.type) {
    case FETCH_USER:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.data,
        isLoaded: action.payload.isLoaded
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        ...action.payload,
        isAuthenticated: true
      };

    case AUTH_ERROR:
    case LOGOUT_SUCCESS:
    case LOGIN_FAIL:
      return {
        ...state,
        user: null,
        isAuthenticated: false
      };
    default:
      return state;
  }
}
