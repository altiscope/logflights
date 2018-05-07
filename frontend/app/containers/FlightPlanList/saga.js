/*
 *
 * FlightPlan List Saga
 *
 */

import { call, put, takeLatest } from 'redux-saga/effects';
import { message } from 'antd';
import { getClient } from 'services/api';
import errorHandler from 'common/error-handler';
import {
  GET_FLIGHT_PLANS,
  INVALIDATE_FLIGHT_PLAN,
  CLONE_FLIGHT_PLAN,
  MARK_AS_COMPLETED,
  flightPlanStates,
} from './constants';
import {
  getFlightPlansPending,
  getFlightPlansFulfilled,
  invalidateFlightPlanPending,
  invalidateFlightPlanFulfilled,
  cloneFlightPlanPending,
  cloneFlightPlanFulfilled,
  markAsCompletedPending,
  markAsCompletedFulfilled,
} from './actions';

export function* markAsCompleted(action) {
  try {
    yield put(markAsCompletedPending(true));
    const payload = new FormData();
    payload.append('state', 'completed');

    yield call(getClient().patch, `/plans/${action.payload.flightPlanId}/`, payload);

    yield put(markAsCompletedFulfilled(action.payload.flightPlanId));
  } catch (e) {
    yield put(markAsCompletedPending(false));
    errorHandler(e);
  }
}

export function* getFlightPlans() {
  try {
    yield put(getFlightPlansPending(true));
    const response = yield call(getClient().get, '/plans/');

    yield put(getFlightPlansFulfilled(response.data.results));
  } catch (e) {
    yield put(getFlightPlansPending(false));
    errorHandler(e);
  }
}

export function* invalidateFlightPlan(action) {
  try {
    yield put(invalidateFlightPlanPending(true));

    const payload = new FormData();
    const url = `/plans/${action.payload.flightPlanId}/`;

    payload.append('state', flightPlanStates.INVALID);
    const response = yield call(getClient().patch, url, payload);

    yield put(invalidateFlightPlanFulfilled(response.data.id));
  } catch (e) {
    yield put(invalidateFlightPlanPending(false));
    errorHandler(e);
  }
}

export function* cloneFlightPlan(action) {
  try {
    yield put(cloneFlightPlanPending(true));
    const url = `/plans/${action.payload.flightPlanId}/clone`;

    const response = yield call(getClient().post, url, {
      flight_id: action.payload.flightId,
    });

    message.success('Flight Plan Cloned');
    yield put(cloneFlightPlanFulfilled(response.data));
  } catch (e) {
    yield put(cloneFlightPlanPending(false));
    errorHandler(e);
  }
}

export default function* flightPlanRootSaga() {
  yield [
    takeLatest(GET_FLIGHT_PLANS, getFlightPlans),
    takeLatest(INVALIDATE_FLIGHT_PLAN, invalidateFlightPlan),
    takeLatest(CLONE_FLIGHT_PLAN, cloneFlightPlan),
    takeLatest(MARK_AS_COMPLETED, markAsCompleted),
  ];
}
