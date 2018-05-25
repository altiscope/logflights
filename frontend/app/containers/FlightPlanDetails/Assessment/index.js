import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { message, Spin } from 'antd';
import H2 from 'components/H2';
import { getClient } from 'services/api';
import Container from './Container';

const POLL_INTERVAL = 30 * 1000;

class Root extends Component {
  state = {
    isAssessmentsLoaded: false,
    assessmentInfo: [],
    eligibleAssessments: [],
  };
  componentDidMount() {
    // Load assessments
    this.handleReloadAssessments({ getEligible: true });
    this.intervalID = setInterval(this.handleReloadAssessments, POLL_INTERVAL);
  }
  componentWillUnmount() {
    clearInterval(this.intervalID);
  }
  handleReloadAssessments = (params = {}) => {
    const planId = this.props.flightPlanId;

    getClient({ camelize: true })
      .get(`/plans/${planId}/assessments/`, {
        params: {
          ...params,
          eligibleAssessments: this.state.eligibleAssessments,
        },
      })
      .then((result) => {
        if (params.getEligible) {
          this.setState({
            eligibleAssessments: result.data.assessmentInfo.map(
              ({ info: { shortName } }) => shortName
            ),
          });
        }
        this.setState({
          isAssessmentsLoaded: true,
          assessmentInfo: result.data.assessmentInfo,
        });
        if (result.data.assessmentInfo.length === 0) {
          clearInterval(this.intervalID);
        } else if (!this.intervalID) {
          this.intervalID = setInterval(this.handleReloadAssessments, POLL_INTERVAL);
        }
      })
      .catch(() => {
        clearInterval(this.intervalID);
        message.error('An error occurred while fetching assessments, please reload and try again.');
        this.setState({ isAssessmentsLoaded: true });
      });
  };

  render() {
    const { assessmentInfo, isAssessmentsLoaded } = this.state;
    if (assessmentInfo.length === 0) return null;
    return (
      <Spin spinning={!isAssessmentsLoaded}>
        <div
          className="lf-u-padding-sm"
          style={{
            width: '100%',
            marginTop: 20,
          }}
        >
          <H2>Assessments</H2>
          {assessmentInfo.map(({ info, lastRunAssessment, authorizationAssessments }) => (
            <Container
              key={info.shortName}
              info={info}
              authorizationAssessments={authorizationAssessments}
              lastRunAssessment={lastRunAssessment}
              flightPlanId={this.props.flightPlanId}
              onReload={this.handleReloadAssessments}
            />
          ))}
        </div>
      </Spin>
    );
  }
}

Root.propTypes = {
  flightPlanId: PropTypes.string.isRequired,
};

export default Root;
