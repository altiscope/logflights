/*
 *
 * VehicleForm Sagas
 *
 */

import React from 'react';
import { takeLatest, put, call } from 'redux-saga/effects';
import { message, notification } from 'antd';
import { push } from 'react-router-redux';
import errorHandler from 'common/error-handler';
import { getClient } from 'services/api';
import { CREATE_VEHICLE, GET_MANUFACTURERS, GET_VEHICLE, UPDATE_VEHICLE } from './constants';
import {
  getManufacturersPending,
  getManufacturersFulfilled,
  createVehicleFulFilled,
  createVehiclePending,
  getVehiclePending,
  getVehicleFulFilled,
  updateVehicleFulfilled,
  updateVehiclePending,
} from './actions';

const existingSerialContent = (path) => (
  <p>
    A vehicle with the same serial number exists. You can re-active it <a href={path}>here</a>
  </p>
);

export function* getManufacturers() {
  try {
    yield put(getManufacturersPending(true));
    const response = yield call(getClient().get, '/manufacturers/');

    yield put(getManufacturersPending(false));
    yield put(getManufacturersFulfilled(response.data.results));
  } catch (e) {
    yield put(getManufacturersPending(false));
    errorHandler(e);
  }
}

export function* createVehicle(action) {
  try {
    yield put(createVehiclePending(true));

    const { vehicle } = action.payload;
    const response = yield call(getClient().post, '/vehicles/', vehicle);

    yield put(createVehicleFulFilled({ ...vehicle, id: response.data.id }));
    yield put(createVehiclePending(false));

    message.success('Vehicle Successfully Created');
    yield put(push('/dashboard/vehicles'));
  } catch (e) {
    if (e.response.status === 422 && e.response.data.vehicle_id) {
      // serial number exists
      const vehicleDetailsPath = `/dashboard/vehicles/${e.response.data.vehicle_id}/update`;
      notification.warn({
        duration: 0,
        message: 'Vehicle',
        description: existingSerialContent(vehicleDetailsPath),
      });
    }
    yield put(createVehiclePending(false));
  }
}

export function* getVehicle(action) {
  try {
    yield put(getVehiclePending(true));

    const { id } = action.payload;
    const uri = `/vehicles/${id}/`;
    const response = yield call(getClient().get, uri);

    yield put(getVehicleFulFilled(response.data));
  } catch (e) {
    yield put(getVehiclePending(false));
    errorHandler(e);
  }
}

export function* updateVehicle(action) {
  try {
    yield put(updateVehiclePending(true));

    const { id } = action.payload.vehicle;
    const uri = `/vehicles/${id}/`;
    const response = yield call(getClient().patch, uri, action.payload.vehicle);

    yield put(updateVehicleFulfilled(response.data));
    message.success('Vehicle Successfully Updated');
    yield put(push('/dashboard/vehicles'));
  } catch (e) {
    yield put(updateVehiclePending(false));
    errorHandler(e);
  }
}

// Individual exports for testing
export default function* vehicleFormRootSaga() {
  yield [
    takeLatest(GET_MANUFACTURERS, getManufacturers),
    takeLatest(CREATE_VEHICLE, createVehicle),
    takeLatest(GET_VEHICLE, getVehicle),
    takeLatest(UPDATE_VEHICLE, updateVehicle),
  ];
}
