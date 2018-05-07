/*
 *
 * Clock component
 *
 */

import React, { PureComponent } from 'react';

class Clock extends PureComponent {

  state = {
    time: (new Date()).toLocaleTimeString('en-US', {
      timeZone: 'GMT',
      timeZoneName: 'short',
      hour12: false,
    }),
  }

  componentDidMount() {
    // for initial rendering
    this.interval = setInterval(() => {
      this.setState({
        time: (new Date()).toLocaleTimeString('en-US', {
          timeZone: 'GMT',
          timeZoneName: 'short',
          hour12: false,
        }),
      });
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return (
      <h1>{this.state.time}</h1>
    );
  }
}

export default Clock;
