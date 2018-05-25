import styled from 'styled-components';
import Color from './Color';

const isPrimary = ({ type }) => !type || type === 'primary';

const Button = styled.button`
  display: inline-block;
  box-sizing: border-box;
  padding: 8px 24px;
  text-decoration: none;
  border-radius: 4px;
  border-width: 0px;
  -webkit-font-smoothing: antialiased;
  -webkit-touch-callout: none;
  user-select: none;
  cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
  outline: 0;
  font-size: 14px;
  line-height: 22px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: ${(props) =>
    isPrimary(props)
      ? Color.inverted(props.disabled ? 0.8 : 1)
      : Color.skyBlue(props.disabled ? 0.4 : 1)};
  border-width: 1px;
  border-color: ${(props) => (isPrimary(props) ? '' : Color.skyBlue(props.disabled ? 0.4 : 1))};
  border-style: ${(props) => (isPrimary(props) ? 'none' : 'solid')};
  background-color: ${(props) => {
    if (isPrimary(props)) {
      return props.disabled ? Color.skyBlue(0.4) : Color.SKY_BLUE;
    }
    return Color.INVERTED;
  }};
  &:hover {
    background-color: ${(props) => {
    if (isPrimary(props)) {
      return props.disabled ? Color.skyBlue(0.4) : Color.skyBlue(0.8);
    }
    return props.disabled ? Color.INVERTED : Color.skyBlue(0.1);
  }};
  }
`;

export default Button;
