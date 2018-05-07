/*
 *
 *  PlannerWrapper Actions
 *
 */

import { LOGOUT, GET_CURRENT_USER, GET_CURRENT_USER_FULFILLED } from './constants';

export function logout() {
  return {
    type: LOGOUT,
  };
}

export function getCurrentUser() {
  return {
    type: GET_CURRENT_USER,
  };
}

export function getCurrentUserFulfilled(user) {
  return {
    type: GET_CURRENT_USER_FULFILLED,
    payload: { user },
  };
}
