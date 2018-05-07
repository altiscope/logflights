/*
 *
 *  LoginPage sagas
 *
 */

import { takeLatest, put, call } from 'redux-saga/effects';
import { push } from 'react-router-redux';
import { message } from 'antd';
import { getAnonymousClient } from 'services/api';
import { LOGIN_REQUEST } from './constants';

import { loginFulfilled, loginPending } from './actions';

export function* login(action) {
  try {
    yield put(loginPending(true));
    const { username, password } = action.payload;

    // @TODO refactor to not rely on env var
    const response = yield call(
      getAnonymousClient({ baseURL: process.env.API_HOST }).post,
      '/auth/api-token-auth/',
      {
        username,
        password,
      }
    );
    const user = Object.assign({}, response.data.user, {
      token: response.data.token,
    });

    yield put(loginPending(false));
    yield put(loginFulfilled(user));

    localStorage.setItem('token', response.data.token);
    localStorage.setItem('userId', response.data.id);

    yield put(push('/dashboard'));
  } catch (e) {
    yield put(loginPending(false));
    message.error('Unable to log in with provided credentials.');
  }
}

// Individual exports for testing
export default function* rootSaga() {
  yield [takeLatest(LOGIN_REQUEST, login)];
}
