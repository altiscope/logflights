/**
 *
 * SignupPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose, bindActionCreators } from 'redux';
import { Form, Input, Button, message } from 'antd';
import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import { formItemLayout, tailFormItemLayout } from 'common/styles';
import H1 from 'components/H1';
import termsOfServiceContent from 'static/terms-of-service.md';
import makeSelectSignupPage from './selectors';
import reducer from './reducer';
import saga from './saga';
import * as formRules from './form-rules';
import { signup } from './actions';
import { TermsContainer } from './styles';

const FormItem = Form.Item;

export class SignupPage extends React.Component {
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return message.error('Please fix the errors');
      }

      return this.props.signup(values);
    });
  };

  checkPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback('Passwords does not match');
    } else {
      callback();
    }
  };

  createTermsMarkup = () => ({ __html: termsOfServiceContent });

  generateFieldDecorator = (type, config, component) =>
    this.props.form.getFieldDecorator(type, config)(component);

  render() {
    return (
      <Form
        onSubmit={this.handleSubmit}
        style={{ width: '100%', maxWidth: '600px', margin: 'auto' }}
      >
        <H1 style={{ textAlign: 'center' }}>Sign Up</H1>
        <FormItem {...formItemLayout} label="First Name" hasFeedback>
          {this.generateFieldDecorator(
            'first_name',
            formRules.firstNameRule,
            <Input type="text" />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="Last Name" hasFeedback>
          {this.generateFieldDecorator('last_name', formRules.lastNameRule, <Input type="text" />)}
        </FormItem>
        <FormItem {...formItemLayout} label="Email" hasFeedback>
          {this.generateFieldDecorator('email', formRules.emailRule, <Input type="text" />)}
        </FormItem>
        <FormItem {...formItemLayout} label="Mobile" hasFeedback>
          {this.generateFieldDecorator(
            'mobile_number',
            formRules.mobileRule,
            <Input type="text" />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="Organization" hasFeedback>
          {this.generateFieldDecorator(
            'organization',
            formRules.organizationRule,
            <Input type="text" />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="Password" hasFeedback>
          {this.generateFieldDecorator(
            'password',
            formRules.passwordRule,
            <Input type="password" />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="Confirm Password" hasFeedback>
          {this.generateFieldDecorator(
            'confirmPassword',
            formRules.confirmPasswordRule(this.checkPassword),
            <Input type="password" />
          )}
        </FormItem>
        <FormItem>
          <TermsContainer dangerouslySetInnerHTML={this.createTermsMarkup()} />
        </FormItem>
        <div>
          <strong>
            Please indicate your agreement with these terms of service by clicking “Agree and Sign
            Up” below. If you do not agree with all of these terms of service, please do not sign up
            for an account and do not click below.
          </strong>
        </div>
        <FormItem {...tailFormItemLayout}>
          <Button type="primary" htmlType="submit">
            Agree and Sign Up
          </Button>
        </FormItem>
      </Form>
    );
  }
}

SignupPage.propTypes = {
  form: PropTypes.object.isRequired,
  signup: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  signuppage: makeSelectSignupPage(),
});

function mapDispatchToProps(dispatch) {
  return {
    signup: bindActionCreators(signup, dispatch),
  };
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);

const withReducer = injectReducer({ key: 'signupPage', reducer });
const withSaga = injectSaga({ key: 'signupPage', saga });
const WrappedSignupPage = Form.create()(SignupPage);

export default compose(withReducer, withSaga, withConnect)(WrappedSignupPage);
