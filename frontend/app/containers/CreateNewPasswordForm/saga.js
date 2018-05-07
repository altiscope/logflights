/*
 *
 * CreateNewPassword Saga
 *
 */

import { takeLatest, call, put } from 'redux-saga/effects';
import { getAnonymousClient } from 'services/api';
import errorHandler from 'common/error-handler';
import { CREATE_NEW_PASSWORD } from './constants';
import { createNewPasswordPending, createNewPasswordFulfilled } from './actions';

export function* createNewPassword(action) {
  try {
    yield put(createNewPasswordPending(true));
    const { token, new_password1, new_password2 } = action.payload;

    yield call(getAnonymousClient().post, `/password/reset/${token}/`, {
      new_password1,
      new_password2,
    });

    yield put(createNewPasswordFulfilled());
  } catch (e) {
    errorHandler(e);
    yield put(createNewPasswordPending(false));
  }
}

// Individual exports for testing
export default function* createNewPasswordRootSaga() {
  yield [takeLatest(CREATE_NEW_PASSWORD, createNewPassword)];
}
