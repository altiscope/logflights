/*
 *
 *  Common Selectors
 *
 *  @description: reusable selectors
 *
 */

import { createSelector } from 'reselect';

const selectGlobal = (state) => state.get('global');

const makeSelectCurrentUser = () =>
  createSelector(selectGlobal, (globalState) => globalState.get('currentUser').toJS());

export { makeSelectCurrentUser };
