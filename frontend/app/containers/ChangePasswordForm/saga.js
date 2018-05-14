/*
 *
 * ChangePasswordForm sagas
 *
 */

import { takeLatest, call, put } from 'redux-saga/effects';
import { getClient } from 'services/api';
import { message } from 'antd';
import { CHANGE_PASSWORD } from './constants';
import { changePasswordPending, changePasswordFulfilled } from './actions';

export function* changePassword(action) {
  yield put(changePasswordPending(true));
  // eslint-disable-next-line camelcase
  const { new_password, old_password } = action.payload;

  try {
    yield call(getClient().patch, '/password/', { new_password, old_password });

    yield put(changePasswordFulfilled());
  } catch (e) {
    message.error('New password too common or old password is incorrect');
    yield put(changePasswordPending(false));
  }
}

export default function* changePasswordFormRootSaga() {
  yield [takeLatest(CHANGE_PASSWORD, changePassword)];
}
