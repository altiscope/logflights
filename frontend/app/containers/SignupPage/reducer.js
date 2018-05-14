/*
 *
 * SignupPage reducer
 *
 */

import { fromJS } from 'immutable';
import { SIGNUP_PENDING, SIGNUP_FULFILLED } from './constants';

const initialState = fromJS({
  ui: {
    signupPending: false,
  },
  data: {
    user: {},
  },
});

function signupPageReducer(state = initialState, action) {
  switch (action.type) {
    case SIGNUP_PENDING:
      return state.setIn(['ui', 'signupPending'], action.payload.isPending);

    case SIGNUP_FULFILLED:
      return state.setIn(['data', 'user'], action.payload.user);

    default:
      return state;
  }
}

export default signupPageReducer;
