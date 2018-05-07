/*
 *
 * api.js Axios Instance
 *
 *
 */

import axios from 'axios';

let defaultOptions;

export function getClient(options = {}) {
  if (!defaultOptions) throw new Error('API options are not initialized');

  const getToken = () => `JWT ${localStorage.getItem('token') || ''}`;

  const api = axios.create({
    ...defaultOptions,
    headers: {
      Authorization: getToken(),
    },
    ...options,
  });

  return api;
}

export function getAnonymousClient(options = {}) {
  if (!defaultOptions) throw new Error('API options are not initialized');

  const api = axios.create({
    ...defaultOptions,
    ...options,
  });

  return api;
}

export function initialize({ baseURL, timeout }) {
  defaultOptions = {
    baseURL,
    timeout,
  };
}

export const getDefaultOptions = () => defaultOptions;
