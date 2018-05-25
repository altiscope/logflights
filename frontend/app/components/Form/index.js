import styled from 'styled-components';
// Checkbox & Radio depend on this CSS
import 'pretty-checkbox/dist/pretty-checkbox.min.css';
import Color from './Color';
import Checkbox from './Checkbox';
import Radio from './Radio';
import Select from './Select';
import Button from './Button';
import Card from './Card';

const Input = styled.input`
  color: ${Color.HINT};
  border: ${(props) => (props.disabled === true ? '0px' : '1px')};
  background-color: ${(props) => (props.disabled === true ? Color.slate(0.2) : 'initial')};
  border-style: solid;
  border-color: ${(props) => (props.hasError ? Color.ERROR : Color.slate())};
  border-radius: 4px;
  padding: 10px 14px;
  font-size: 16px;
  letter-spacing: -0.1px;
  line-height: 29px;
  &:focus {
    color: ${Color.PRIMARY};
    outline: none;
    border-width: 1px;
    border-style: solid;
    border-color: ${(props) => (props.hasError ? Color.ERROR : Color.SKY_BLUE)};
  }
`;

const Label = styled.label`
  color: ${Color.PRIMARY};
  font-size: 15px;
  letter-spacing: -0.1px;
  line-height: 29px;
`;

export { Input, Label, Select, Checkbox, Radio, Button, Card };
