import { createSelector } from 'reselect';

/**
 * Direct selector to the changePasswordForm state domain
 */
const selectChangePasswordFormDomain = (state) => state.get('changePasswordForm');

/**
 * Other specific selectors
 */


/**
 * Default selector used by ChangePasswordForm
 */

const makeSelectChangePasswordForm = () => createSelector(
  selectChangePasswordFormDomain,
  (substate) => substate.toJS()
);

export default makeSelectChangePasswordForm;
export {
  selectChangePasswordFormDomain,
};
