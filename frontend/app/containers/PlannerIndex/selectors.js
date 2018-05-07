import { createSelector } from 'reselect';
import moment from 'moment';

/**
 * Direct selector to the plannerIndex state domain
 */
const selectPlannerIndexDomain = (state) => state.get('plannerIndex');

/**
 * Other specific selectors
 */

const makeSelectPlannedFlights = () => createSelector(
  selectPlannerIndexDomain,
  (substate) => {
    const plannedFlights = substate.getIn(['data', 'plannedFlights']).toJS();

    return plannedFlights.map((p, i) => ({
      sNo: String(i + 1),
      key: p.id,
      id: p.id,
      flight_id: p.flight_id,
      state: p.state,
      operator: p.operator,
      vehicle: p.vehicle.serial_number,
      departure_time: moment.unix(p.planned_departure_time).utc().format('YYYY-MM-DD HH:mm:ss'),
      arrival_time: moment.unix(p.planned_arrival_time).utc().format('YYYY-MM-DD HH:mm:ss'),
    }));
  }
);

/**
 * Default selector used by PlannerIndex
 */

const makeSelectPlannerIndex = () => createSelector(
  selectPlannerIndexDomain,
  (substate) => substate.toJS()
);

export default makeSelectPlannerIndex;
export {
  selectPlannerIndexDomain,
  makeSelectPlannedFlights,
};
