/**
 *
 * CreateNewPasswordForm
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose, bindActionCreators } from 'redux';
import { Link } from 'react-router-dom';
import { Form, Input, Row, Icon, message } from 'antd';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import makeSelectCreateNewPasswordForm from './selectors';
import reducer from './reducer';
import saga from './saga';
import { ResetButton } from './styles';
import { createNewPassword } from './actions';

const FormItem = Form.Item;

export class CreateNewPasswordForm extends React.Component { // eslint-disable-line react/prefer-stateless-function

  generateFieldDecorator = (type, config, component) =>
    this.props.form.getFieldDecorator(type, config)(component)

  validatePasswordConfirmation = (rules, value, callback) => {
    const form = this.props.form;
    const password = form.getFieldValue('new_password1');

    if (value && value !== password) {
      return callback('Passwords does not match');
    }

    return callback();
  }

  createNewPassword = (e) => {
    e.preventDefault();
    const token = this.props.match.params.token;

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return message.error('Please fix the errors');
      }

      return this.props.createNewPassword({
        token,
        ...values,
      });
    });
  }

  renderForm = () => (
    <Form onSubmit={this.createNewPassword} style={{ width: '100%', maxWidth: '300px', margin: 'auto' }} className="reset-password-form">
      <FormItem
        label="New Password"
        hasFeedback
      >
        {
            this.generateFieldDecorator('new_password1', {
              rules: [{ required: true, message: 'please enter your new password' }],
            }, (
              <Input type="password" />
            ))
          }
      </FormItem>
      <FormItem
        label="Confirm New Password"
        hasFeedback
      >
        {
            this.generateFieldDecorator('new_password2', {
              rules: [{
                required: true,
                message: 'please re-enter your new password',
              }, {
                validator: this.validatePasswordConfirmation,
              }],
            }, (
              <Input type="password" />
            ))
          }
      </FormItem>
      <FormItem>
        <ResetButton type="primary" htmlType="submit">Submit</ResetButton>
      </FormItem>
    </Form>
    )

  renderSuccessMessage = () => {
    const loginLink = <Link to="/accounts/login">here</Link>;
    return (
      <div style={{ margin: 'auto' }}>
        <Row type="flex" justify="center">
          <Icon style={{ fontSize: '62px', color: '#00e600' }} type="check-circle" />
        </Row>
        <Row style={{ marginTop: '26px' }} type="flex" justify="center">
          <h1>Password reset successful. Click {loginLink} to login</h1>
        </Row>
      </div>
    );
  }

  render() {
    const { createNewPasswordFulfilled } = this.props.createNewPasswordForm.ui;

    return createNewPasswordFulfilled ? this.renderSuccessMessage() : this.renderForm();
  }
}

CreateNewPasswordForm.propTypes = {
  match: PropTypes.object.isRequired,
  createNewPassword: PropTypes.func.isRequired,
  createNewPasswordForm: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
};

const mapStateToProps = createStructuredSelector({
  createNewPasswordForm: makeSelectCreateNewPasswordForm(),
});

function mapDispatchToProps(dispatch) {
  return {
    createNewPassword: bindActionCreators(createNewPassword, dispatch),
  };
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);

const withReducer = injectReducer({ key: 'createNewPasswordForm', reducer });
const withSaga = injectSaga({ key: 'createNewPasswordForm', saga });
const WrappedCreateNewPasswordForm = Form.create()(CreateNewPasswordForm);

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(WrappedCreateNewPasswordForm);
