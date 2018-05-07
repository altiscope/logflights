/*
 *
 * VehicleList Saga
 *
 */

import { put, call, takeLatest } from 'redux-saga/effects';
import { getClient } from 'services/api';
import errorHandler from 'common/error-handler';
import { getVehiclesPending, getVehiclesFulfilled } from './actions';
import { GET_VEHICLES } from './constants';

export function* getVehicles() {
  try {
    yield put(getVehiclesPending(true));

    const response = yield call(getClient().get, '/vehicles/');

    yield put(getVehiclesFulfilled(response.data.results));
  } catch (e) {
    yield put(getVehiclesPending(false));
    errorHandler(e);
  }
}

// Individual exports for testing
export default function* vehicleListRootSaga() {
  yield [takeLatest(GET_VEHICLES, getVehicles)];
}
