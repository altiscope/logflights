/*
 *
 * VehicleForm actions
 *
 */

import {
  GET_MANUFACTURERS,
  GET_MANUFACTURERS_FULFILLED,
  GET_MANUFACTURERS_PENDING,
  CREATE_VEHICLE,
  CREATE_VEHICLE_FULFILLED,
  CREATE_VEHICLE_PENDING,
  GET_VEHICLE,
  GET_VEHICLE_FULFILLED,
  GET_VEHICLE_PENDING,
  UPDATE_VEHICLE,
  UPDATE_VEHICLE_FULFILLED,
  UPDATE_VEHICLE_PENDING,
  CLEAR_VEHICLE_STATE,
} from './constants';

export function getVehicle(id) {
  return {
    type: GET_VEHICLE,
    payload: { id },
  };
}

export function getVehiclePending(isPending) {
  return {
    type: GET_VEHICLE_PENDING,
    payload: { isPending },
  };
}

export function getVehicleFulFilled(vehicle) {
  return {
    type: GET_VEHICLE_FULFILLED,
    payload: { vehicle },
  };
}

export function updateVehicle(vehicle) {
  return {
    type: UPDATE_VEHICLE,
    payload: { vehicle },
  };
}

export function updateVehiclePending(isPending) {
  return {
    type: UPDATE_VEHICLE_PENDING,
    payload: { isPending },
  };
}

export function updateVehicleFulfilled(vehicle) {
  return {
    type: UPDATE_VEHICLE_FULFILLED,
    payload: { vehicle },
  };
}

export function getManufacturers() {
  return {
    type: GET_MANUFACTURERS,
  };
}

export function getManufacturersFulfilled(manufacturers) {
  return {
    type: GET_MANUFACTURERS_FULFILLED,
    payload: {
      manufacturers,
    },
  };
}

export function getManufacturersPending(isPending) {
  return {
    type: GET_MANUFACTURERS_PENDING,
    payload: { isPending },
  };
}

export function createVehicle(vehicle) {
  return {
    type: CREATE_VEHICLE,
    payload: { vehicle },
  };
}

export function createVehicleFulFilled(vehicle) {
  return {
    type: CREATE_VEHICLE_FULFILLED,
    payload: { vehicle },
  };
}

export function createVehiclePending(isPending) {
  return {
    type: CREATE_VEHICLE_PENDING,
    payload: { isPending },
  };
}

export function clearVehicleState() {
  return {
    type: CLEAR_VEHICLE_STATE,
  };
}
