/*
 *
 * FlightPlanForm Sagas
 *
 */

import { takeLatest, call, put } from 'redux-saga/effects';
import moment from 'moment';
import { push } from 'react-router-redux';
import randomstring from 'randomstring';
import { message } from 'antd';
import { getClient } from 'services/api';
import errorHandler from 'common/error-handler';
import {
  GET_VEHICLES,
  GET_MISSION_TYPES,
  CREATE_FLIGHT_PLAN,
  GET_FLIGHT_PLAN,
  UPDATE_FLIGHT_PLAN,
  UPLOAD_WAYPOINTS,
} from './constants';
import {
  getMissionTypesPending,
  getVehiclesPending,
  getMissionTypesFulFilled,
  getVehiclesFulFilled,
  createFlightPlanFulfilled,
  createFlightPlanPending,
  getFlightPlanPending,
  getFlightPlanFulfilled,
  updateFlightPlanPending,
  updateFlightPlanFulfilled,
  uploadWaypointsPending,
  uploadWaypointsFulfilled,
  setUploadedWaypoint,
} from './actions';

export function* uploadWaypoints(action) {
  try {
    const getUploadUrl = '/plans/uploads/init/';
    const setUploadCompleteUrl = '/plans/uploads/';
    const tempId = randomstring.generate(7);
    const { type, file, onSuccess, onError, onProgress } = action.payload;

    onProgress({ percent: 10 });
    // get upload url
    const getUploadUrlResponse = yield call(getClient().post, getUploadUrl, {
      params: {
        id: tempId,
        type,
        filename: file.name,
        size: file.size,
      },
    });

    onProgress({ percent: 25 });
    // upload file to google cloud
    yield call(
      getClient({ timeout: 60 * 60 * 1000 }).put,
      getUploadUrlResponse.data.upload_url,
      file
    );
    onProgress({ percent: 50 });

    // set upload complete
    const uploadCompleteResponse = yield call(
      getClient().post,
      setUploadCompleteUrl,
      {
        params: {
          id: tempId,
          type,
          filename: file.name,
          size: file.size,
          timestamp: getUploadUrlResponse.data.timestamp,
        },
      }
    );

    const checkState = () =>
      new Promise((resolve, reject) => {
        const check = async function checkUploadStatus() {
          const status = await getClient().get(uploadCompleteResponse.data.url);

          if (status.data.state === 'p') {
            resolve();
          } else if (status.data.state === 'e') {
            reject(status.data.error);
          } else {
            setTimeout(check, 1000);
          }
        };

        check();

        onProgress({ percent: 75 });
      });

    try {
      yield call(checkState);
    } catch (errorMessage) {
      onError();
      yield put(uploadWaypointsPending(false));
      message.error(errorMessage);
      return;
    }

    onProgress({ percent: 75 });

    onSuccess(uploadCompleteResponse.body, file, uploadCompleteResponse);

    yield put(uploadWaypointsFulfilled(uploadCompleteResponse.data));
    // yield put(uploadWaypointsFulfilled({ ...uploadCompleteResponse.data, fileName: file.name }));
  } catch (e) {
    yield put(uploadWaypointsPending(false));
    errorHandler(e);
  }
}

export function* getFlightPlan(action) {
  try {
    const { flightPlanId } = action.payload;

    yield put(getFlightPlanPending(true));

    const response = yield call(getClient().get, `/plans/${flightPlanId}/`);
    const flightPlan = response.data;

    if (flightPlan.waypoints) {
      // extract file name
      const waypointsPath = flightPlan.waypoints.path || '';
      const fileSegment = decodeURIComponent(
        waypointsPath.slice(waypointsPath.lastIndexOf('/') + 1)
      );

      const fileName = fileSegment.slice(fileSegment.lastIndexOf('/') + 1);

      // set default uploaded file if exist
      yield put(
        setUploadedWaypoint([
          {
            uid: flightPlan.waypoints.id,
            name: fileName,
            status: 'done',
          },
        ])
      );
    }

    // convert unix timestamps to date
    // TODO: refactor this, remove duplicate
    yield put(
      getFlightPlanFulfilled({
        ...flightPlan,
        // planned_arrival_time: moment(new Date(flightPlan.planned_arrival_time * 1000), 'YYYY-MM-DD HH:mm:ss'),
        // planned_departure_time: moment(new Date(flightPlan.planned_departure_time * 1000), 'YYYY-MM-DD HH:mm:ss'),
        planned_arrival_time: moment
          .unix(response.data.planned_arrival_time)
          .utc(),
        planned_departure_time: moment
          .unix(response.data.planned_departure_time)
          .utc(),
      })
    );
  } catch (e) {
    yield put(getFlightPlanPending(false));
    errorHandler(e);
  }
}

