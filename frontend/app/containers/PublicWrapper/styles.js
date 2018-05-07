/*
 *
 * PublicContainer styles
 *
 */

import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Layout } from 'antd';

const { Header, Content } = Layout;

export const PublicLayout = styled(Layout)`
  height: 100vh;
  display: flex;
`;

export const PublicHeader = styled(Header)`
  position: fixed;
  z-index: 100;
  width: 100%;
`;

export const Logo = styled.h1`
  height: 31px;
  margin: 16px 24px 16px 0;
  float: left;
  line-height: 31px;
  color: #fff;
  letter-spacing: 1px;
  > a {
    color: #fff;
    text-decoration: none;
  };
`;

export const ContentArea = styled(Content)`
  padding: 0 50px;
  margin-top: 64px;
`;

export const MainContent = styled.div`
  background: #fff;
  padding: 24px;
  min-height: 400px;
`;

export const Footer = styled.div`
  padding: 5px;
`;

export const FooterLink = styled(Link)`
  padding-left: 5px;
  padding-right: 5px;
`;


export const Login = styled(Link)`
  margin: 15px;
  border-radius: 3px;
  color: #fff;
  &:hover{
    transition: 1.5sec;
  };
`;

export const SignUp = styled(Link)`
  margin: 15px;
  border-radius: 3px;
  color: #fff;
  &:hover{
    transition: 1.5sec;
  };
`;

export const HeaderNav = styled.div`
  float: right;
`;
