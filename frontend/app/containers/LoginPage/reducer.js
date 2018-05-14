/*
 *
 * LoginPage reducer
 *
 */

import { fromJS } from 'immutable';
import { LOGIN_FULFILLED, LOGIN_PENDING } from './constants';

const initialState = fromJS({
  loginPending: false,
  errorMessage: '',
});

function loginPageReducer(state = initialState, action) {
  switch (action.type) {
    case LOGIN_PENDING:
      return state.set('loginPending', action.payload.isPending);

    case LOGIN_FULFILLED:
      return state.set('loginPending', false).set('errorMessage', '');

    default:
      return state;
  }
}

export default loginPageReducer;
