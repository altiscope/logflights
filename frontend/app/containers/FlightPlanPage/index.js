/**
 *
 * FlightPlanPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { Switch, Route, Redirect } from 'react-router-dom';

import FlightPlanList from 'containers/FlightPlanList';
import FlightPlanForm from 'containers/FlightPlanForm';
import FlightPlanDetails from 'containers/FlightPlanDetails';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import makeSelectFlightPlanPage from './selectors';
import reducer from './reducer';
import saga from './saga';

const FLIGHT_PLANS_LIST_PATH = (url) => `${url}/`;
const FLIGHT_PLAN_DETAILS_PATH = (url) => `${url}/:id`;
const FLIGHT_PLAN_CREATE_PATH = (url) => `${url}/new`;
const FLIGHT_PLAN_UPDATE_PATH = (url) => `${url}/:id/update`;

export const FlightPlanPage = ({ match }) => (
  <div>
    <Switch>
      <Route exact path={FLIGHT_PLANS_LIST_PATH(match.url)} component={FlightPlanList} />
      <Route exact path={FLIGHT_PLAN_CREATE_PATH(match.url)} component={FlightPlanForm} />
      <Route exact path={FLIGHT_PLAN_DETAILS_PATH(match.url)} component={FlightPlanDetails} />
      <Route exact path={FLIGHT_PLAN_UPDATE_PATH(match.url)} component={FlightPlanForm} />
      <Route path="" render={() => <Redirect push to="/not-found" />} />
    </Switch>
  </div>
);

FlightPlanPage.propTypes = {
  match: PropTypes.object,
};

const mapStateToProps = createStructuredSelector({
  flightplanpage: makeSelectFlightPlanPage(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);

const withReducer = injectReducer({ key: 'flightPlanPage', reducer });
const withSaga = injectSaga({ key: 'flightPlanPage', saga });

export default compose(withReducer, withSaga, withConnect)(FlightPlanPage);
