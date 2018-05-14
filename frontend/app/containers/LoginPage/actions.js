/*
 *
 * LoginPage actions
 *
 */

import { LOGIN_REQUEST, LOGIN_PENDING, LOGIN_FULFILLED, LOGIN_FAILED } from './constants';

export function loginRequest(username, password) {
  return {
    type: LOGIN_REQUEST,
    payload: {
      username,
      password,
    },
  };
}

export function loginPending(isPending) {
  return {
    type: LOGIN_PENDING,
    payload: { isPending },
  };
}

export function loginFailed(errorMessage) {
  return {
    type: LOGIN_FAILED,
    payload: { errorMessage },
  };
}

export function loginFulfilled(user) {
  return {
    type: LOGIN_FULFILLED,
    payload: { user },
  };
}
