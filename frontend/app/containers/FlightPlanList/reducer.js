/*
 *
 * FlightPlanList reducer
 *
 */

import { fromJS } from 'immutable';
import {
  GET_FLIGHT_PLANS_PENDING,
  GET_FLIGHT_PLANS_FULFILLED,
  INVALIDATE_FLIGHT_PLAN_PENDING,
  INVALIDATE_FLIGHT_PLAN_FULFILLED,
  SET_FLIGHT_PLANS_FILTER,
  CLONE_FLIGHT_PLAN_PENDING,
  CLONE_FLIGHT_PLAN_FULFILLED,
  MARK_AS_COMPLETED_PENDING,
  MARK_AS_COMPLETED_FULFILLED,
} from './constants';

const initialState = fromJS({
  ui: {
    getFlightPlansPending: false,
    invalidateFlightPlanPending: false,
    cloneFlightPlanPending: false,
    markAsCompletedPending: false,
    flightPlansFilter: 'active', // active ('planned', 'completed') or invalid
  },
  data: {
    flightPlans: [],
  },
});

function flightPlanListReducer(state = initialState, action) {
  switch (action.type) {
    case GET_FLIGHT_PLANS_FULFILLED:
      return state
        .setIn(['data', 'flightPlans'], fromJS(action.payload.flightPlans))
        .setIn(['ui', 'getFlightPlansPending'], false);

    case GET_FLIGHT_PLANS_PENDING:
      return state.setIn(['ui', 'getFlightPlansPending'], action.payload.isPending);

    case INVALIDATE_FLIGHT_PLAN_PENDING:
      return state.setIn(['ui', 'invalidateFlightPlanPending'], action.payload.isPending);

    case INVALIDATE_FLIGHT_PLAN_FULFILLED: {
      // TODO: create helper for this
      const flightPlans = state.getIn(['data', 'flightPlans']);
      const updatedFlightPlans = flightPlans.update(
          flightPlans.findIndex((item) => item.get('id') === action.payload.flightPlanId), (item) => item.set('state', 'invalid')
        );

      return state
        .setIn(['ui', 'invalidateFlightPlanPending'], false)
        .setIn(['data', 'flightPlans'], updatedFlightPlans);
    }
    case CLONE_FLIGHT_PLAN_PENDING:
      return state.setIn(['ui', 'cloneFlightPlanPending'], action.payload.isPending);

    case CLONE_FLIGHT_PLAN_FULFILLED:
      return state
        .setIn(['ui', 'cloneFlightPlanPending'], false)
        .setIn(
          ['data', 'flightPlans'],
          fromJS([action.payload.flightPlan, ...state.getIn(['data', 'flightPlans']).toJS()])
        );

    case SET_FLIGHT_PLANS_FILTER:
      return state.setIn(['ui', 'flightPlansFilter'], action.payload.flightPlansFilter);

    case MARK_AS_COMPLETED_PENDING:
      return state.setIn(['ui', 'markAsCompletedPending'], action.payload.isPending);

    case MARK_AS_COMPLETED_FULFILLED: {
      // TODO: create Helpers for this
      const fps = state.getIn(['data', 'flightPlans']);
      const updatedFps = fps.update(
          fps.findIndex((item) => item.get('id') === action.payload.flightPlanId), (item) => item.set('state', 'completed')
        );

      return state
        .setIn(['ui', 'markAsCompletedPending'], false)
        .setIn(['data', 'flightPlans'], updatedFps);
    }

    default:
      return state;
  }
}

export default flightPlanListReducer;

