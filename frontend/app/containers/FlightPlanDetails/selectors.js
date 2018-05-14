import { createSelector } from 'reselect';

/**
 * Direct selector to the flightPlanDetails state domain
 */
const selectFlightPlanDetailsDomain = (state) => state.get('flightPlanDetails');

/**
 * Other specific selectors
 */

/**
 * Default selector used by FlightPlanDetails
 */

const makeSelectFlightPlanDetails = () =>
  createSelector(selectFlightPlanDetailsDomain, (substate) => substate.toJS());

export default makeSelectFlightPlanDetails;
export { selectFlightPlanDetailsDomain };
