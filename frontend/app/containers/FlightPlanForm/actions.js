/*
 *
 * FlightPlanForm actions
 *
 */

import {
  GET_MISSION_TYPES,
  GET_MISSION_TYPES_FULFILLED,
  GET_MISSION_TYPES_PENDING,
  GET_VEHICLES,
  GET_VEHICLES_PENDING,
  GET_VEHICLES_FULFILLED,
  CREATE_FLIGHT_PLAN,
  CREATE_FLIGHT_PLAN_FULFILLED,
  CREATE_FLIGHT_PLAN_PENDING,
  GET_FLIGHT_PLAN,
  GET_FLIGHT_PLAN_FULFILLED,
  GET_FLIGHT_PLAN_PENDING,
  CLEAR_FLIGHT_PLAN_STATE,
  UPDATE_FLIGHT_PLAN,
  UPDATE_FLIGHT_PLAN_FULFILLED,
  UPDATE_FLIGHT_PLAN_PENDING,
  UPLOAD_WAYPOINTS,
  UPLOAD_WAYPOINTS_FULFILLED,
  UPLOAD_WAYPOINTS_PENDING,
  SET_UPLOADED_WAYPOINT,
  MARK_WAYPOINTS_FOR_DELETION,
} from './constants';

export function uploadWaypoints({ file, type, onSuccess, onError, onProgress }) {
  return {
    type: UPLOAD_WAYPOINTS,
    payload: {
      type,
      file,
      onSuccess,
      onError,
      onProgress,
    },
  };
}

export function uploadWaypointsPending(isPending) {
  return {
    type: UPLOAD_WAYPOINTS_PENDING,
    payload: { isPending },
  };
}

export function uploadWaypointsFulfilled(waypointMetadata) {
  return {
    type: UPLOAD_WAYPOINTS_FULFILLED,
    payload: { waypointMetadata },
  };
}

export function updateFlightPlan(flightPlan, removeWaypoint) {
  return {
    type: UPDATE_FLIGHT_PLAN,
    payload: { flightPlan, removeWaypoint },
  };
}

export function updateFlightPlanPending(isPending) {
  return {
    type: UPDATE_FLIGHT_PLAN_PENDING,
    payload: { isPending },
  };
}

export function updateFlightPlanFulfilled(flightPlan) {
  return {
    type: UPDATE_FLIGHT_PLAN_FULFILLED,
    payload: { flightPlan },
  };
}

export function getFlightPlan(flightPlanId) {
  return {
    type: GET_FLIGHT_PLAN,
    payload: { flightPlanId },
  };
}

export function getFlightPlanFulfilled(flightPlan) {
  return {
    type: GET_FLIGHT_PLAN_FULFILLED,
    payload: { flightPlan },
  };
}

export function getFlightPlanPending(isPending) {
  return {
    type: GET_FLIGHT_PLAN_PENDING,
    payload: { isPending },
  };
}

export function createFlightPlan(flightPlan) {
  return {
    type: CREATE_FLIGHT_PLAN,
    payload: { flightPlan },
  };
}

export function createFlightPlanFulfilled(flightPlan) {
  return {
    type: CREATE_FLIGHT_PLAN_FULFILLED,
    payload: { flightPlan },
  };
}

export function createFlightPlanPending(isPending) {
  return {
    type: CREATE_FLIGHT_PLAN_PENDING,
    payload: { isPending },
  };
}

export function getMissionTypes() {
  return {
    type: GET_MISSION_TYPES,
  };
}

export function getMissionTypesFulFilled(missionTypes) {
  return {
    type: GET_MISSION_TYPES_FULFILLED,
    payload: { missionTypes },
  };
}

export function getMissionTypesPending(isPending) {
  return {
    type: GET_MISSION_TYPES_PENDING,
    payload: { isPending },
  };
}

export function getVehicles() {
  return {
    type: GET_VEHICLES,
  };
}

export function getVehiclesFulFilled(vehicles) {
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

export function clearFlightPlanState() {
  return {
    type: CLEAR_FLIGHT_PLAN_STATE,
  };
}

export function setUploadedWaypoint(fileList) {
  return {
    type: SET_UPLOADED_WAYPOINT,
    payload: { fileList },
  };
}

export function markWaypointsForDeletion() {
  return {
    type: MARK_WAYPOINTS_FOR_DELETION,
  };
}
