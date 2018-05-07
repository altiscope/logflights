/*
 *
 *  WaypointsGrid Component
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'antd';
import { waypointsGridColumns } from './constants';
import { WaypointGridWrapper } from './styles';

function WaypointsGrid({ waypoints = [] }) {
  const waypointsData = waypoints.map((w, i) => ({
    ...w,
    key: i,
    sNo: i + 1,
  }));

  return (
    <WaypointGridWrapper>
      <Table
        dataSource={waypointsData}
        columns={waypointsGridColumns}
        pagination={{ total: waypoints.length, size: 'small', showSizeChanger: true, showQuickJumper: true, defaultPageSize: 20 }}
      >
      </Table>

    </WaypointGridWrapper>
  );
}

WaypointsGrid.propTypes = {
  waypoints: PropTypes.array,
};

export default WaypointsGrid;
