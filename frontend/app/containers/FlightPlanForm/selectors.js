import { createSelector } from 'reselect';

/**
 * Direct selector to the flightPlanForm state domain
 */
const selectFlightPlanFormDomain = (state) => state.get('flightPlanForm');

/**
 * Other specific selectors
 */


/**
 * Default selector used by FlightPlanForm
 */

const makeSelectFlightPlanForm = () => createSelector(
  selectFlightPlanFormDomain,
  (substate) => substate.toJS()
);

export default makeSelectFlightPlanForm;
export {
  selectFlightPlanFormDomain,
};
