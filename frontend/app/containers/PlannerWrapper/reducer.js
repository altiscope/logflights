/*
 *
 * PlannerIndex reducer
 *
 */

import { fromJS } from 'immutable';
import {
  GET_CURRENT_USER_FULFILLED,
} from './constants';

const initialState = fromJS({
  getCurrentUserFulfilled: false,
});

function plannerIndexReducer(state = initialState, action) {
  switch (action.type) {
    case GET_CURRENT_USER_FULFILLED:
      return state.setIn(['getCurrentUserFulfilled'], true);

    default:
      return state;
  }
}

export default plannerIndexReducer;
