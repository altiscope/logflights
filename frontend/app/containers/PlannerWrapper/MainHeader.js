/*
 *
 * PlannerWrapper MainHeader
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Row, Dropdown, Menu, Icon } from 'antd';
import { Link } from 'react-router-dom';
import { PlannerHeader, Trigger, UserAvatar, UserLink } from './styles';

const PROFILE_PATH = (url) => `${url}/settings/profile`;
const CHANGE_PASSWORD_PATH = (url) => `${url}/settings/change-password`;
const PLANNER_PATH = '/planner';

const UserSettingsMenu = (url, onLogout) => (
  <Menu>
    <Menu.Item key="0">
      <Link to={PROFILE_PATH(url)}>
        <Icon type="user" /> Profile
      </Link>
    </Menu.Item>
    <Menu.Item key="1">
      <Link to={CHANGE_PASSWORD_PATH(url)}>
        <Icon type="key" /> Change Password
      </Link>
    </Menu.Item>
    <Menu.Divider />
    <Menu.Item key="3">
      <button onClick={onLogout} style={{ cursor: 'pointer' }}>
        <Icon type="logout" /> Logout
      </button>
    </Menu.Item>
  </Menu>
);

const MainHeader = ({ matchUrl, onCollapse, collapsed, logout, currentUser }) => {
  const onLogout = () => {
    logout();
    window.location.replace(PLANNER_PATH);
  };

  return (
    <PlannerHeader>
      <Row type="flex" align="center" justify="space-between">
        <Trigger
          className="trigger"
          type={collapsed ? 'menu-unfold' : 'menu-fold'}
          onClick={onCollapse}
        />
        <Dropdown overlay={UserSettingsMenu(matchUrl, onLogout)}>
          <UserLink className="ant-dropdown-link">
            <UserAvatar icon="user" /> {currentUser.email}
          </UserLink>
        </Dropdown>
      </Row>
    </PlannerHeader>
  );
};

MainHeader.propTypes = {
  currentUser: PropTypes.object.isRequired,
  matchUrl: PropTypes.string.isRequired,
  onCollapse: PropTypes.func.isRequired,
  collapsed: PropTypes.bool,
  logout: PropTypes.func.isRequired,
};

export default MainHeader;
