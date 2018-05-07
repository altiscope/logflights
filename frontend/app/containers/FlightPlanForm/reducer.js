/*
 *
 * FlightPlanForm reducer
 *
 */

import { fromJS } from 'immutable';
import {
  GET_MISSION_TYPES_FULFILLED,
  GET_VEHICLES_FULFILLED,
  GET_MISSION_TYPES_PENDING,
  GET_VEHICLES_PENDING,
  CREATE_FLIGHT_PLAN_PENDING,
  CREATE_FLIGHT_PLAN_FULFILLED,
  UPDATE_FLIGHT_PLAN_PENDING,
  UPDATE_FLIGHT_PLAN_FULFILLED,
  GET_FLIGHT_PLAN_PENDING,
  GET_FLIGHT_PLAN_FULFILLED,
  CLEAR_FLIGHT_PLAN_STATE,
  UPLOAD_WAYPOINTS_PENDING,
  UPLOAD_WAYPOINTS_FULFILLED,
  SET_UPLOADED_WAYPOINT,
  MARK_WAYPOINTS_FOR_DELETION,
} from './constants';

const initialState = fromJS({
  ui: {
    missionTypesPending: false,
    vehiclesPending: false,
    createFlightPlanPending: false,
    getFlightPlanPending: false,
    updateFlightPlanPending: false,
    uploadWaypointsPending: false,
    newWaypointId: '',
    uploadedWaypoint: [], // new uploaded waypoint - an Upload control file list
    removeWaypoint: false, // a flag to determine if waypoints should be removed on updated
  },
  data: {
    missionTypes: [],
    vehicles: [],
    flightPlan: {},
  },
});

function flightPlanFormReducer(state = initialState, action) {
  switch (action.type) {

    case GET_MISSION_TYPES_FULFILLED:
      return state
        .setIn(['ui', 'missionTypesPending'], false)
        .setIn(['data', 'missionTypes'], fromJS(action.payload.missionTypes));

    case GET_VEHICLES_FULFILLED:
      return state
        .setIn(['ui', 'vehicleTypesPending'], false)
        .setIn(['data', 'vehicles'], fromJS(action.payload.vehicles));

    case GET_VEHICLES_PENDING:
      return state.setIn(['ui', 'vehicleTypesPending'], action.payload.isPending);

    case GET_MISSION_TYPES_PENDING:
      return state.setIn(['ui', 'missionTypesPending'], action.payload.isPending);

    case CREATE_FLIGHT_PLAN_FULFILLED:
      return state
        .setIn(['ui', 'createFlightPlanPending'], false)
        .setIn(['data', 'flightPlan'], action.payload.flightPlan);

    case CREATE_FLIGHT_PLAN_PENDING:
      return state
        .setIn(['ui', 'createFlightPlanPending'], action.payload.isPending);

    case GET_FLIGHT_PLAN_PENDING:
      return state.setIn(['ui', 'getFlightPlanPending'], action.payload.isPending);

    case GET_FLIGHT_PLAN_FULFILLED:
      return state
        .setIn(['ui', 'getFlightPlanPending'], false)
        .setIn(['data', 'flightPlan'], action.payload.flightPlan);

    case UPDATE_FLIGHT_PLAN_PENDING:
      return state.setIn(['ui', 'updateFlightPlanPending'], action.payload.isPending);

    case UPDATE_FLIGHT_PLAN_FULFILLED:
      return state
        .setIn(['ui', 'updateFlightPlanPending'], false)
        .setIn(['data', 'flightPlan'], action.payload.flightPlan);

    case UPLOAD_WAYPOINTS_PENDING:
      return state.setIn(['ui', 'uploadWaypointsPending'], action.payload.isPending);

    case UPLOAD_WAYPOINTS_FULFILLED:
      return state.setIn(['ui', 'newWaypointId'], action.payload.waypointMetadata.wm_id);

    case SET_UPLOADED_WAYPOINT:
      return state.setIn(['ui', 'uploadedWaypoint'], action.payload.fileList);

    case MARK_WAYPOINTS_FOR_DELETION:
      return state.setIn(['ui', 'removeWaypoint'], true);

    case CLEAR_FLIGHT_PLAN_STATE:
      return initialState;

    default:
      return state;
  }
}

export default flightPlanFormReducer;
