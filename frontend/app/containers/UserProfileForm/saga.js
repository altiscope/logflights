/*
 *
 * SignupPage Saga
 *
 */

import { takeLatest, call, put } from 'redux-saga/effects';
import { getClient } from 'services/api';
import { message } from 'antd';
import errorHandler from 'common/error-handler';
import { GET_USER_PROFILE, UPDATE_USER_PROFILE } from './constants';
import {
  getUserProfilePending,
  getUserProfileFulfilled,
  updateUserProfilePending,
  updateUserProfileFulfilled,
} from './actions';
import { getCurrentUser } from '../PlannerWrapper/actions';

export function* getUserProfile() {
  try {
    yield put(getUserProfilePending(true));
    const response = yield call(getClient().get, '/me/');

    yield put(getUserProfileFulfilled(response.data));
  } catch (e) {
    yield put(getUserProfilePending(false));
    errorHandler(e);
  }
}

export function* updateUserProfile(action) {
  try {
    yield put(updateUserProfilePending(true));
    const { id } = action.payload.userProfile;
    const response = yield call(getClient().patch, `/signup/${id}/`, action.payload.userProfile);

    yield put(updateUserProfileFulfilled(response.data));
    message.success('Profile successfully updated');
    // Reload current user
    yield put(getCurrentUser());
  } catch (e) {
    yield put(updateUserProfilePending(false));
    errorHandler(e);
  }
}

// Individual exports for testing
export default function* signupPageRootSaga() {
  yield [
    takeLatest(GET_USER_PROFILE, getUserProfile),
    takeLatest(UPDATE_USER_PROFILE, updateUserProfile),
  ];
}
