/*
 *
 * PlannerIndex Saga
 *
 */

import { takeLatest, call, put } from 'redux-saga/effects';
import { getAnonymousClient } from 'services/api';
import errorHandler from 'common/error-handler';
import { GET_PLANNED_FLIGHTS, GET_OPERATORS } from './constants';
import {
  getPlannedFlightsPending,
  getPlannedFlightsFulFilled,
  getOperatorsPending,
  getOperatorsFulfilled,
} from './actions';

export function* getPlannedFlights(action) {
  const { params } = action.payload;

  try {
    yield put(getPlannedFlightsPending(true));

    const response = yield call(
      getAnonymousClient().get,
      '/plans/search_flights/',
      {
        params: {
          ...params,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      }
    );

    yield put(getPlannedFlightsFulFilled(response.data.plans));
  } catch (e) {
    yield put(getPlannedFlightsPending(false));
    errorHandler(e);
  }
}

export function* getOperators() {
  try {
    yield put(getOperatorsPending(true));

    const response = yield call(getAnonymousClient().get, '/operators/');

    yield put(getOperatorsFulfilled(response.data.results));
  } catch (e) {
    yield put(getOperatorsPending(false));
    errorHandler(e);
  }
}

// Individual exports for testing
export default function* plannerIndexRootSaga() {
  // See example in containers/HomePage/saga.js
  yield [
    takeLatest(GET_PLANNED_FLIGHTS, getPlannedFlights),
    takeLatest(GET_OPERATORS, getOperators),
  ];
}
