/**
 *
 * ResetPasswordForm
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose, bindActionCreators } from 'redux';
import { Form, Input, Icon, Row, message } from 'antd';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import H1 from 'components/H1';
import makeSelectResetPasswordForm from './selectors';
import { resetPassword } from './actions';
import reducer from './reducer';
import saga from './saga';
import { ResetButton } from './styles';

const FormItem = Form.Item;

export class ResetPasswordForm extends React.Component {
  generateFieldDecorator = (type, config, component) =>
    this.props.form.getFieldDecorator(type, config)(component);

  handleSubmit = (e) => {
    e.preventDefault();

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        message.error('Please fix the errors');
      }

      this.props.resetPassword(values.email);
    });
  };

  renderForm = () => {
    const { resetPasswordPending } = this.props.resetPasswordForm.ui;

    return (
      <Form
        onSubmit={this.handleSubmit}
        style={{ width: '100%', maxWidth: '300px', margin: 'auto' }}
        className="reset-password-form"
      >
        <H1>Forgot Password</H1>
        <FormItem label="Email" hasFeedback>
          {this.generateFieldDecorator(
            'email',
            {
              rules: [{ required: true, message: 'Please enter your email or username' }],
            },
            <Input />
          )}
        </FormItem>
        <FormItem>
          <ResetButton
            loading={resetPasswordPending}
            type="primary"
            htmlType="submit"
            disabled={resetPasswordPending}
          >
            Reset Password
          </ResetButton>
        </FormItem>
      </Form>
    );
  };

  renderSuccessMessage = () => (
    <div style={{ margin: 'auto' }}>
      <Row type="flex" justify="center">
        <Icon style={{ fontSize: '62px', color: '#00e600' }} type="check-circle" />
      </Row>
      <Row style={{ marginTop: '26px' }} type="flex" justify="center">
        <h1>Password reset instructions has been sent to your email.</h1>
      </Row>
    </div>
  );

  render() {
    const { resetPasswordFulfilled } = this.props.resetPasswordForm.ui;

    return resetPasswordFulfilled ? this.renderSuccessMessage() : this.renderForm();
  }
}

ResetPasswordForm.propTypes = {
  form: PropTypes.object,
  resetPasswordForm: PropTypes.object,
  resetPassword: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  resetPasswordForm: makeSelectResetPasswordForm(),
});

function mapDispatchToProps(dispatch) {
  return {
    resetPassword: bindActionCreators(resetPassword, dispatch),
  };
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);
const withReducer = injectReducer({ key: 'resetPasswordForm', reducer });
const withSaga = injectSaga({ key: 'resetPasswordForm', saga });
const WrappedResetPasswordForm = Form.create()(ResetPasswordForm);

export default compose(withReducer, withSaga, withConnect)(WrappedResetPasswordForm);
