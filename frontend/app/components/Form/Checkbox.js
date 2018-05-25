/**
 * Wrapper for pretty-checkbox's checkbox
 * https://lokesh-coder.github.io/pretty-checkbox/
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled, { injectGlobal } from 'styled-components';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faCheck from '@fortawesome/fontawesome-free-solid/faCheck';

import Color from './Color';

// Override pretty checkbox styles
// eslint-disable-next-line
injectGlobal`
  .pretty.p-curve .state label:before,
  .pretty.p-curve .state label:after {
    border-radius: 4px;
    border-color: ${Color.SLATE};
    height: 20px;
    width: 20px;
    border-width: 1px;
    border-style: solid;
  }
  .pretty.p-icon input[type="checkbox"]:checked ~ .state label:before,
  .pretty.p-icon input[type="checkbox"]:checked ~ .state label:after
  {
    background-color: ${Color.LINK} !important;
    border-color: ${Color.LINK};
    border-width: 1px;
  }
`;

const Label = styled.label`
  font-size: 16px;
  letter-spacing: 0.1px;
  /* line-height: 29px; */
  color: ${(props) => (props.disabled ? Color.SLATE : Color.PRIMARY)};
`;

const Checkbox = ({ checked, disabled, value, onChange, children }) => (
  <div className="pretty p-icon p-curve">
    <input
      type="checkbox"
      checked={checked}
      value={value}
      disabled={disabled}
      onChange={onChange}
    />
    <div className="state">
      <span className="icon" style={{ marginTop: -1 }}>
        <FontAwesomeIcon icon={faCheck} style={{ color: Color.CLOUD_WHITE, fontSize: 11 }} />
      </span>
      <Label disabled={disabled}>
        <div style={{ marginLeft: 5 }}>{children}</div>
      </Label>
    </div>
  </div>
);

Checkbox.propTypes = {
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  value: PropTypes.string,
  onChange: PropTypes.func,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};

export default Checkbox;
