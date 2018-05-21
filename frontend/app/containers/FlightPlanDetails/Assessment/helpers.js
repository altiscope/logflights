import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';

export const State = {
  READY: 'ready',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  FAIL: 'fail',
  SUBMITTING: 'submitting',
  WAITING: 'waiting',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  RESCINDED: 'rescinded',
  ERROR: 'error',
  CANCEL_REQUEST: 'cancelreq',
  CANCELLED: 'cancelled',
};

const StateInfo = {
  [State.READY]: { label: 'Ready to assess', className: '' },
  [State.PROCESSING]: { label: 'Computing assessment', className: '' },
  [State.SUCCESS]: { label: 'Passed assessment', className: '' },
  [State.FAIL]: { label: 'Failed assessment', className: '' },
  [State.SUBMITTING]: { label: 'Submitting authorization', className: '' },
  [State.WAITING]: { label: 'Waiting for response', className: '' },
  [State.APPROVED]: { label: 'Authorization approved', className: '' },
  [State.REJECTED]: { label: 'Authorization rejected', className: '' },
  [State.RESCINDED]: { label: 'Authorization rescinded', className: '' },
  [State.ERROR]: { label: 'Error', className: '' },
  [State.CANCEL_REQUEST]: {
    label: 'Operator has requested cancelling authorization',
    className: '',
  },
  [State.CANCELLED]: { label: 'Authorization cancelled', className: '' },
};

export const StateIcon = ({ state }) => (
  <div className={StateInfo[state].className}>{StateInfo[state].label}</div>
);
StateIcon.propTypes = {
  state: PropTypes.string.isRequired,
};

// If not in progress, able to refresh
export const canRefresh = (state) =>
  _.includes([State.FAIL, State.SUCCESS, State.ERROR, State.READY], state);

// If does not currently have a cancelled state, then:
export const canCancel = (state) => !_.includes([State.CANCELLED], state);
