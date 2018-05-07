/*
 *
 * PlannerIndex actions
 *
 */

import {
  GET_PLANNED_FLIGHTS,
  GET_PLANNED_FLIGHTS_FULFILLED,
  GET_PLANNED_FLIGHTS_PENDING,
  GET_OPERATORS,
  GET_OPERATORS_PENDING,
  GET_OPERATORS_FULFILLED,
} from './constants';

export function getOperators() {
  return {
    type: GET_OPERATORS,
  };
}

export function getOperatorsPending(isPending) {
  return {
    type: GET_OPERATORS_PENDING,
    payload: { isPending },
  };
}

export function getOperatorsFulfilled(operators) {
  return {
    type: GET_OPERATORS_FULFILLED,
    payload: { operators },
  };
}

export function getPlannedFlights(params) {
  return {
    type: GET_PLANNED_FLIGHTS,
    payload: { params },
  };
}

export function getPlannedFlightsFulFilled(plannedFlights) {
  return {
    type: GET_PLANNED_FLIGHTS_FULFILLED,
    payload: { plannedFlights },
  };
}

export function getPlannedFlightsPending(isPending) {
  return {
    type: GET_PLANNED_FLIGHTS_PENDING,
    payload: { isPending },
  };
}
