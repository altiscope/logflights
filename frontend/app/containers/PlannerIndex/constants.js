/*
 *
 * PlannerIndex constants
 *
 */

export const GET_PLANNED_FLIGHTS = 'app/PlannerIndex/GET_PLANNED_FLIGHTS';
export const GET_PLANNED_FLIGHTS_FULFILLED = 'app/PlannerIndex/GET_PLANNED_FLIGHTS_FULFILLED';
export const GET_PLANNED_FLIGHTS_PENDING = 'app/PlannerIndex/GET_PLANNED_FLIGHTS_PENDING';
export const GET_OPERATORS = 'app/PlannerIndex/GET_OPERATORS';
export const GET_OPERATORS_PENDING = 'app/PlannerIndex/GET_OPERATORS_PENDING';
export const GET_OPERATORS_FULFILLED = 'app/PlannerIndex/GET_OPERATORS/FULFILLED';

// flight_id, state, operator, vehicle, departure_time, arrival_time, action = details only
export const gridColumns = [
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
    title: 'Operator',
    dataIndex: 'operator',
    key: 'operator',
    sorter: (a, b) => a.operator.localeCompare(b.operator),
  },
  {
    title: 'Vehicle',
    dataIndex: 'vehicle',
    key: 'vehicle',
    sorter: (a, b) => a.vehicle.localeCompare(b.vehicle),
  },
  {
    title: 'Departure Time',
    dataIndex: 'departure_time',
    key: 'departure_time',
    sorter: (a, b) => a.departure_time.localeCompare(b.departure_time),
  },
  {
    title: 'Arrival Time',
    dataIndex: 'arrival_time',
    key: 'arrival_time',
    sorter: (a, b) => a.arrival_time.localeCompare(b.arrival_time),
  },
];
