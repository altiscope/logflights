/*
 *
 * Common Styled Components
 *
 */

import styled from 'styled-components';

export const FormWrapper = styled.div`
  padding: 34px 20px 24px;
  ${(props) =>
    props.maxWidth &&
    `
    max-width: ${props.maxWidth};
    width: 100%;
  `} ${(props) =>
  props.center &&
    `
    margin: auto;
  `};
`;

export const AccountsFormHeader = styled.h1``;

/*
 *
 *  antd prop styles
 *
 */

export const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  },
};

export const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 14,
      offset: 6,
    },
  },
};
