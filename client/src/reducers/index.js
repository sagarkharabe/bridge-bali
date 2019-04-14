import { combineReducers } from "redux";
import authReducer from "./authReducer";
import userLevelReducer from "./userLevelReducer";
export default combineReducers({
  auth: authReducer,
  userLevels: userLevelReducer
});
