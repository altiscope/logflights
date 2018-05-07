/**
 *
 * VehiclesList
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { createStructuredSelector } from 'reselect';
import { compose, bindActionCreators } from 'redux';
import { Table, Row, Col } from 'antd';
import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import makeSelectVehiclesList, { makeSelectVehicles } from './selectors';
import reducer from './reducer';
import saga from './saga';
import { vehicleGridColumns } from './constants';
import { getVehicles, setVehiclesFilter } from './actions';
import Filters from './Filters';

const updateVehiclePath = (matchUrl, id) => `${matchUrl}/${id}/update`;

export class VehiclesList extends React.Component { // eslint-disable-line react/prefer-stateless-function

  componentWillMount() {
    this.props.getVehicles();
  }

  getColumns = () => (
    vehicleGridColumns.concat({
      title: 'Actions',
      key: 'x',
      render: (text, record) => (
        <Link to={updateVehiclePath(this.props.match.url, record.id)}>Update</Link>
      ),
    })
  )

  handleChange = (pagination, filters, sorter) => (
    { pagination, filters, sorter }
  )

  render() {
    const { getVehiclesPending } = this.props.vehiclesList.ui;
    const locale = { emptyText: 'No Data' };

    return (
      <Row>
        <Col span="24">
          <Row type="flex" align="center" justify="end">
            <Filters
              onFilterChange={this.props.setVehiclesFilter}
              vehiclesFilter={this.props.vehiclesList.ui.vehiclesFilter}
            />
          </Row>
        </Col>
        <Col span="24">
          <Table
            loading={getVehiclesPending}
            columns={this.getColumns()}
            dataSource={this.props.vehicles}
            onChange={this.handleChange}
            locale={locale}
            pagination={{ total: this.props.vehicles.length, size: 'small', showSizeChanger: true, showQuickJumper: true, defaultPageSize: 20 }}
          />
        </Col>
      </Row>
    );
  }
}

VehiclesList.propTypes = {
  getVehicles: PropTypes.func.isRequired,
  vehiclesList: PropTypes.object,
  match: PropTypes.object,
  setVehiclesFilter: PropTypes.func.isRequired,
  vehicles: PropTypes.array,
};

const mapStateToProps = createStructuredSelector({
  vehiclesList: makeSelectVehiclesList(),
  vehicles: makeSelectVehicles(),
});

function mapDispatchToProps(dispatch) {
  return {
    getVehicles: bindActionCreators(getVehicles, dispatch),
    setVehiclesFilter: bindActionCreators(setVehiclesFilter, dispatch),
  };
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);

const withReducer = injectReducer({ key: 'vehiclesList', reducer });
const withSaga = injectSaga({ key: 'vehiclesList', saga });

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(VehiclesList);
