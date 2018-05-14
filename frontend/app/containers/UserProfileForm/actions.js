/*
 *
 * UserProfileForm actions
 *
 */

import {
  GET_USER_PROFILE,
  GET_USER_PROFILE_FULFILLED,
  GET_USER_PROFILE_PENDING,
  UPDATE_USER_PROFILE,
  UPDATE_USER_PROFILE_PENDING,
  UPDATE_USER_PROFILE_FULFILLED,
} from './constants';

export function getUserProfile(userId) {
  return {
    type: GET_USER_PROFILE,
    payload: { userId },
  };
}

export function getUserProfileFulfilled(userProfile) {
  return {
    type: GET_USER_PROFILE_FULFILLED,
    payload: { userProfile },
  };
}

export function getUserProfilePending(isPending) {
  return {
    type: GET_USER_PROFILE_PENDING,
    payload: { isPending },
  };
}

export function updateUserProfile(userProfile) {
  return {
    type: UPDATE_USER_PROFILE,
    payload: { userProfile },
  };
}

export function updateUserProfilePending(isPending) {
  return {
    type: UPDATE_USER_PROFILE_PENDING,
    payload: { isPending },
  };
}

export function updateUserProfileFulfilled(userProfile) {
  return {
    type: UPDATE_USER_PROFILE_FULFILLED,
    payload: { userProfile },
  };
}
