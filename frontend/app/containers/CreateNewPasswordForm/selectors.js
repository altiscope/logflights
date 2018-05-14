import { createSelector } from 'reselect';

/**
 * Direct selector to the createNewPasswordForm state domain
 */
const selectCreateNewPasswordFormDomain = (state) => state.get('createNewPasswordForm');

/**
 * Other specific selectors
 */

/**
 * Default selector used by CreateNewPasswordForm
 */

const makeSelectCreateNewPasswordForm = () =>
  createSelector(selectCreateNewPasswordFormDomain, (substate) => substate.toJS());

export default makeSelectCreateNewPasswordForm;
export { selectCreateNewPasswordFormDomain };
