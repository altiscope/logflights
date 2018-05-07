/*
 *
 * PlannerWrapper Saga
 *
 */

import { takeLatest, put, call } from 'redux-saga/effects';
import { getClient } from 'services/api';
import errorHandler from 'common/error-handler';
import { GET_CURRENT_USER } from './constants';
import { getCurrentUserFulfilled } from './actions';

export function* getCurrentUser() {
  try {
    const response = yield call(getClient().get, '/me/');

    yield put(getCurrentUserFulfilled(response.data));
  } catch (e) {
    yield put(getCurrentUserFulfilled({}));
    errorHandler(e);
  }
}

export default function* plannerIndexRootSaga() {
  yield [takeLatest(GET_CURRENT_USER, getCurrentUser)];
}
