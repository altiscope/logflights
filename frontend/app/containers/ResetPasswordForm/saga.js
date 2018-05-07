/*
 *
 * ResetPasswordForm Saga
 *
 */

import { takeLatest, call, put } from 'redux-saga/effects';
import { message } from 'antd';
import { getAnonymousClient } from 'services/api';
import { RESET_PASSWORD } from './constants';
import { resetPasswordPending, resetPasswordFulfilled } from './actions';

export function* resetPassword(action) {
  try {
    yield put(resetPasswordPending(true));
    yield call(getAnonymousClient().post, '/password/reset/', {
      email_or_username: action.payload.email,
    });

    yield put(resetPasswordFulfilled());
  } catch (e) {
    yield put(resetPasswordPending(false));
    if (e.response.data && e.response.data.error) {
      message.error(e.response.data.error);
    }

    message.error('Username not found');
  }
}

// Individual exports for testing
export default function* resetPasswordFormRootSaga() {
  yield [takeLatest(RESET_PASSWORD, resetPassword)];
}
