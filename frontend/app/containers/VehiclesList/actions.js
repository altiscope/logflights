/*
 *
 * VehiclesList actions
 *
 */

import {
  GET_VEHICLES,
  GET_VEHICLES_FULFILLED,
  GET_VEHICLES_PENDING,
  SET_VEHICLES_FILTER,
} from './constants';

export function setVehiclesFilter(vehiclesFilter) {
  return {
    type: SET_VEHICLES_FILTER,
    payload: { vehiclesFilter },
  };
}

export function getVehicles() {
  return {
    type: GET_VEHICLES,
  };
}

export function getVehiclesFulfilled(vehicles) {
  return {
    type: GET_VEHICLES_FULFILLED,
    payload: { vehicles },
  };
}

export function getVehiclesPending(isPending) {
  return {
    type: GET_VEHICLES_PENDING,
    payload: { isPending },
  };
}
