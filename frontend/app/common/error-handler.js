/*
 *
 * Global Saga error handler
 *
 */

import { message } from 'antd';

export default function errorHandler(error, defaultMessage = 'Something went wrong.') {
  if (error.response && error.response.status && error.response.status === 401) {
    return window.location.replace('/accounts/login');
  }

  console.error(error);
  return message.error(defaultMessage);
}
