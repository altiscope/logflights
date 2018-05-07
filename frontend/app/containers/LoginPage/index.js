/**
 *
 * LoginPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose, bindActionCreators } from 'redux';
import { Form, Icon, Input, Button, Checkbox, message } from 'antd';
import { Link } from 'react-router-dom';
import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import makeSelectLoginPage from './selectors';
import reducer from './reducer';
import saga from './saga';
import { loginRequest } from './actions';

const FormItem = Form.Item;

export class LoginPage extends React.Component { // eslint-disable-line react/prefer-stateless-function

  handleSubmit = (e) => {
    e.preventDefault();

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return message.error('Please complete the fields');
      }

      return this.props.loginRequest(values.userName, values.password);
    });
  }

  generateFieldDecorator = (type, config, component) =>
    this.props.form.getFieldDecorator(type, config)(component)

  render() {
    const loginPending = this.props.loginPage.loginPending;

    return (
      <Form onSubmit={this.handleSubmit} style={{ width: '100%', maxWidth: '300px', margin: 'auto' }} className="login-form">
        <FormItem>
          {
            this.generateFieldDecorator('userName', {
              rules: [{ required: true, message: 'Please input your username!' }],
            }, <Input prefix={<Icon type="user" style={{ fontSize: 13 }} />} placeholder="Email" />)
          }
        </FormItem>
        <FormItem>
          {
            this.generateFieldDecorator('password', {
              rules: [{ required: true, message: 'Please input your Password!' }],
            }, <Input prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="password" placeholder="Password" />)
          }
        </FormItem>
        <FormItem>
          <Link className="login-form-forgot" style={{ float: 'right' }} to="/accounts/reset-password">Forgot password</Link>
        </FormItem>
        <FormItem>
          <Button loading={loginPending} type="primary" style={{ width: '100%' }} htmlType="submit" className="login-form-button">
            Log in
          </Button>
          Or <Link to="/accounts/signup">register now!</Link>
        </FormItem>
      </Form>
    );
  }
}

LoginPage.propTypes = {
  form: PropTypes.object.isRequired,
  loginRequest: PropTypes.func.isRequired,
  loginPage: PropTypes.object.isRequired,
};

const mapStateToProps = createStructuredSelector({
  loginPage: makeSelectLoginPage(),
});

function mapDispatchToProps(dispatch) {
  return {
    loginRequest: bindActionCreators(loginRequest, dispatch),
  };
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);
const withReducer = injectReducer({ key: 'loginPage', reducer });
const withSaga = injectSaga({ key: 'loginPage', saga });
const WrappedLoginPage = Form.create()(LoginPage);

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(WrappedLoginPage);
