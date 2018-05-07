/*
 *
 * VehiclesList reducer
 *
 */

import { fromJS } from 'immutable';
import {
  GET_VEHICLES_PENDING,
  GET_VEHICLES_FULFILLED,
  SET_VEHICLES_FILTER,
} from './constants';

const initialState = fromJS({
  ui: {
    getVehiclesPending: false,
    vehiclesFilter: 'active', // active or inactive
  },
  data: {
    vehicles: [],
  },
});

function vehiclesListReducer(state = initialState, action) {
  switch (action.type) {
    case GET_VEHICLES_FULFILLED:
      return state
        .setIn(['ui', 'getVehiclesPending'], false)
        .setIn(['data', 'vehicles'], fromJS(action.payload.vehicles));

    case GET_VEHICLES_PENDING:
      return state.setIn(['ui', 'getVehiclesPending'], action.payload.isPending);

    case SET_VEHICLES_FILTER:
      return state.setIn(['ui', 'vehiclesFilter'], action.payload.vehiclesFilter);

    default:
      return state;
  }
}

export default vehiclesListReducer;
