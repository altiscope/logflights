/*
 *
 * ResetPasswordForm reducer
 *
 */

import { fromJS } from 'immutable';
import { RESET_PASSWORD_PENDING, RESET_PASSWORD_FULFILLED } from './constants';

const initialState = fromJS({
  ui: {
    resetPasswordPending: false,
    resetPasswordFulfilled: false,
  },
});

function resetPasswordFormReducer(state = initialState, action) {
  switch (action.type) {
    case RESET_PASSWORD_PENDING:
      return state.setIn(['ui', 'resetPasswordPending'], action.payload.isPending);

    case RESET_PASSWORD_FULFILLED:
      return state
        .setIn(['ui', 'resetPasswordFulfilled'], true)
        .setIn(['ui', 'resetPasswordPending'], false);

    default:
      return state;
  }
}

export default resetPasswordFormReducer;
