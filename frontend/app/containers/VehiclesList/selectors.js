import { createSelector } from 'reselect';
import { VEHICLE_TYPES } from './constants';

/**
 * Direct selector to the vehiclesList state domain
 */
const selectVehiclesListDomain = (state) => state.get('vehiclesList');

/**
 * Other specific selectors
 */

const makeSelectVehicles = () => createSelector(
  selectVehiclesListDomain,
  (state) => {
    const filter = state.getIn(['ui', 'vehiclesFilter']);
    const vehicles = state.getIn(['data', 'vehicles'])
      .filter((v) => v.get('state') === filter)
      .map((v, i) =>
        v
          .set('vehicle_type', VEHICLE_TYPES[v.get('vehicle_type')])
          .set('key', v.get('id'))
          .set('sNo', String(i + 1))
      );

    return vehicles.toJS();
  }
);


/**
 * Default selector used by VehiclesList
 */

const makeSelectVehiclesList = () => createSelector(
  selectVehiclesListDomain,
  (substate) => substate.toJS()
);

export default makeSelectVehiclesList;
export {
  selectVehiclesListDomain,
  makeSelectVehicles,
};
