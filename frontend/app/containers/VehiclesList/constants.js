/*
 *
 * VehiclesList constants
 *
 */

const NAMESPACE = 'app/VehiclesList';

export const GET_VEHICLES = 'app/VehiclesList/GET_VEHICLES';
export const GET_VEHICLES_PENDING = `${NAMESPACE}/GET_VEHICLES_PENDING`;
export const GET_VEHICLES_FULFILLED = `${NAMESPACE}/GET_VEHICLES_FULFILLED`;
export const SET_VEHICLES_FILTER = `${NAMESPACE}/SET_VEHICLES_FILTER`;

export const vehicleGridColumns = [
  {
    title: 'SNo. #',
    dataIndex: 'sNo',
    key: 'sNo',
    sorter: (a, b) => a.sNo.localeCompare(b.sNo),
  },
  {
    title: 'Model',
    dataIndex: 'model',
    key: 'model',
    sorter: (a, b) => a.model.localeCompare(b.model),
  },
  {
    title: 'Serial Number',
    dataIndex: 'serial_number',
    key: 'serial_number',
    sorter: (a, b) => a.serial_number.localeCompare(b.serial_number),
  },
  {
    title: 'Type of Vehicle',
    dataIndex: 'vehicle_type',
    key: 'vehicle_type',
    sorter: (a, b) => a.vehicle_type.localeCompare(b.vehicle_type),
  },
  {
    title: 'Weight of Empty Vehicle',
    dataIndex: 'empty_weight',
    key: 'empty_weight',
    sorter: (a, b) => String(a.empty_weight).localeCompare(String(b.empty_weight)),
  },
  {
    title: 'Operator',
    dataIndex: 'operator',
    key: 'operator',
    sorter: (a, b) => a.operator.localeCompare(b.operator),
  },
];

export const VEHICLE_TYPES = {
  0: 'Unknown',
  1: 'Multicopter',
  2: 'Fixed Wing',
  3: 'VTOL',
};
