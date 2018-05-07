import React from 'react';
import { shallow } from 'enzyme';
import { Route } from 'react-router-dom';

import App from '../index';

describe('<App />', () => {
  /* it('should render the header', () => {
    const renderedComponent = shallow(
      <App />
    );
    expect(renderedComponent.find(Header).length).toBe(1);
  }); */

  it('should render some routes', () => {
    const renderedComponent = shallow(
      <App />
    );
    expect(renderedComponent.find(Route).length).not.toBe(0);
  });

  /* it('should render the footer', () => {
    const renderedComponent = shallow(
      <App />
    );
    expect(renderedComponent.find(Footer).length).toBe(1);
  }); */
});
