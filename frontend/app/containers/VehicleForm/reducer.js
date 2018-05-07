/*
 *
 * VehicleForm reducer
 *
 */

import { fromJS } from 'immutable';
import {
  GET_MANUFACTURERS_FULFILLED,
  GET_MANUFACTURERS_PENDING,
  GET_VEHICLE_FULFILLED,
  GET_VEHICLE_PENDING,
  CLEAR_VEHICLE_STATE,
  CREATE_VEHICLE_FULFILLED,
  CREATE_VEHICLE_PENDING,
  UPDATE_VEHICLE_FULFILLED,
  UPDATE_VEHICLE_PENDING,
} from './constants';

const initialState = fromJS({
  ui: {
    getManufacturersPending: false,
    createVehiclePending: false,
    getVehiclePending: false,
  },
  data: {
    manufacturers: [],
    vehicle: {},
  },
});

function vehicleFormReducer(state = initialState, action) {
  switch (action.type) {
    case GET_MANUFACTURERS_PENDING:
      return state.setIn(['ui', 'getManufacturersPending'], action.payload.isPending);

    case GET_MANUFACTURERS_FULFILLED:
      return state.setIn(['data', 'manufacturers'], fromJS(action.payload.manufacturers));

    case GET_VEHICLE_FULFILLED:
      return state
        .setIn(['data', 'vehicle'], fromJS(action.payload.vehicle))
        .setIn(['ui', 'getVehiclePending'], false);

    case GET_VEHICLE_PENDING:
      return state.setIn(['ui', 'getVehiclePending'], action.payload.isPending);

    case CLEAR_VEHICLE_STATE:
      return state.setIn(['data', 'vehicle'], {});

    case CREATE_VEHICLE_PENDING:
      return state.setIn(['ui', 'createVehiclePending'], action.payload.isPending);

    case UPDATE_VEHICLE_PENDING:
      return state.setIn(['ui', 'updateVehiclePending'], action.payload.isPending);

    case CREATE_VEHICLE_FULFILLED:
    case UPDATE_VEHICLE_FULFILLED:
      return state.setIn(['data', 'vehicle'], fromJS(action.payload.vehicle));

    default:
      return state;
  }
}

export default vehicleFormReducer;
