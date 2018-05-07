/**
 *
 * SettingsPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { Switch, Route } from 'react-router-dom';

import UserProfileForm from 'containers/UserProfileForm';
import ChangePasswordForm from 'containers/ChangePasswordForm';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import makeSelectSettingsPage from './selectors';
import reducer from './reducer';
import saga from './saga';

const USER_PROFILE_PATH = (url) => `${url}/profile`;
const CHANGE_PASSWORD_PATH = (url) => `${url}/change-password`;

export class SettingsPage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { match } = this.props;

    return (
      <div>
        <Helmet>
          <title>SettingsPage</title>
          <meta name="description" content="Description of SettingsPage" />
        </Helmet>
        <Switch>
          <Route path={USER_PROFILE_PATH(match.url)} component={UserProfileForm} />
          <Route path={CHANGE_PASSWORD_PATH(match.url)} component={ChangePasswordForm} />
        </Switch>
      </div>
    );
  }
}

SettingsPage.propTypes = {
  match: PropTypes.object,
};

const mapStateToProps = createStructuredSelector({
  settingspage: makeSelectSettingsPage(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);

const withReducer = injectReducer({ key: 'settingsPage', reducer });
const withSaga = injectSaga({ key: 'settingsPage', saga });

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(SettingsPage);
