import { combineReducers } from "redux";
import authReducer from "./authReducer";
import userLevelReducer from "./userLevelReducer";
import usersReducer from "./usersReducer";
export default combineReducers({
  auth: authReducer,
  userLevels: userLevelReducer,
  profile: usersReducer
});
