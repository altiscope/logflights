/**
 *
 * FlightPlanDetails
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose, bindActionCreators } from 'redux';
import _ from 'lodash';
import { Row, Col, Spin } from 'antd';
import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import { makeSelectCurrentUser } from 'common/selectors';
import H1 from 'components/H1';
import makeSelectFlightPlanDetails from './selectors';
import reducer from './reducer';
import saga from './saga';
import FlightInfo from './FlightInfo';
import Map from './Map';
import {
  getPlan,
  getWaypoints,
  getTelemetry,
  clearPlanDetailsState,
  uploadTelemetry,
  setUploadedTelemetry,
  deleteTelemetry,
} from './actions';
import Assessment from './Assessment';

export class FlightPlanDetails extends React.Component {
  componentDidMount() {
    const planId = this.props.match.params.id;

    this.props.getPlan(planId);
    this.props.getWaypoints(planId);
    this.props.getTelemetry(planId);
  }

  componentWillUnmount() {
    this.props.clearPlanDetailsState();
  }

  getDate = () =>
    new Date().toLocaleDateString('en-US', {
      timeZone: 'UTC',
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  render() {
    const { flightPlanDetails } = this.props;
    const {
      getFlightPlanPending,
      getWaypointsPending,
      telemetryProcessing,
      getTelemetryPending,
    } = flightPlanDetails.ui;

    const isLoading =
      getFlightPlanPending || getWaypointsPending || telemetryProcessing || getTelemetryPending;

    const telemetry = _.get(flightPlanDetails.data, 'telemetry', []);

    const isOwner =
      _.get(flightPlanDetails, 'data.flightPlan.operator.user_id') === this.props.currentUser.id;
    return (
      <main>
        <Spin spinning={isLoading}>
          <Row type="flex" justify="start">
            <Col md={{ span: 12 }} sm={{ span: 12 }} className="lf-u-padding-xl">
              <H1>{_.get(flightPlanDetails.data.flightPlan, 'operator.organization', '')}</H1>
              <FlightInfo
                mode={this.props.mode}
                flightPlan={flightPlanDetails.data.flightPlan}
                uploadTelemetry={this.props.uploadTelemetry}
                setUploadedTelemetry={this.props.setUploadedTelemetry}
                uploadedTelemetry={flightPlanDetails.ui.uploadedTelemetry}
                deleteTelemetry={this.props.deleteTelemetry}
                telemetry={telemetry}
                currentUser={this.props.currentUser}
                isLoading={isLoading}
                isOwner={this.props.mode === 'public' ? false : isOwner}
                waypoints={
                  this.props.mode === 'public'
                    ? []
                    : _.get(flightPlanDetails, 'data.waypoints.waypoints', [])
                }
              />
              {isOwner && <Assessment flightPlanId={this.props.match.params.id} />}
            </Col>
            <Col span="12">
              <Map
                organization={_.get(this.props, 'currentUser.organization', '')}
                flightPlanOperator={_.get(
                  this.props.flightPlanDetails.data,
                  'flightPlan.operator.organization',
                  ''
                )}
                mode={this.props.mode}
                matchUrl={this.props.match.url}
                waypoints={flightPlanDetails.data.waypoints}
                telemetry={telemetry}
                getWaypointsFulfilled={flightPlanDetails.ui.getWaypointsFulFilled}
                getTelemetryFulfilled={flightPlanDetails.ui.getTelemetryFulfilled}
                uploadTelemetryPending={flightPlanDetails.ui.uploadTelemetryPending}
              />
            </Col>
          </Row>
        </Spin>
      </main>
    );
  }
}

FlightPlanDetails.defaultProps = {
  mode: 'private',
};

FlightPlanDetails.propTypes = {
  flightPlanDetails: PropTypes.object.isRequired,
  getPlan: PropTypes.func.isRequired,
  mode: PropTypes.oneOf(['public', 'private']),
  getWaypoints: PropTypes.func.isRequired,
  clearPlanDetailsState: PropTypes.func.isRequired,
  getTelemetry: PropTypes.func.isRequired,
  match: PropTypes.object,
  uploadTelemetry: PropTypes.func,
  deleteTelemetry: PropTypes.func,
  setUploadedTelemetry: PropTypes.func,
  currentUser: PropTypes.object,
};

const mapStateToProps = createStructuredSelector({
  flightPlanDetails: makeSelectFlightPlanDetails(),
  currentUser: makeSelectCurrentUser(),
});

function mapDispatchToProps(dispatch) {
  return {
    getPlan: bindActionCreators(getPlan, dispatch),
    getWaypoints: bindActionCreators(getWaypoints, dispatch),
    getTelemetry: bindActionCreators(getTelemetry, dispatch),
    clearPlanDetailsState: bindActionCreators(clearPlanDetailsState, dispatch),
    uploadTelemetry: bindActionCreators(uploadTelemetry, dispatch),
    setUploadedTelemetry: bindActionCreators(setUploadedTelemetry, dispatch),
    deleteTelemetry: bindActionCreators(deleteTelemetry, dispatch),
  };
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);

const withReducer = injectReducer({ key: 'flightPlanDetails', reducer });
const withSaga = injectSaga({ key: 'flightPlanDetails', saga });

export default compose(withReducer, withSaga, withConnect)(FlightPlanDetails);
