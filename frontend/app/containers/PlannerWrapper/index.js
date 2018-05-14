/**
 *
 * PlannerWrapper
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { createStructuredSelector } from 'reselect';
import { compose, bindActionCreators } from 'redux';
import { Switch, Route, Link } from 'react-router-dom';
import { push } from 'react-router-redux';
import { Layout, Menu, Icon } from 'antd';
import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import { makeSelectCurrentUser } from 'common/selectors';
import VehiclesPage from 'containers/VehiclesPage/Loadable';
import FlightPlanPage from 'containers/FlightPlanPage/Loadable';
import SettingsPage from 'containers/SettingsPage/Loadable';
import PlannerIndex from 'containers/PlannerIndex';
import {
  PlannerLayout,
  Logo,
  MainContent,
  Breadcrumbs,
  ContentHolder,
  IndexLink,
  FooterLink,
} from './styles';
import MainHeader from './MainHeader';
import { logout, getCurrentUser } from './actions';
import reducer from './reducer';
import saga from './saga';

const VEHICLES_PATH = (url) => `${url}/vehicles`;
const CREATE_VEHICLE_PATH = (url) => `${url}/vehicles/new`;
const FLIGHT_PLANS_PATH = (url) => `${url}/flight-plans`;
const CREATE_FLIGHT_PLAN_PATH = (url) => `${url}/flight-plans/new`;
const SETTINGS_PATH = (url) => `${url}/settings`;

const { Footer, Sider } = Layout;
const { SubMenu } = Menu;

export class PlannerWrapper extends React.Component {
  state = {
    collapsed: false,
  };

  componentWillMount() {
    this.props.getCurrentUser();
  }

  onCollapse = () => {
    this.setState({ collapsed: !this.state.collapsed });
  };

  render() {
    const { match } = this.props;

    return (
      <div>
        <Helmet>
          <title>log.flights - Planner</title>
          <meta name="description" content="Planner" />
        </Helmet>
        <PlannerLayout>
          <Sider
            collapsible
            trigger={null}
            collapsed={this.state.collapsed}
            onCollapse={this.onCollapse}
          >
            <Logo className="logo">
              <IndexLink to="/dashboard">
                {this.state.collapsed && <Icon type="home" />}
                {!this.state.collapsed && <span>log.flights</span>}
              </IndexLink>
            </Logo>
            <Menu theme="dark" mode="inline">
              <SubMenu
                key="vehicles"
                title={
                  <span>
                    <Icon type="car" />
                    <span>Vehicles</span>
                  </span>
                }
              >
                <Menu.Item key="vehicle:list">
                  <Link to={VEHICLES_PATH(match.url)}>Vehicle List</Link>
                </Menu.Item>
                <Menu.Item key="vehicle:new">
                  Add Vehicle
                  <Link to={CREATE_VEHICLE_PATH(match.url)}>Add Vehicle</Link>
                </Menu.Item>
              </SubMenu>
              <SubMenu
                key="flight-plan"
                title={
                  <span>
                    <Icon type="rocket" />
                    <span>Flight Plans</span>
                  </span>
                }
              >
                <Menu.Item key="flight-plan:list">
                  <Link to={FLIGHT_PLANS_PATH(match.url)}>Flight Plan List</Link>
                </Menu.Item>
                <Menu.Item key="flight-plan:new">
                  <Link to={CREATE_FLIGHT_PLAN_PATH(match.url)}>Add Flight Plan</Link>
                </Menu.Item>
              </SubMenu>
            </Menu>
          </Sider>
          <Layout>
            <MainHeader
              matchUrl={match.url}
              onCollapse={this.onCollapse}
              collapsed={this.state.collapsed}
              logout={this.props.logout}
              currentUser={this.props.currentUser}
            />
            <MainContent>
              <Breadcrumbs />
              <ContentHolder>
                <Switch>
                  <Route exact path={match.url} component={PlannerIndex} />
                  <Route path={VEHICLES_PATH(match.url)} component={VehiclesPage} />
                  <Route path={FLIGHT_PLANS_PATH(match.url)} component={FlightPlanPage} />
                  <Route path={SETTINGS_PATH(match.url)} component={SettingsPage} />
                </Switch>
              </ContentHolder>
            </MainContent>
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
          </Layout>
        </PlannerLayout>
      </div>
    );
  }
}

PlannerWrapper.propTypes = {
  match: PropTypes.object,
  logout: PropTypes.func.isRequired,
  currentUser: PropTypes.object,
  getCurrentUser: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  currentUser: makeSelectCurrentUser(),
});

function mapDispatchToProps(dispatch) {
  return {
    logout: bindActionCreators(logout, dispatch),
    push: bindActionCreators(push, dispatch),
    getCurrentUser: bindActionCreators(getCurrentUser, dispatch),
  };
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);
const withReducer = injectReducer({ key: 'plannerWrapper', reducer });
const withSaga = injectSaga({ key: 'plannerWrapper', saga });

export default compose(withConnect, withReducer, withSaga)(PlannerWrapper);
