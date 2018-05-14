/*
 *
 * FlightPlanDetails constants
 *
 */

export const GET_PLAN = 'details/GET_PLAN';
export const GET_PLAN_PENDING = 'details/GET_PLAN_PENDING';
export const GET_PLAN_FULFILLED = 'details/GET_PLAN_FULFILLED';
export const GET_WAYPOINTS = 'details/GET_WAYPOINTS';
export const GET_WAYPOINTS_FULFILLED = 'details/GET_WAYPOINTS_FULFILLED';
export const GET_WAYPOINTS_PENDING = 'details/GET_WAYPOINTS_PENDING';
export const GET_TELEMETRY = 'details/GET_TELEMETRY';
export const GET_TELEMETRY_PENDING = 'details/GET_TELEMETRY_PENDING';
export const GET_TELEMETRY_FULFILLED = 'details/GET_TELEMETRY_FULFILLED';
export const CLEAR_PLAN_DETAILS_STATE = 'details/CLEAR_PLAN_DETAILS_STATE';
export const UPLOAD_TELEMETRY = 'details/UPLOAD_TELEMETRY';
export const UPLOAD_TELEMETRY_PENDING = 'details/UPLOAD_TELEMETRY_PENDING';
export const UPLOAD_TELEMETRY_FULFILLED = 'details/UPLOAD_TELEMETRY_FULFILLED';
export const SET_UPLOADED_TELEMETRY = 'details/SET_UPLOADED_TELEMETRY';
export const DELETE_TELEMETRY = 'details/DELETE_TELEMETRY';
export const DELETE_TELEMETRY_PENDING = 'details/DELETE_TELEMETRY_PENDING';
export const DELETE_TELEMETRY_FULFILLED = 'details/DELETE_TELEMETRY_FULFILLED';
export const TELEMETRY_PROCESSING = 'detals/TELEMETRY_PROCESSING';

export const waypointsGridColumns = [
  {
    title: 'sNo.',
    dataIndex: 'sNo',
    key: 'sNo',
  },
  {
    title: 'Latitude',
    dataIndex: 'latitude',
    key: 'latitude',
  },
  {
    title: 'Longitude',
    dataIndex: 'longitude',
    key: 'longitude',
  },
  {
    title: 'Altitude',
    dataIndex: 'altitude',
    key: 'altitude',
  },
];

/* eslint-disable */
export const mapStyles = [
  // Style of map
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#263c3f' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b9a76' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#38414e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212a37' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca5b3' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#746855' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f2835' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f3d19c' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2f3948' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#17263c' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#515c6d' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#17263c' }],
  },
];

/* eslint-enable */
