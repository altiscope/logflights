import { createSelector } from 'reselect';

/**
 * Direct selector to the vehiclesPage state domain
 */
const selectVehiclesPageDomain = (state) => state.get('vehiclesPage');

/**
 * Other specific selectors
 */


/**
 * Default selector used by VehiclesPage
 */

const makeSelectVehiclesPage = () => createSelector(
  selectVehiclesPageDomain,
  (substate) => substate.toJS()
);

export default makeSelectVehiclesPage;
export {
  selectVehiclesPageDomain,
};
