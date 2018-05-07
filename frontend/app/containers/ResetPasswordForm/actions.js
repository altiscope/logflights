/*
 *
 * ResetPasswordForm actions
 *
 */

import {
  RESET_PASSWORD,
  RESET_PASSWORD_PENDING,
  RESET_PASSWORD_FULFILLED,
} from './constants';

export function resetPassword(email) {
  return {
    type: RESET_PASSWORD,
    payload: { email },
  };
}

export function resetPasswordPending(isPending) {
  return {
    type: RESET_PASSWORD_PENDING,
    payload: { isPending },
  };
}

export function resetPasswordFulfilled() {
  return {
    type: RESET_PASSWORD_FULFILLED,
  };
}
