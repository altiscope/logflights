import React from 'react';
import PropTypes from 'prop-types';
import ReactGA from 'react-ga';
import { withRouter } from 'react-router-dom';

const settings = {
  trackingId: undefined,
};

class AnalyticsTracker extends React.Component {
  componentDidMount() {
    this.sendPageChange(this.props.location.pathname, this.props.location.search);
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.location.pathname !== prevProps.location.pathname ||
      this.props.location.search !== prevProps.location.search
    ) {
      this.sendPageChange(this.props.location.pathname, this.props.location.search);
    }
  }

  sendPageChange(pathname, search) {
    if (!settings.trackingId) return;
    const page = pathname + search;
    ReactGA.set({ page });
    ReactGA.pageview(page);
  }

  render() {
    return null;
  }
}

AnalyticsTracker.propTypes = {
  location: PropTypes.object.isRequired,
};

export function initialize({ trackingId }) {
  if (!trackingId) return;
  settings.trackingId = trackingId;
  ReactGA.initialize(trackingId, {
    gaOptions: { anonymizeIp: true },
  });
}

export default withRouter(AnalyticsTracker);
