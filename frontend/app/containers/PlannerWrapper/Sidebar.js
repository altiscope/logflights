/*
 *
 * PlannerWrapper Sidebar
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Layout, Menu, Icon } from 'antd';
import { Link } from 'react-router-dom';
import { Logo, IndexLink } from './styles';

const SubMenu = Menu.SubMenu;
const Sider = Layout.Sider;

const VEHICLES_PATH = (url) => `${url}/vehicles`;
const CREATE_VEHICLE_PATH = (url) => `${url}/vehicles/new`;
const FLIGHT_PLANS_PATH = (url) => `${url}/flight-plans`;
const CREATE_FLIGHT_PLAN_PATH = (url) => `${url}/flight-plans/new`;

const Sidebar = ({ matchUrl, onCollapse, collapsed }) => (
  <Sider
    collapsible
    trigger={null}
    collapsed={collapsed}
    onCollapse={onCollapse}
  >
    <Logo>
      <IndexLink to="/planner">log.flights</IndexLink>
    </Logo>
    <Menu theme="dark" mode="inline">
      <SubMenu
        key="vehicles"
        title={<span><Icon type="car" /><span>Vehicles</span></span>}
      >
        <Menu.Item key="vehicle:list">
          <Link to={VEHICLES_PATH(matchUrl)}>Vehicle List</Link>
        </Menu.Item>
        <Menu.Item key="vehicle:new">
          Add Vehicle
          <Link to={CREATE_VEHICLE_PATH(matchUrl)}>Add Vehicle</Link>
        </Menu.Item>
      </SubMenu>
      <SubMenu
        key="flight-plan"
        title={<span><Icon type="rocket" /><span>Flight Plans</span></span>}
      >
        <Menu.Item key="flight-plan:list">
          <Link to={FLIGHT_PLANS_PATH(matchUrl)}>Flight Plan List</Link>
        </Menu.Item>
        <Menu.Item key="flight-plan:new">
          <Link to={CREATE_FLIGHT_PLAN_PATH(matchUrl)}>Add Flight Plan</Link>
        </Menu.Item>
      </SubMenu>
    </Menu>
  </Sider>
);

Sidebar.propTypes = {
  matchUrl: PropTypes.string.isRequired,
  collapsed: PropTypes.bool.isRequired,
  onCollapse: PropTypes.func.isRequired,
};

export default Sidebar;
