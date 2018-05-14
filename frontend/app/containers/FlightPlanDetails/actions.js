/*
 *
 * FlightPlanDetails actions
 *
 */

import {
  GET_PLAN,
  GET_PLAN_PENDING,
  GET_PLAN_FULFILLED,
  GET_WAYPOINTS,
  GET_WAYPOINTS_FULFILLED,
  GET_WAYPOINTS_PENDING,
  GET_TELEMETRY,
  GET_TELEMETRY_FULFILLED,
  GET_TELEMETRY_PENDING,
  CLEAR_PLAN_DETAILS_STATE,
  UPLOAD_TELEMETRY,
  UPLOAD_TELEMETRY_PENDING,
  UPLOAD_TELEMETRY_FULFILLED,
  SET_UPLOADED_TELEMETRY,
  DELETE_TELEMETRY,
  DELETE_TELEMETRY_PENDING,
  DELETE_TELEMETRY_FULFILLED,
  TELEMETRY_PROCESSING,
} from './constants';

export function telemetryProcessing(isProcessing) {
  return {
    type: TELEMETRY_PROCESSING,
    payload: { isProcessing },
  };
}

export function deleteTelemetry(flightPlanId) {
  return {
    type: DELETE_TELEMETRY,
    payload: { flightPlanId },
  };
}

export function deleteTelemetryPending(isPending) {
  return {
    type: DELETE_TELEMETRY_PENDING,
    payload: { isPending },
  };
}

export function deleteTelemetryFulfilled() {
  return {
    type: DELETE_TELEMETRY_FULFILLED,
  };
}

export function uploadTelemetry({ file, type, onSuccess, onError, onProgress, flightPlanId }) {
  return {
    type: UPLOAD_TELEMETRY,
    payload: {
      type,
      file,
      onSuccess,
      onError,
      onProgress,
      flightPlanId,
    },
  };
}

export function uploadTelemetryPending(isPending) {
  return {
    type: UPLOAD_TELEMETRY_PENDING,
    payload: { isPending },
  };
}

export function uploadTelemetryFulfilled(telemetryMetadata) {
  return {
    type: UPLOAD_TELEMETRY_FULFILLED,
    payload: { telemetryMetadata },
  };
}

export function setUploadedTelemetry(fileList) {
  return {
    type: SET_UPLOADED_TELEMETRY,
    payload: { fileList },
  };
}

export function getTelemetry(planId) {
  return {
    type: GET_TELEMETRY,
    payload: { planId },
  };
}

export function getTelemetryPending(isPending) {
  return {
    type: GET_TELEMETRY_PENDING,
    payload: { isPending },
  };
}

export function getTelemetryFulfilled(telemetry) {
  return {
    type: GET_TELEMETRY_FULFILLED,
    payload: { telemetry },
  };
}

export function getWaypoints(planId) {
  return {
    type: GET_WAYPOINTS,
    payload: { planId },
  };
}

export function getWaypointsPending(isPending) {
  return {
    type: GET_WAYPOINTS_PENDING,
    payload: { isPending },
  };
}

export function getWaypointsFulfilled(waypoints) {
  return {
    type: GET_WAYPOINTS_FULFILLED,
    payload: { waypoints },
  };
}

export function getPlan(planId) {
  return {
    type: GET_PLAN,
    payload: { planId },
  };
}

export function getPlanPending(isPending) {
  return {
    type: GET_PLAN_PENDING,
    payload: { isPending },
  };
}

export function getPlanFulfilled(plan) {
  return {
    type: GET_PLAN_FULFILLED,
    payload: { plan },
  };
}

export function clearPlanDetailsState() {
  return {
    type: CLEAR_PLAN_DETAILS_STATE,
  };
}
