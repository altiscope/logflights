/**
 *
 * PrivateRoute
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import jwtDecode from 'jwt-decode';
import { Route, Redirect } from 'react-router-dom';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const token = localStorage.getItem('token');

  /*
   * check faulty tokens
   */
  try {
    jwtDecode(token);
  } catch (e) {
    localStorage.removeItem('token'); // remove faulty token
    return (
      <Redirect
        to={{
          pathname: '/accounts/login',
        }}
      />
    );
  }

  return (
    <Route
      {...rest}
      render={(props) =>
        token ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: '/accounts/login',
              state: { from: props.location },
            }}
          />
        )
      }
    />
  );
};

PrivateRoute.propTypes = {
  component: PropTypes.any,
  location: PropTypes.any,
};

export default PrivateRoute;
