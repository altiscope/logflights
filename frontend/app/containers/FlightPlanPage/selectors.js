import { createSelector } from 'reselect';

/**
 * Direct selector to the flightPlanPage state domain
 */
const selectFlightPlanPageDomain = (state) => state.get('flightPlanPage');

/**
 * Other specific selectors
 */

/**
 * Default selector used by FlightPlanPage
 */

const makeSelectFlightPlanPage = () =>
  createSelector(selectFlightPlanPageDomain, (substate) => substate.toJS());

export default makeSelectFlightPlanPage;
export { selectFlightPlanPageDomain };
