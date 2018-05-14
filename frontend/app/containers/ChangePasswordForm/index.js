/*
 *
 * ChangePasswordForm
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { bindActionCreators, compose } from 'redux';
import { Form, Button, Input, message } from 'antd';

import { FormWrapper, formItemLayout, tailFormItemLayout } from 'common/styles';
import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import makeSelectChangePasswordForm from './selectors';
import reducer from './reducer';
import { requiredRule, confirmPasswordRule } from './form-rules';
import { changePassword } from './actions';
import saga from './saga';

const FormItem = Form.Item;

export class ChangePasswordForm extends React.Component {
  // eslint-disable-line react/prefer-stateless-function

  componentDidUpdate(prevProps) {
    const prevChangePasswordFulfilled = prevProps.changePasswordForm.ui.changePasswordFulfilled;
    const changePasswordFulfilled = this.props.changePasswordForm.ui.changePasswordFulfilled;

    if (prevChangePasswordFulfilled !== changePasswordFulfilled && changePasswordFulfilled) {
      this.props.form.setFieldsValue({
        new_password: '',
        confirm_new_password: '',
        old_password: '',
      });

      message.success('Change password successful.');
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return message.error('Please fix the errors');
      }

      return this.props.changePassword({
        new_password: values.new_password,
        old_password: values.old_password,
      });
    });
  };

  generateFieldDecorator = (type, config, component) =>
    this.props.form.getFieldDecorator(type, config)(component);

  checkPasswords = (rule, value, callback) => {
    const form = this.props.form;

    if (value && value !== form.getFieldValue('new_password')) {
      return callback('Passwords does not match.');
    }

    return callback();
  };

  render() {
    return (
      <div>
        <h1>Change Password Form</h1>
        <FormWrapper maxWidth="660px">
          <Form onSubmit={this.handleSubmit}>
            <FormItem {...formItemLayout} label="Password" hasFeedback>
              {this.generateFieldDecorator('old_password', requiredRule, <Input type="password" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="New Password" hasFeedback>
              {this.generateFieldDecorator('new_password', requiredRule, <Input type="password" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="Confirm New Password" hasFeedback>
              {this.generateFieldDecorator(
                'confirm_new_password',
                confirmPasswordRule(this.checkPasswords),
                <Input type="password" />
              )}
            </FormItem>
            <FormItem {...tailFormItemLayout}>
              <Button type="primary" htmlType="submit">
                Change Password
              </Button>
            </FormItem>
          </Form>
        </FormWrapper>
      </div>
    );
  }
}

ChangePasswordForm.propTypes = {
  changePassword: PropTypes.func.isRequired,
  changePasswordForm: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
};

const mapStateToProps = createStructuredSelector({
  changePasswordForm: makeSelectChangePasswordForm(),
});

function mapDispatchToProps(dispatch) {
  return {
    changePassword: bindActionCreators(changePassword, dispatch),
  };
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);

const withReducer = injectReducer({ key: 'changePasswordForm', reducer });
const withSaga = injectSaga({ key: 'changePasswordForm', saga });
const WrappedChangePasswordForm = Form.create()(ChangePasswordForm);

export default compose(withReducer, withSaga, withConnect)(WrappedChangePasswordForm);
