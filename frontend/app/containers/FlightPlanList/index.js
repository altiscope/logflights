/**
 *
 * FlightPlanList
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose, bindActionCreators } from 'redux';
import moment from 'moment';
import { Row, Col, Table, Popconfirm } from 'antd';
import { Link } from 'react-router-dom';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import makeSelectFlightPlanList, { makeSelectFlightPlans } from './selectors';
import Filters from './Filters';
import reducer from './reducer';
import saga from './saga';
import { flightPlanGridColumns } from './constants';
import {
  getFlightPlans,
  invalidateFlightPlan,
  setFlightPlansFilter,
  cloneFlightPlan,
  markAsCompleted,
} from './actions';
import CloneFlightPlanLink from './CloneFlightPlanLink';

export class FlightPlanList extends React.Component {
  // eslint-disable-line react/prefer-stateless-function

  componentWillMount() {
    this.props.getFlightPlans();
  }

  getColumns = () => {
    const url = this.props.match.url;
    const updateUrl = (id) => `${url}/${id}/update`;
    const detailsUrl = (id) => `${url}/${id}`;

    return flightPlanGridColumns.concat({
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <span>
          <Link to={updateUrl(record.id)}>Update</Link>
          <span className="ant-divider" />
          <CloneFlightPlanLink
            flightPlanId={record.id}
            cloneFlightPlanPending={this.props.flightPlanList.ui.cloneFlightPlanPending}
            cloneFlightPlan={this.props.cloneFlightPlan}
          />
          <span className="ant-divider" />
          {this.renderInvalidateAction(record)}
          {this.renderMarkAsCompletedAction(record)}
          <Link to={detailsUrl(record.id)}>Details</Link>
        </span>
      ),
    });
  };

  cloneFlightPlan = (event, flightPlanId) => {
    event.preventDefault();

    this.props.cloneFlightPlan(flightPlanId);
  };

  invalidateFlightPlan = (flightPlanId) => {
    this.props.invalidateFlightPlan(flightPlanId);
  };

  markAsCompleted = (flightPlanId) => {
    this.props.markAsCompleted(flightPlanId);
  };

  flightPlans = () =>
    this.props.flightPlans.map((fp) => ({
      ...fp,
      key: String(fp.id),
      vehicle: fp.vehicle.model,
      planned_departure_time: moment
        .unix(fp.planned_departure_time)
        .utc()
        .format('YYYY-MM-DD HH:mm:ss'),
      planned_arrival_time: moment
        .unix(fp.planned_arrival_time)
        .utc()
        .format('YYYY-MM-DD HH:mm:ss'),
    }));

  renderInvalidateAction = (record) => {
    const confirmText = 'Invalidate flight plan?';
    // only render invalidate action when filter is planned
    if (this.props.flightPlanList.ui.flightPlansFilter === 'active') {
      return (
        <span>
          <Popconfirm title={confirmText} onConfirm={() => this.invalidateFlightPlan(record.id)}>
            <a href="#/invalid-flight-plan">Invalidate</a>
          </Popconfirm>
          <span className="ant-divider" />
        </span>
      );
    }
    return null;
  };

  renderMarkAsCompletedAction = (record) => {
    const confirmText = 'Mark flight plan as completed?';
    if (this.props.flightPlanList.ui.flightPlansFilter === 'active') {
      return (
        <span>
          <Popconfirm title={confirmText} onConfirm={() => this.markAsCompleted(record.id)}>
            <a href="#/mark-as-completed">Mark as Completed</a>
          </Popconfirm>
          <span className="ant-divider" />
        </span>
      );
    }
    return null;
  };

  render() {
    const {
      getFlightPlansPending,
      invalidateFlightPlanPending,
      markAsCompletedPending,
    } = this.props.flightPlanList.ui;
    const locale = { emptyText: 'No Data' };
    const flights = this.flightPlans();

    return (
      <Row type="flex">
        <Col span="24">
          <Row type="flex" align="center" justify="end">
            <Filters
              onFilterChange={this.props.setFlightPlansFilter}
              flightPlansFilter={this.props.flightPlanList.ui.flightPlansFilter}
            />
          </Row>
        </Col>
        <Col span="24">
          <Table
            loading={getFlightPlansPending || invalidateFlightPlanPending || markAsCompletedPending}
            columns={this.getColumns()}
            dataSource={this.props.flightPlans}
            onChange={this.handleChange}
            locale={locale}
            pagination={{
              total: flights.length,
              size: 'small',
              showSizeChanger: true,
              showQuickJumper: true,
              defaultPageSize: 20,
            }}
          />
        </Col>
      </Row>
    );
  }
}

FlightPlanList.propTypes = {
  getFlightPlans: PropTypes.func.isRequired,
  flightPlanList: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  invalidateFlightPlan: PropTypes.func.isRequired,
  setFlightPlansFilter: PropTypes.func.isRequired,
  flightPlans: PropTypes.array,
  cloneFlightPlan: PropTypes.func,
  markAsCompleted: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  flightPlanList: makeSelectFlightPlanList(),
  flightPlans: makeSelectFlightPlans(),
});

function mapDispatchToProps(dispatch) {
  return {
    getFlightPlans: bindActionCreators(getFlightPlans, dispatch),
    invalidateFlightPlan: bindActionCreators(invalidateFlightPlan, dispatch),
    setFlightPlansFilter: bindActionCreators(setFlightPlansFilter, dispatch),
    cloneFlightPlan: bindActionCreators(cloneFlightPlan, dispatch),
    markAsCompleted: bindActionCreators(markAsCompleted, dispatch),
  };
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);

const withReducer = injectReducer({ key: 'flightPlanList', reducer });
const withSaga = injectSaga({ key: 'flightPlanList', saga });

export default compose(withReducer, withSaga, withConnect)(FlightPlanList);
