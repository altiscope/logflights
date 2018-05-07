/*
 *
 * FlightPlanDetails reducer
 *
 */

import { fromJS } from 'immutable';
import {
  GET_WAYPOINTS_FULFILLED,
  GET_WAYPOINTS_PENDING,
  GET_PLAN_PENDING,
  GET_PLAN_FULFILLED,
  GET_TELEMETRY_FULFILLED,
  GET_TELEMETRY_PENDING,
  CLEAR_PLAN_DETAILS_STATE,
  UPLOAD_TELEMETRY_PENDING,
  UPLOAD_TELEMETRY_FULFILLED,
  SET_UPLOADED_TELEMETRY,
  DELETE_TELEMETRY_FULFILLED,
  TELEMETRY_PROCESSING,
} from './constants';

const initialState = fromJS({
  ui: {
    getWaypointsPending: false,
    getFlightPlanPending: false,
    getTelemetryPending: false,
    getWaypointsFulFilled: false,
    getTelemetryFulfilled: false,
    telemetryProcessing: false,
    uploadTelemetryPending: false,
    uploadedTelemetry: [],
  },
  data: {
    waypoints: {},
    telemetry: [],
    flightPlan: {},
  },
});

function flightPlanDetailsReducer(state = initialState, action) {
  switch (action.type) {
    case GET_WAYPOINTS_PENDING:
      return state.setIn(['ui', 'getWaypointsPending'], action.payload.isPending);

    case GET_PLAN_PENDING:
      return state.setIn(['ui', 'getFlightPlanPending'], action.payload.isPending);

    case GET_WAYPOINTS_FULFILLED:
      return state
        .setIn(['ui', 'getWaypointsPending'], false)
        .setIn(['ui', 'getWaypointsFulFilled'], true)
        .setIn(['data', 'waypoints'], fromJS(action.payload.waypoints));
        // .setIn(['data', 'telemtery'], fromJS(action.payload.telemetry));

    case GET_PLAN_FULFILLED:
      return state
        .setIn(['ui', 'getFlightPlanPending'], false)
        .setIn(['data', 'flightPlan'], fromJS(action.payload.plan));

    case GET_TELEMETRY_FULFILLED:
      return state
        .setIn(['ui', 'getTelemetryPending'], false)
        .setIn(['ui', 'getTelemetryFulfilled'], true)
        .setIn(['data', 'telemetry'], fromJS(action.payload.telemetry));

    case GET_TELEMETRY_PENDING:
      return state.setIn(['ui', 'getTelemetryPending'], action.payload.isPending);

    case UPLOAD_TELEMETRY_PENDING:
      return state.setIn(['ui', 'uploadTelemetryPending'], action.payload.isPending);

    case UPLOAD_TELEMETRY_FULFILLED:
      return state
        .setIn(['ui', 'uploadTelemetryPending'], false);

    case SET_UPLOADED_TELEMETRY:
      return state.setIn(['ui', 'uploadedTelemetry'], action.payload.fileList);

    case DELETE_TELEMETRY_FULFILLED:
      return state
        .setIn(['ui', 'deleteTelemetryPending'], false)
        .setIn(['data', 'telemetry'], {});

    case TELEMETRY_PROCESSING:
      return state.setIn(['ui', 'telemetryProcessing'], action.payload.isProcessing);

    case CLEAR_PLAN_DETAILS_STATE:
      return initialState;

    default:
      return state;
  }
}

export default flightPlanDetailsReducer;
