/*
 *
 * FlightPlanList Selector
 *
 */

import { createSelector } from 'reselect';
import moment from 'moment';
import _ from 'lodash';

/**
 * Direct selector to the flightPlanList state domain
 */
const selectFlightPlanListDomain = (state) => state.get('flightPlanList');

/**
 * Other specific selectors
 */

const makeSelectFlightPlans = () => createSelector(
  selectFlightPlanListDomain,
  (state) => {
    const flightPlansFilter = state.getIn(['ui', 'flightPlansFilter']);
    const mapFn = (plan, i) => (
      plan
        .set('key', plan.get('id'))
        .set('sNo', String(i + 1))
        .set('vehicle', plan.getIn(['vehicle', 'model']))
        .set('planned_departure_time', moment.unix(plan.get('planned_departure_time')).utc().format('YYYY-MM-DD HH:mm:ss'))
        .set('planned_arrival_time', moment.unix(plan.get('planned_arrival_time')).utc().format('YYYY-MM-DD HH:mm:ss'))
    );

    if (flightPlansFilter === 'active') {
      return _.orderBy(state
        .getIn(['data', 'flightPlans'])
        .filter((f) => f.get('state') === 'planned' ||
          f.get('state') === 'completed')
        .map(mapFn).toJS(), ['planned_departure_time'], ['desc']);
    }

    return _.orderBy(state
      .getIn(['data', 'flightPlans'])
      .filter((f) => f.get('state') === 'invalid')
      .map(mapFn).toJS(), ['planned_departure_time'], ['desc']);
  }
);


/**
 * Default selector used by FlightPlanList
 */

const makeSelectFlightPlanList = () => createSelector(
  selectFlightPlanListDomain,
  (substate) => substate.toJS()
);

export default makeSelectFlightPlanList;
export {
  selectFlightPlanListDomain,
  makeSelectFlightPlans,
};
