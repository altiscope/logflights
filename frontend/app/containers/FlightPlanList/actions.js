/*
 *
 * FlightPlanList actions
 *
 */

import {
  GET_FLIGHT_PLANS,
  GET_FLIGHT_PLANS_PENDING,
  GET_FLIGHT_PLANS_FULFILLED,
  INVALIDATE_FLIGHT_PLAN,
  INVALIDATE_FLIGHT_PLAN_PENDING,
  INVALIDATE_FLIGHT_PLAN_FULFILLED,
  SET_FLIGHT_PLANS_FILTER,
  CLONE_FLIGHT_PLAN,
  CLONE_FLIGHT_PLAN_PENDING,
  CLONE_FLIGHT_PLAN_FULFILLED,
  MARK_AS_COMPLETED,
  MARK_AS_COMPLETED_PENDING,
  MARK_AS_COMPLETED_FULFILLED,
} from './constants';

export function markAsCompleted(flightPlanId) {
  return {
    type: MARK_AS_COMPLETED,
    payload: { flightPlanId },
  };
}

export function markAsCompletedPending(isPending) {
  return {
    type: MARK_AS_COMPLETED_PENDING,
    payload: { isPending },
  };
}

export function markAsCompletedFulfilled(flightPlanId) {
  return {
    type: MARK_AS_COMPLETED_FULFILLED,
    payload: { flightPlanId },
  };
}

export function getFlightPlans() {
  return {
    type: GET_FLIGHT_PLANS,
  };
}

export function getFlightPlansPending(isPending) {
  return {
    type: GET_FLIGHT_PLANS_PENDING,
    payload: { isPending },
  };
}

export function getFlightPlansFulfilled(flightPlans) {
  return {
    type: GET_FLIGHT_PLANS_FULFILLED,
    payload: { flightPlans },
  };
}

export function invalidateFlightPlan(flightPlanId) {
  return {
    type: INVALIDATE_FLIGHT_PLAN,
    payload: { flightPlanId },
  };
}

export function invalidateFlightPlanPending(isPending) {
  return {
    type: INVALIDATE_FLIGHT_PLAN_PENDING,
    payload: { isPending },
  };
}

export function invalidateFlightPlanFulfilled(flightPlanId) {
  return {
    type: INVALIDATE_FLIGHT_PLAN_FULFILLED,
    payload: { flightPlanId },
  };
}

export function setFlightPlansFilter(flightPlansFilter) {
  return {
    type: SET_FLIGHT_PLANS_FILTER,
    payload: { flightPlansFilter },
  };
}

/*
 *
 * @param {string} flightPlanId - flightPlan primary key
 * @param {string} flightId - flightId field
 *
 */
export function cloneFlightPlan(flightPlanId, flightId) {
  return {
    type: CLONE_FLIGHT_PLAN,
    payload: { flightPlanId, flightId },
  };
}

export function cloneFlightPlanPending(isPending) {
  return {
    type: CLONE_FLIGHT_PLAN_PENDING,
    payload: { isPending },
  };
}

export function cloneFlightPlanFulfilled(flightPlan) {
  return {
    type: CLONE_FLIGHT_PLAN_FULFILLED,
    payload: { flightPlan },
  };
}
