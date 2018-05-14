import { createSelector } from 'reselect';

/**
 * Direct selector to the vehicleForm state domain
 */
const selectVehicleFormDomain = (state) => state.get('vehicleForm');

/**
 * Other specific selectors
 */

/**
 * Default selector used by VehicleForm
 */

const makeSelectVehicleForm = () =>
  createSelector(selectVehicleFormDomain, (substate) => substate.toJS());

export default makeSelectVehicleForm;
export { selectVehicleFormDomain };
