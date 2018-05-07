/*
 *
 * FlightPlan Details Saga
 *
 */

import { takeLatest, call, put } from 'redux-saga/effects';
import {
  getClient,
  getAnonymousClient,
  getDefaultOptions as getDefaultAPIOptions,
} from 'services/api';
import { message } from 'antd';
import errorHandler from 'common/error-handler';
import {
  getPlanPending,
  getPlanFulfilled,
  getWaypointsPending,
  getWaypointsFulfilled,
  getTelemetryPending,
  getTelemetryFulfilled,
  uploadTelemetryPending,
  uploadTelemetryFulfilled,
  setUploadedTelemetry,
  deleteTelemetryPending,
  deleteTelemetryFulfilled,
  getPlan as getFlightPlan,
  getTelemetry as getFlightTelemetry,
  telemetryProcessing,
} from './actions';
import {
  GET_PLAN,
  GET_TELEMETRY,
  GET_WAYPOINTS,
  UPLOAD_TELEMETRY,
  DELETE_TELEMETRY,
} from './constants';

const getDownloadLink = (planId) => {
  // @TODO refactor to only need relative path
  const { baseURL } = getDefaultAPIOptions();
  return `${baseURL}/plans/${planId}/download_telemetry/`;
};

export function* deleteTelemetry(action) {
  try {
    yield put(deleteTelemetryPending(true));
    yield call(
      getClient().delete,
      `/plans/${action.payload.flightPlanId}/telemetry/`
    );
    yield put(deleteTelemetryFulfilled());
  } catch (e) {
    yield put(deleteTelemetryPending(false));
    errorHandler(e);
  }
}

export function* uploadTelemetry(action) {
  yield put(uploadTelemetryPending(true));
  try {
    const getUploadUrl = '/plans/uploads/init/';
    const setUploadCompleteUrl = '/plans/uploads/';
    const {
      type,
      file,
      onSuccess,
      onError,
      onProgress,
      flightPlanId,
    } = action.payload;

    onProgress({ percent: 10 });
    // get upload url
    const getUploadUrlResponse = yield call(getClient().post, getUploadUrl, {
      params: {
        id: flightPlanId,
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
          id: flightPlanId,
          type,
          filename: file.name,
          size: file.size,
          timestamp: getUploadUrlResponse.data.timestamp,
        },
      }
    );

    const checkState = () =>
      new Promise((resolve, reject) => {
        const check = async function getUploadStatus() {
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

    yield put(telemetryProcessing(true));
    try {
      yield call(checkState);
    } catch (errorMessage) {
      onError('invalid');
      yield put(telemetryProcessing(false));
      message.error(errorMessage);
      return;
    }
    yield put(telemetryProcessing(false));

    onSuccess(uploadCompleteResponse.body, file, uploadCompleteResponse);

    yield put(uploadTelemetryFulfilled(uploadCompleteResponse.data));
    // yield put(uploadWaypointsFulfilled({ ...uploadCompleteResponse.data, fileName: file.name }));

    yield put(getFlightPlan(flightPlanId));
    yield put(getFlightTelemetry(flightPlanId));
  } catch (e) {
    yield put(uploadTelemetryPending(false));
    errorHandler(e);
  }
}

export function* getPlan(action) {
  try {
    yield put(getPlanPending(true));

    const { planId } = action.payload;
    const response = yield call(getAnonymousClient().get, `/plans/${planId}/`);
    const flightPlan = response.data;

    if (flightPlan.telemetry) {
      // set default uploaded file if exist
      yield put(
        setUploadedTelemetry([
          {
            uid: flightPlan.telemetry.id,
            name: 'Download Telemetry',
            status: 'done',
            url: getDownloadLink(planId),
          },
        ])
      );
    }

    yield put(getPlanFulfilled(response.data));
  } catch (e) {
    yield put(getPlanPending(false));
    errorHandler(e);
  }
}

export function* getWaypoints(action) {
  try {
    yield put(getWaypointsPending(true));

    const { planId } = action.payload;
    const response = yield call(
      getAnonymousClient().get,
      `/plans/${planId}/waypoints/`
    );

    yield put(getWaypointsFulfilled(response.data));
  } catch (e) {
    yield put(getWaypointsPending(false));
    errorHandler(e);
  }
}

export function* getTelemetry(action) {
  try {
    yield put(getTelemetryPending(true));

    const { planId } = action.payload;
    const response = yield call(
      getAnonymousClient().get,
      `/plans/${planId}/telemetry/`
    );

    yield put(getTelemetryFulfilled(response.data));
  } catch (e) {
    yield put(getTelemetryPending(false));
    yield put(getTelemetryFulfilled([]));
    errorHandler(e);
  }
}

// Individual exports for testing
export default function* flightPlanDetailsRootSaga() {
  yield [
    takeLatest(GET_PLAN, getPlan),
    takeLatest(GET_WAYPOINTS, getWaypoints),
    takeLatest(GET_TELEMETRY, getTelemetry),
    takeLatest(UPLOAD_TELEMETRY, uploadTelemetry),
    takeLatest(DELETE_TELEMETRY, deleteTelemetry),
  ];
}
