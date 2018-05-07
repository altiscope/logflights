/*
 *
 * CreateNewPasswordForm reducer
 *
 */

import { fromJS } from 'immutable';
import {
  CREATE_NEW_PASSWORD_PENDING,
  CREATE_NEW_PASSWORD_FULFILLED,
} from './constants';

const initialState = fromJS({
  ui: {
    createNewPasswordPending: false,
    createNewPasswordFulfilled: false,
  },
});

function createNewPasswordFormReducer(state = initialState, action) {
  switch (action.type) {
    case CREATE_NEW_PASSWORD_PENDING:
      return state.setIn(['ui', 'createNewPasswordPending'], action.payload.isPending);

    case CREATE_NEW_PASSWORD_FULFILLED:
      return state
        .setIn(['ui', 'createNewPasswordPending'], false)
        .setIn(['ui', 'createNewPasswordFulfilled'], true);

    default:
      return state;
  }
}

export default createNewPasswordFormReducer;
