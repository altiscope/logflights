import { createSelector } from 'reselect';

/**
 * Direct selector to the userProfileForm state domain
 */
const selectUserProfileFormDomain = (state) => state.get('userProfileForm');

/**
 * Other specific selectors
 */

/**
 * Default selector used by UserProfileForm
 */

const makeSelectUserProfileForm = () => createSelector(
  selectUserProfileFormDomain,
  (substate) => substate.toJS()
);

export default makeSelectUserProfileForm;
export {
  selectUserProfileFormDomain,
};
