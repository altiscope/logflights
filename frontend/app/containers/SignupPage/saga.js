/*
 *
 * SignUp Saga
 *
 */

import { put, call, takeLatest } from 'redux-saga/effects';
import { message } from 'antd';
import { getAnonymousClient } from 'services/api';
import { push } from 'react-router-redux';
import { SIGNUP } from './constants';
import { signupFulFilled, signupPending } from './actions';

export function* signup(action) {
  try {
    yield put(signupPending(true));
    const { email, password } = action.payload.user;

    const response = yield call(getAnonymousClient().post, '/signup/', action.payload.user);

    message.success('Account successfully created');

    // @TODO refactor to not rely on env var here
    const loginResponse = yield call(
      getAnonymousClient({ baseURL: process.env.API_HOST }).post,
      '/auth/api-token-auth/',
      {
        username: email,
        password,
      }
    );

    localStorage.setItem('token', loginResponse.data.token);
    localStorage.setItem('userId', loginResponse.data.id);

    yield put(push('/dashboard'));
    yield put(signupFulFilled(response.data));
  } catch (e) {
    const ex = e.response.data;
    if (ex && ex.error && ex.error.includes('username')) {
      message.error(
        'Email is already in use.  Please try again with a different email address.',
        10
      );
    } else {
      message.error(ex.error || 'Something went wrong', 10);
    }

    yield put(signupPending(false));
  }
}

// Individual exports for testing
export default function* signupRootSaga() {
  yield [takeLatest(SIGNUP, signup)];
}
