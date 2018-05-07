/*
 *
 * Common Actions
 *
 */

import { REQUEST_FAILED } from './constants';

export function requestFailed(errorMessage) {
  return {
    type: REQUEST_FAILED,
    payload: { errorMessage },
  };
}
