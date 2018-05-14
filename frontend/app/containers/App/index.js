/**
 *
 * App
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 */

import React from 'react';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import { Switch, Route } from 'react-router-dom';
import PrivateRoute from 'containers/PrivateRoute';
import NotFoundPage from 'containers/NotFoundPage/Loadable';
import AccountsWrapper from 'containers/AccountsWrapper/Loadable';
import PlannerWrapper from 'containers/PlannerWrapper/Loadable';
import PublicWrapper from 'containers/PublicWrapper/Loadable';
import { TermsOfService, PrivacyPolicy } from 'containers/PublicWrapper/StaticContent';
import AnalyticsTracker from 'services/AnalyticsTracker';
import { isPublicAppDomain } from 'services/env';
import TempAuth from './TempAuth';

const AppWrapper = styled.div`
  height: 100%;
`;

export default () => (
  <AppWrapper>
    <AnalyticsTracker />
    <Helmet titleTemplate="%s - log.flights" defaultTitle="log.flights">
      <meta name="description" content="Log flights" />
    </Helmet>
    <Switch>
      <Route
        exact
        path="/"
        render={(props) => (isPublicAppDomain() ? <PublicWrapper {...props} /> : <TempAuth />)}
      />
      <Route path="/planner" component={PublicWrapper} />
      <Route path="/accounts" component={AccountsWrapper} />
      <PrivateRoute path="/dashboard" component={PlannerWrapper} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/not-found" component={NotFoundPage} />
    </Switch>
  </AppWrapper>
);
