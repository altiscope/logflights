/*
 *
 * api.js Axios Instance
 *
 *
 */

import axios from 'axios';
import camelcaseKeysDeep from 'camelcase-keys-deep';
import decamelizeKeysDeep from 'decamelize-keys-deep';

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

  // Convert response from_this toThis
  if (options.camelize || options.camelcaseResponse) {
    api.interceptors.response.use((response) => {
      if (response.data) {
        response.data = camelcaseKeysDeep(response.data);
      }
      return response;
    });
  }

  // Convert request fromThis to_this
  if (options.camelize || options.snakecaseRequest) {
    api.interceptors.request.use((request) => {
      if (request.params) {
        request.params = decamelizeKeysDeep(request.params);
      }
      if (request.data) {
        request.data = decamelizeKeysDeep(request.data);
      }
      return request;
    });
  }

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
