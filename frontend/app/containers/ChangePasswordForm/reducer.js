/*
 *
 * ChangePasswordForm reducer
 *
 */

import { fromJS } from 'immutable';
import { CHANGE_PASSWORD_PENDING, CHANGE_PASSWORD_FULFILLED } from './constants';

const initialState = fromJS({
  ui: {
    changePasswordPending: false,
    changePasswordFulfilled: false,
  },
});

function changePasswordFormReducer(state = initialState, action) {
  switch (action.type) {
    case CHANGE_PASSWORD_PENDING:
      return state.setIn(['ui', 'changePasswordPending'], action.payload.isPending);

    case CHANGE_PASSWORD_FULFILLED:
      return state
        .setIn(['ui', 'changePasswordPending'], false)
        .setIn(['ui', 'changePasswordFulfilled'], true);

    default:
      return state;
  }
}

export default changePasswordFormReducer;
