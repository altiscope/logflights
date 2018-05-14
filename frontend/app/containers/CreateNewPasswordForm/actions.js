/*
 *
 * CreateNewPasswordForm actions
 *
 */

import {
  CREATE_NEW_PASSWORD,
  CREATE_NEW_PASSWORD_PENDING,
  CREATE_NEW_PASSWORD_FULFILLED,
} from './constants';

// eslint-disable-next-line camelcase
export function createNewPassword({ new_password1, new_password2, token }) {
  return {
    type: CREATE_NEW_PASSWORD,
    payload: { new_password1, new_password2, token },
  };
}

export function createNewPasswordPending(isPending) {
  return {
    type: CREATE_NEW_PASSWORD_PENDING,
    payload: { isPending },
  };
}

export function createNewPasswordFulfilled() {
  return {
    type: CREATE_NEW_PASSWORD_FULFILLED,
  };
}
