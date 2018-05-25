import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Button, Row, Col, Icon, message } from 'antd';
import H3 from 'components/H3';
import { getClient } from 'services/api';
import AssessmentDetail from './Detail';
import { State } from './helpers';

const Assessment = class extends React.Component {
  state = {
    isVisible: false,
  };
  handleCancel = (assessmentId) =>
    getClient()
      .patch(`/assessments/${assessmentId}/`, { state: State.CANCEL_REQUEST })
      .then(() => this.props.onReload())
      .catch(() => {
        message.error('An error occurred when cancelling the assessment');
      });
  handleRefresh = (assessmentId) => {
    const shortName = this.props.info.shortName;
    const params = {
      shortName,
    };
    if (assessmentId) {
      // Refresh existing assessment
      return getClient({ camelize: true })
        .patch(`/assessments/${assessmentId}/`, params)
        .then(() => this.props.onReload())
        .catch(() => {
          message.error('An error occurred when refreshing the assessment');
        });
    }
    // Has never been assessed and has no assessment yet. Create one.
    return getClient({ camelize: true })
      .post('/assessments/', {
        ...params,
        flightPlanId: this.props.flightPlanId,
      })
      .then(() => this.props.onReload())
      .catch(() => {
        message.error('An error occurred when creating the assessment');
      });
  };

  handleSubmit = ({ assessmentId, pilotName, pilotPhone }) => {
    const params = {
      pilotName,
      pilotPhone,
      state: State.SUBMITTING,
    };
    this.setState({ isSubmitPending: true });
    return getClient({ camelize: true })
      .patch(`/assessments/${assessmentId}/`, params)
      .then((response) => {
        this.props.onReload();
        return response;
      });
  };

  render() {
    const { info, lastRunAssessment, authorizationAssessments, flightPlanId } = this.props;
    const { isVisible } = this.state;

    let noAssessment;
    if (!lastRunAssessment) {
      noAssessment = {
        id: null,
        state: State.READY,
        createdAt: null,
        runAt: null,
        submittedAt: null,
        approvedAt: null,
        error: null,
      };
    }

    const canSubmit =
      (authorizationAssessments.length === 0 ||
        _.every(authorizationAssessments, ({ state }) => state === State.CANCELLED)) &&
      (lastRunAssessment && lastRunAssessment.state === State.SUCCESS);

    return (
      <div>
        <div className="lf-c-card">
          <div>
            <Row type="flex" style={{ alignItems: 'center' }}>
              <Col span="12" className="lf-u-color-secondary">
                {info.name}
              </Col>
              <Col span="12" style={{ textAlign: 'right' }}>
                <Button onClick={() => this.setState({ isVisible: !this.state.isVisible })}>
                  <Icon type={isVisible ? 'minus-circle-o' : 'plus-circle-o'} />
                </Button>
              </Col>
            </Row>
          </div>
          {isVisible && (
            <div>
              {authorizationAssessments &&
                authorizationAssessments.length > 0 && (
                <div>
                  <H3>Authorized</H3>
                  {authorizationAssessments.map((assessment) => (
                    <AssessmentDetail
                      key={assessment.id}
                      title="Authorized"
                      assessment={assessment}
                      info={info}
                      flightPlanId={flightPlanId}
                      onCancel={this.handleCancel}
                    />
                  ))}
                </div>
              )}
              {lastRunAssessment && (
                <div>
                  <H3>Latest</H3>
                  <AssessmentDetail
                    assessment={lastRunAssessment}
                    info={info}
                    flightPlanId={flightPlanId}
                    onRefresh={this.handleRefresh}
                    canSubmit={canSubmit}
                    onSubmit={this.handleSubmit}
                    onCancel={this.handleCancel}
                  />
                </div>
              )}
              {noAssessment && (
                <div>
                  <H3>Latest</H3>
                  <AssessmentDetail
                    assessment={noAssessment}
                    info={info}
                    flightPlanId={flightPlanId}
                    onRefresh={this.handleRefresh}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
};

Assessment.propTypes = {
  flightPlanId: PropTypes.string.isRequired,
  info: PropTypes.object.isRequired,
  lastRunAssessment: PropTypes.object,
  authorizationAssessments: PropTypes.array,
  onReload: PropTypes.func.isRequired,
};

export default Assessment;
