/*
 *
 * SignupPage actions
 *
 */

import { SIGNUP, SIGNUP_FULFILLED, SIGNUP_PENDING } from './constants';

export function signup(user) {
  return {
    type: SIGNUP,
    payload: { user },
  };
}

export function signupFulFilled(user) {
  return {
    type: SIGNUP_FULFILLED,
    payload: { user },
  };
}

export function signupPending(isPending) {
  return {
    type: SIGNUP_PENDING,
    payload: { isPending },
  };
}
