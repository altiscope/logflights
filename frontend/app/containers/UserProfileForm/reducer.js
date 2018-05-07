/*
 *
 * UserProfileForm reducer
 *
 */

import { fromJS } from 'immutable';
import {
  GET_USER_PROFILE_PENDING,
  GET_USER_PROFILE_FULFILLED,
  UPDATE_USER_PROFILE_PENDING,
  UPDATE_USER_PROFILE_FULFILLED,
} from './constants';

const initialState = fromJS({
  ui: {
    getUserProfilePending: false,
    updateUserProfilePending: false,
  },
  data: {
    userProfile: {},
  },
});

function userProfileFormReducer(state = initialState, action) {
  switch (action.type) {
    case GET_USER_PROFILE_PENDING:
      return state.setIn(['ui', 'getUserProfilePending'], action.payload.isPending);

    case GET_USER_PROFILE_FULFILLED:
      return state
        .setIn(['ui', 'getUserProfilePending'], false)
        .setIn(['data', 'userProfile'], fromJS(action.payload.userProfile));

    case UPDATE_USER_PROFILE_PENDING:
      return state.setIn(['ui', 'updateUserProfilePending'], action.payload.isPending);

    case UPDATE_USER_PROFILE_FULFILLED:
      return state
        .setIn(['ui', 'updateUserProfilePending'], false)
        .setIn(['data', 'userProfile'], fromJS(action.payload.userProfile));

    default:
      return state;
  }
}

export default userProfileFormReducer;
