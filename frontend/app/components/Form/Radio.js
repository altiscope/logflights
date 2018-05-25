/**
 * Wrapper of pretty-checkbox's radio
 * https://lokesh-coder.github.io/pretty-checkbox/
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled, { injectGlobal } from 'styled-components';

import Color from './Color';

// Override pretty checkbox styles for radio
// eslint-disable-next-line
injectGlobal`

.pretty input[type="radio"]:checked ~ .state.p-primary-o label:before,
.pretty input[type="radio"]:checked ~ .state.p-primary-o label:after {
  border-color: ${Color.SLATE};

}
.pretty.p-default:not(.p-fill) input:checked ~ .state.p-primary-o label:after {
  background-color: ${Color.LINK} !important;
}
.pretty.p-default.p-thick .state label:after, .pretty.p-default.p-thick .state label:before {
  border-width: 1px;
}

`;

const Label = styled.label`
  font-size: 16px;
  letter-spacing: 0.1px;
  /* line-height: 29px; */
  color: ${(props) => (props.disabled ? Color.SLATE : Color.PRIMARY)};
`;

const Radio = ({ name, checked, disabled, value, onChange, children }) => (
  <div className="pretty p-default p-round p-thick">
    <input
      type="radio"
      name={name}
      checked={checked}
      value={value}
      disabled={disabled}
      onChange={onChange}
    />
    <div className="state p-primary-o">
      <Label disabled={disabled}>
        <div style={{ marginLeft: 4 }}>{children}</div>
      </Label>
    </div>
  </div>
);

Radio.propTypes = {
  name: PropTypes.string.isRequired,
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  value: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  onChange: PropTypes.func,
};

export default Radio;
