/**
 *
 * AccountsWrapper
 *
 */

// absolute imports
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Route, Switch, Redirect } from 'react-router-dom';
import { Row, Col } from 'antd';

// import containers
import LoginPage from 'containers/LoginPage/Loadable';
import SignupPage from 'containers/SignupPage/Loadable';
import ResetPasswordForm from 'containers/ResetPasswordForm/Loadable';
import CreateNewPasswordForm from 'containers/CreateNewPasswordForm/Loadable';

// relative imports
import bgImage from './images/drone-background.jpg';

const AccountsBgCol = styled(Col)`
  background: url(${bgImage}) center center no-repeat;
  background-size: cover;
  height: 100vh;
`;

const AccountsRow = styled(Row)`
  height: 100vh;
`;

const LOGIN_PATH = (matchUrl) => `${matchUrl}/login`;
const SIGNUP_PATH = (matchUrl) => `${matchUrl}/signup`;
const RESET_PASSWORD_PATH = (matchUrl) => `${matchUrl}/reset-password`;
const CREATE_NEW_PASSWORD_PATH = (matchUrl) => `${matchUrl}/reset-password/new/:token`;

export class AccountsWrapper extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { match } = this.props;

    return (
      <div>
        <Helmet
          titleTemplate="%s - log.flights"
          defaultTitle="Accounts"
        />
        <Row>
          <Col span="12">
            <AccountsRow type="flex" align="center" justify="center">
              <Switch>
                <Route path={LOGIN_PATH(match.url)} component={LoginPage} />
                <Route path={SIGNUP_PATH(match.url)} component={SignupPage} />
                <Route exact path={RESET_PASSWORD_PATH(match.url)} component={ResetPasswordForm} />
                <Route exact path={CREATE_NEW_PASSWORD_PATH(match.url)} component={CreateNewPasswordForm} />
                <Route path="" render={() => (<Redirect push to="/not-found" />)} />
              </Switch>
            </AccountsRow>
          </Col>
          <AccountsBgCol span="12"></AccountsBgCol>
        </Row>
      </div>
    );
  }
}

AccountsWrapper.propTypes = {
  match: PropTypes.object,
};

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

const withConnect = connect(null, mapDispatchToProps);

export default compose(
  withConnect,
)(AccountsWrapper);
