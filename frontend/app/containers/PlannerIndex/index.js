/**
 *
 * PlannerIndex
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose, bindActionCreators } from 'redux';
import { Link } from 'react-router-dom';
import { Table, Row, Col, Spin } from 'antd';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import makeSelectPlannerIndex, { makeSelectPlannedFlights } from './selectors';
import reducer from './reducer';
import saga from './saga';
import { gridColumns } from './constants';
import { getPlannedFlights, getOperators } from './actions';
import Filters from './Filters';

const DETAILS_PLAN_PATH = (matchURL, recordId) =>
  `${matchURL}/flight-plans/${recordId}`;

export class PlannerIndex extends React.Component {
  // eslint-disable-line react/prefer-stateless-function

  componentWillMount() {
    this.props.getPlannedFlights();
    this.props.getOperators();
  }

  getColumns = () =>
    gridColumns.concat({
      title: 'Actions',
      key: 'x',
      render: (record) => (
        <Link
          to={DETAILS_PLAN_PATH(
            this.props.match.url === '/' ? '/planner' : this.props.match.url,
            record.id
          )}
        >
          Details
        </Link>
      ),
    });

  render() {
    const { getPlannedFlightsPending } = this.props.plannerIndex.ui;

    return (
      <Row type="flex">
        <Col span="24">
          <Row type="flex" align="center" justify="end">
            <Filters
              getFlights={this.props.getPlannedFlights}
              operators={this.props.plannerIndex.data.operators}
            />
          </Row>
        </Col>
        <Col span="24">
          <Spin spinning={getPlannedFlightsPending}>
            <Table
              columns={this.getColumns()}
              dataSource={this.props.plannedFlights}
              onChange={this.handleChange}
              locale={{ emptyText: 'No Flight Plans Found' }}
              pagination={{
                total: this.props.plannedFlights.length,
                size: 'small',
                showSizeChanger: true,
                showQuickJumper: true,
                defaultPageSize: 20,
              }}
            />
          </Spin>
        </Col>
      </Row>
    );
  }
}

PlannerIndex.propTypes = {
  getPlannedFlights: PropTypes.func.isRequired,
  getOperators: PropTypes.func.isRequired,
  plannerIndex: PropTypes.object,
  plannedFlights: PropTypes.array,
  match: PropTypes.object,
};

const mapStateToProps = createStructuredSelector({
  plannerIndex: makeSelectPlannerIndex(),
  plannedFlights: makeSelectPlannedFlights(),
});

function mapDispatchToProps(dispatch) {
  return {
    getPlannedFlights: bindActionCreators(getPlannedFlights, dispatch),
    getOperators: bindActionCreators(getOperators, dispatch),
  };
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);

const withReducer = injectReducer({ key: 'plannerIndex', reducer });
const withSaga = injectSaga({ key: 'plannerIndex', saga });

export default compose(withReducer, withSaga, withConnect)(PlannerIndex);
