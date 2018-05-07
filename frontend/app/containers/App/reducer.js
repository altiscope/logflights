/*
 *
 * AppReducer
 *
 */

import { fromJS } from 'immutable';
import { GET_CURRENT_USER_FULFILLED, LOGOUT } from 'containers/PlannerWrapper/constants';
import { LOGIN_FULFILLED } from '../LoginPage/constants';

// The initial state of the App
const initialState = fromJS({
  userProfileLoaded: false,
  currentUser: {
    id: '',
    username: '',
    email: '',
    token: '',
  },
});

function appReducer(state = initialState, action) {
  switch (action.type) {
    case LOGIN_FULFILLED:
    case GET_CURRENT_USER_FULFILLED:
      return state.set('currentUser', fromJS(action.payload.user));

    case LOGOUT:
      localStorage.removeItem('token');
      return state.set('currentUser', initialState.get('currentUser'));

    default:
      return state;
  }
}

export default appReducer;