export function* createFlightPlan(action) {
  try {
    yield put(createFlightPlanPending(true));

    const { flightPlan } = action.payload;
    const payload = new FormData();

    // convert to form data
    Object.keys(flightPlan).forEach((key) => {
      if (key === 'planned_arrival_time' || key === 'planned_departure_time') {
        payload.append(
          key,
          moment(flightPlan[key]).format('YYYY-MM-DDThh:mm:ss')
        ); // format date
      } else {
        payload.append(key, flightPlan[key]);
      }
    });

    const response = yield call(getClient().post, '/plans/', payload);

    // get created flight plan
    const createdFlightPlan = yield call(
      getClient().get,
      `/plans/${response.data.id}/`
    );

    yield put(
      createFlightPlanFulfilled({
        ...createdFlightPlan.data,
        planned_arrival_time: moment
          .unix(response.data.planned_arrival_time)
          .utc(),
        planned_departure_time: moment
          .unix(response.data.planned_departure_time)
          .utc(),
      })
    );

    message.success('Flight Plan Successfully Created');
    yield put(push('/dashboard/flight-plans'));
  } catch (e) {
    yield put(createFlightPlanPending(false));
    errorHandler(e);
  }
}

export function* updateFlightPlan(action) {
  try {
    yield put(updateFlightPlanPending(true));

    const { flightPlan } = action.payload;
    const payload = new FormData();

    // convert to form data
    Object.keys(flightPlan).forEach((key) => {
      if (key === 'planned_arrival_time' || key === 'planned_departure_time') {
        payload.append(
          key,
          moment(flightPlan[key]).format('YYYY-MM-DDThh:mm:ss')
        ); // format date
      } else {
        payload.append(key, flightPlan[key]);
      }
    });

    // check if waypoint is marked for deletion
    if (action.payload.removeWaypoint) {
      yield call(getClient().delete, `/plans/${flightPlan.id}/waypoint/`);
    }

    const response = yield call(
      getClient().patch,
      `/plans/${flightPlan.id}/`,
      payload
    );

    // get updated flight plan
    const updatedFlightPlan = yield call(
      getClient().get,
      `/plans/${flightPlan.id}/`
    );

    // set uploaded waypoint for Upload Component
    if (updatedFlightPlan.data.waypoints) {
      // extract file name
      const waypointsPath = updatedFlightPlan.data.waypoints.path || '';
      const fileSegment = decodeURIComponent(
        waypointsPath.slice(waypointsPath.lastIndexOf('/') + 1)
      );

      const fileName = fileSegment.slice(fileSegment.lastIndexOf('/') + 1);

      // set default uploaded file if exist
      yield put(
        setUploadedWaypoint([
          {
            uid: updatedFlightPlan.data.waypoints.id,
            name: fileName,
            status: 'done',
            url: updatedFlightPlan.data.waypoints.path,
          },
        ])
      );
    }

    // save flight plan data
    yield put(
      updateFlightPlanFulfilled({
        ...updatedFlightPlan.data,
        planned_arrival_time: moment
          .unix(response.data.planned_arrival_time)
          .utc(),
        planned_departure_time: moment
          .unix(response.data.planned_departure_time)
          .utc(),
      })
    );

    message.success('Flight Plan Successfully Updated');
    yield put(push('/dashboard/flight-plans'));
  } catch (e) {
    yield put(updateFlightPlanPending(false));
    errorHandler(e);
  }
}

export function* getMissionTypes() {
  try {
    yield put(getMissionTypesPending(true));
    const response = yield call(getClient().get, '/mission_types/');

    yield put(getMissionTypesFulFilled(response.data.results));
  } catch (e) {
    yield put(getMissionTypesPending(false));
    errorHandler(e);
  }
}

export function* getVehicles() {
  try {
    yield put(getVehiclesPending(true));

    // only active vehicles can be assigned to a plan
    const response = yield call(getClient().get, '/vehicles/', {
      params: {
        state: 'active',
      },
    });

    yield put(getVehiclesFulFilled(response.data.results));
  } catch (e) {
    yield put(getVehiclesPending(false));
    errorHandler(e);
  }
}

// Individual exports for testing
export default function* flightPlanFormRootSaga() {
  yield [
    takeLatest(GET_MISSION_TYPES, getMissionTypes),
    takeLatest(GET_VEHICLES, getVehicles),
    takeLatest(CREATE_FLIGHT_PLAN, createFlightPlan),
    takeLatest(GET_FLIGHT_PLAN, getFlightPlan),
    takeLatest(UPDATE_FLIGHT_PLAN, updateFlightPlan),
    takeLatest(UPLOAD_WAYPOINTS, uploadWaypoints),
  ];
}
