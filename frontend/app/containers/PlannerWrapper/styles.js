/*
 *
 * PlannerWrapper Styles
 *
 */

import styled from 'styled-components';
import { Layout, Breadcrumb, Icon, Avatar } from 'antd';
import { Link } from 'react-router-dom';

const { Header, Content } = Layout;

export const PlannerLayout = styled(Layout)`
  min-height: 100vh;
`;

export const Logo = styled.h1`
  margin: 16px;
  text-align: center;
  color: #fff;
  > a {
    text-decoration: none;
    outline: none;
  }
`;

export const PlannerHeader = styled(Header)`
  background: #fff;
  padding: 0 20px;
  background: #404040;
  .ant-dropdown-link {
    line-height: initial!important;
    height: 64px;
  }
`;

export const MainContent = styled(Content)`
  margin: 0 16px;
`;

export const Breadcrumbs = styled(Breadcrumb)`
  margin: 16px 0;
`;

export const ContentHolder = styled.div`
  min-height: 360px;
  background: #fff;
  padding: 24px
`;

export const Trigger = styled(Icon)`
  font-size: 18px;
  line-height: 64px;
  cursor: pointer;
  transition: color .3s;
  z-index: 100;
  color: #ffffff;
  transition: color 0.3s ease-in-out;
  &:hover {
    color: #108ee9;
  }
`;

export const UserLink = styled.a`
  display: inline-flex;
  align-items: center;
  color: #ffffff;
  padding: 0 10px;
  transition: all 0.3s ease-in-out;
  background-color: transparent;
  &:hover {
    background-color: #606060;
  }
`;

export const UserAvatar = styled(Avatar)`
  margin: 16px 10px 16px 0;
`;

export const IndexLink = styled(Link)`
  color: #fff;
`;

export const FooterLink = styled(Link)`
  padding-left: 5px;
  padding-right: 5px;
`;
