/*
 *
 * PlannerIndex reducer
 *
 */

import { fromJS } from 'immutable';
import {
  GET_PLANNED_FLIGHTS_PENDING,
  GET_PLANNED_FLIGHTS_FULFILLED,
  GET_OPERATORS_PENDING,
  GET_OPERATORS_FULFILLED,
} from './constants';

const initialState = fromJS({
  ui: {
    getPlannedFlightsPending: false,
  },
  data: {
    plannedFlights: [],
    operators: [],
  },
});

function plannerIndexReducer(state = initialState, action) {
  switch (action.type) {

    case GET_PLANNED_FLIGHTS_PENDING:
      return state.setIn(['ui', 'getPlannedFlightsPending'], action.payload.isPending);

    case GET_PLANNED_FLIGHTS_FULFILLED:
      return state
        .setIn(['ui', 'getPlannedFlightsPending'], false)
        .setIn(['data', 'plannedFlights'], fromJS(action.payload.plannedFlights));

    case GET_OPERATORS_PENDING:
      return state.setIn(['ui', 'getOperatorsPending'], action.payload.isPending);

    case GET_OPERATORS_FULFILLED:
      return state
        .setIn(['ui', 'getOperatorsPending'], false)
        .setIn(['data', 'operators'], fromJS(action.payload.operators));

    default:
      return state;
  }
}

export default plannerIndexReducer;
