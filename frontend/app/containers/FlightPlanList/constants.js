/*
 *
 * FlightPlanList constants
 *
 */

export const GET_FLIGHT_PLANS = 'app/FlightPlanList/GET_FLIGHT_PLANS';
export const GET_FLIGHT_PLANS_FULFILLED = 'app/FlightPlanList/GET_FLIGHT_PLANS_FULFILLED';
export const GET_FLIGHT_PLANS_PENDING = 'app/FlightPlanList/GET_FLIGHT_PLANS_PENDING';
export const INVALIDATE_FLIGHT_PLAN = 'app/FlightPlanList/INVALIDATE_FLIGHT_PLAN';
export const INVALIDATE_FLIGHT_PLAN_PENDING = 'app/FlightPlanList/INVALIDATE_FLIGHT_PLAN_PENDING';
export const INVALIDATE_FLIGHT_PLAN_FULFILLED =
  'app/FlightPlanList/INVALIDATE_FLIGHT_PLAN_FULFILLED';
export const SET_FLIGHT_PLANS_FILTER = 'app/FlightPlanList/SET_FLIGHT_PLANS_FILTER';
export const CLONE_FLIGHT_PLAN = 'app/FlightPlanList/CLONE_FLIGHT_PLAN';
export const CLONE_FLIGHT_PLAN_PENDING = 'app/FlightPlanList/CLONE_FLIGHT_PLAN_PENDING';
export const CLONE_FLIGHT_PLAN_FULFILLED = 'app/FlightPlanList/CLONE_FLIGHT_PLAN_FULFILLED';
export const MARK_AS_COMPLETED = 'app/FlightPlanList/MARK_AS_COMPLETED';
export const MARK_AS_COMPLETED_PENDING = 'app/FlightPlanList/MARK_AS_COMPLETED_PENDING';
export const MARK_AS_COMPLETED_FULFILLED = 'app/FlightPlanList/MARK_AS_COMPLETED_FULFILLED';

export const flightPlanStates = {
  PLANNED: 'planned',
  COMPLETED: 'completed',
  INVALID: 'invalid',
  DELETED: 'deleted',
};

export const flightPlanGridColumns = [
  {
    title: 'Flight ID',
    dataIndex: 'flight_id',
    key: 'flight_id',
    sorter: (a, b) => a.flight_id.localeCompare(b.flight_id),
  },
  {
    title: 'State',
    dataIndex: 'state',
    key: 'state',
    sorter: (a, b) => a.state.localeCompare(b.state),
  },
  {
    title: 'Departure Time',
    dataIndex: 'planned_departure_time',
    key: 'planned_departure_time',
    sorter: (a, b) => a.planned_departure_time.localeCompare(b.planned_departure_time),
  },
  {
    title: 'Arrival Time',
    dataIndex: 'planned_arrival_time',
    key: 'planned_arrival_time',
    sorter: (a, b) => a.planned_arrival_time.localeCompare(b.planned_arrival_time),
  },
  {
    title: 'Payload',
    dataIndex: 'payload_weight',
    key: 'payload_weight',
    sorter: (a, b) => String(a.payload_weight).localeCompare(String(b.payload_weight)),
  },
  {
    title: 'Vehicle',
    dataIndex: 'vehicle',
    key: 'vehicle',
    sorter: (a, b) => a.vehicle.localeCompare(b.vehicle),
  },
];
