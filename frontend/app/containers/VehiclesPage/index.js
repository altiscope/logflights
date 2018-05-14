/**
 *
 * VehiclesPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { Switch, Route, Redirect } from 'react-router-dom';

import VehiclesList from 'containers/VehiclesList';
import VehicleForm from 'containers/VehicleForm';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import makeSelectVehiclesPage from './selectors';
import reducer from './reducer';
import saga from './saga';

const VEHICLES_LIST_PATH = (url) => `${url}`;
const CREATE_VEHICLE_PATH = (url) => `${url}/new`;
const UPDATE_VEHICLE_PATH = (url) => `${url}/:id/update`;

export const VehiclesPage = ({ match }) => (
  <div>
    <Switch>
      <Route exact path={VEHICLES_LIST_PATH(match.url)} component={VehiclesList} />
      <Route exact path={CREATE_VEHICLE_PATH(match.url)} component={VehicleForm} />
      <Route path={UPDATE_VEHICLE_PATH(match.url)} component={VehicleForm} />
      <Route path="" render={() => <Redirect push to="/not-found" />} />
    </Switch>
  </div>
);

VehiclesPage.propTypes = {
  match: PropTypes.object,
};

const mapStateToProps = createStructuredSelector({
  vehiclespage: makeSelectVehiclesPage(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);

const withReducer = injectReducer({ key: 'vehiclesPage', reducer });
const withSaga = injectSaga({ key: 'vehiclesPage', saga });

export default compose(withReducer, withSaga, withConnect)(VehiclesPage);
