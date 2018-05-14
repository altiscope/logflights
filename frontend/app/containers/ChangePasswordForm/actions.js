/*
 *
 * ChangePasswordForm actions
 *
 */

import { CHANGE_PASSWORD, CHANGE_PASSWORD_PENDING, CHANGE_PASSWORD_FULFILLED } from './constants';

// eslint-disable-next-line camelcase
export function changePassword({ old_password, new_password }) {
  return {
    type: CHANGE_PASSWORD,
    payload: { old_password, new_password },
  };
}

export function changePasswordPending(isPending) {
  return {
    type: CHANGE_PASSWORD_PENDING,
    payload: { isPending },
  };
}

export function changePasswordFulfilled() {
  return {
    type: CHANGE_PASSWORD_FULFILLED,
  };
}
