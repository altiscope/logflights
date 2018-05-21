import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Button, Row, Col, Popconfirm } from 'antd';
import Modal from 'react-modal';
import { StateIcon, State, canRefresh } from './helpers';
import AssessmentForm from './Form';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

const Detail = class extends React.Component {
  state = {
    isShowingReport: false,
    formIsOpen: false,
  };
  render() {
    const { onRefresh, assessment, info, flightPlanId, onSubmit, canSubmit, onCancel } = this.props;
    const { isShowingReport } = this.state;
    let report;
    let reportChecks;
    try {
      report = JSON.parse(assessment.report);
      reportChecks = JSON.stringify(report.checks, null, 4);
      // eslint-disable-next-line
    } catch (e) {}
    const isReadyToBeAssessed = assessment.state === State.READY;
    const isInAuthorization = _.includes(
      [
        State.WAITING,
        State.REJECTED,
        State.APPROVED,
        State.RESCINDED,
        State.CANCELLED,
        State.CANCEL_REQUEST,
        State.SUBMITTING,
      ],
      assessment.state
    );
    const isSubmitAllowed = info.submit;
    const isCancelled = _.includes([State.CANCELLED, State.CANCEL_REQUEST], assessment.state);

    let actions = null;
    if (isInAuthorization) {
      if (!isCancelled) {
        actions = (
          <Popconfirm
            placement="top"
            title="Are you sure you want to cancel this assessment?"
            onConfirm={() => onCancel(assessment.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button>Cancel</Button>
          </Popconfirm>
        );
      }
    } else {
      actions = (
        <Button onClick={() => onRefresh(assessment.id)} disabled={!canRefresh(assessment.state)}>
          Refresh
        </Button>
      );
    }

    let date = null;
    if (!isReadyToBeAssessed) {
      const dateFormat = 'ddd MMM D [at] h:mma';
      if (assessment.approvedAt) {
        date = <div>Approved at: {moment(assessment.approvedAt).format(dateFormat)}</div>;
      } else if (assessment.submittedAt) {
        date = <div>Submitted at: {moment(assessment.submittedAt).format(dateFormat)}</div>;
      } else if (assessment.runAt) {
        date = <div>Last run: {moment(assessment.runAt).format(dateFormat)}</div>;
      }
    }
    return (
      <div className="lf-u-padding-md">
        <Row type="flex" style={{ alignItems: 'center' }}>
          <Col span="24" style={{ textAlign: 'right' }}>
            <StateIcon state={assessment.state} />
          </Col>
        </Row>
        <Row type="flex" style={{ alignItems: 'center' }}>
          <Col span="18">{date}</Col>
          <Col span="6" style={{ textAlign: 'right' }}>
            {actions}
          </Col>
        </Row>
        {report &&
          report.notices &&
          report.notices.length > 0 && (
          <Row>
            <Col span="24">
                Notices:
              <ul>{report.notices.map((notice) => <li>{notice}</li>)}</ul>
            </Col>
          </Row>
        )}
        <Row className="lf-u-padding-md">
          <Col span="24" style={{ textAlign: 'center' }}>
            {report && (
              <span>
                <Button
                  disabled={!canRefresh(assessment.state)}
                  onClick={() => this.setState({ isShowingReport: !this.state.isShowingReport })}
                >
                  Full Report
                </Button>{' '}
              </span>
            )}
            {!isInAuthorization &&
              isSubmitAllowed && (
              <Button disabled={!canSubmit} onClick={() => this.setState({ formIsOpen: true })}>
                  Submit
              </Button>
            )}
          </Col>
        </Row>
        {isShowingReport && (
          <div>
            <pre style={{ overflow: 'scroll', height: 400 }}>{reportChecks}</pre>
          </div>
        )}
        <Modal
          isOpen={this.state.formIsOpen}
          onRequestClose={() => this.setState({ formIsOpen: false })}
          style={customStyles}
          contentLabel="Submit"
          ariaHideApp={false}
        >
          <AssessmentForm
            assessmentId={assessment.id}
            info={info}
            flightPlanId={flightPlanId}
            onSubmit={onSubmit}
            onComplete={() => this.setState({ formIsOpen: false })}
          />
        </Modal>
      </div>
    );
  }
};
Detail.propTypes = {
  assessment: PropTypes.object.isRequired,
  info: PropTypes.object.isRequired,
  flightPlanId: PropTypes.string.isRequired,
  canSubmit: PropTypes.bool,
  onRefresh: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
};

export default Detail;
