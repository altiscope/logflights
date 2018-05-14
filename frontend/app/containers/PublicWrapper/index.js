/**
 *
 * PublicWrapper
 *
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Breadcrumb } from 'antd';
import { Switch, Route, Link } from 'react-router-dom';

import PlannerIndex from 'containers/PlannerIndex';
import FlightPlanDetails from 'containers/FlightPlanDetails';

import {
  PublicLayout,
  PublicHeader,
  Logo,
  Login,
  SignUp,
  ContentArea,
  MainContent,
  HeaderNav,
  Footer,
  FooterLink,
} from './styles';

const FlightPlanDetailsComponent = (props) => <FlightPlanDetails mode="public" {...props} />;

class PublicWrapper extends PureComponent {
  render() {
    const { match } = this.props;
    const breadcrumbStyle = { margin: '16px 0' };
    const publicDetailsPath = `${match.url}/flight-plans/:id`;

    return (
      <PublicLayout>
        <PublicHeader>
          <Logo>
            <Link to="/planner">log.flights</Link>
          </Logo>
          <HeaderNav>
            <Login to="/accounts/login">Login</Login>
            <span className="ant-divider" />
            <SignUp to="/accounts/signup">Sign Up</SignUp>
          </HeaderNav>
        </PublicHeader>
        <ContentArea>
          <Breadcrumb style={breadcrumbStyle} />
          <MainContent>
            <Switch>
              <Route exact path={match.url} component={PlannerIndex} />
              <Route exact path={publicDetailsPath} component={FlightPlanDetailsComponent} />
            </Switch>
          </MainContent>
        </ContentArea>
        <Footer style={{ textAlign: 'center' }}>
          log.flights from Altiscope © A³ by Airbus
          <div>
            <FooterLink to="/terms-of-service">Terms of Service</FooterLink>
            <FooterLink to="/privacy-policy">Privacy Policy</FooterLink>
            <FooterLink to="https://github.com/altiscope/logflights" target="_blank">
              GitHub
            </FooterLink>
          </div>
        </Footer>
      </PublicLayout>
    );
  }
}

PublicWrapper.propTypes = {
  match: PropTypes.object,
};

export default PublicWrapper;
