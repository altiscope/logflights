import React from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { formItemLayout, tailFormItemLayout, FormWrapper } from 'common/styles';
import { createStructuredSelector } from 'reselect';
import { makeSelectCurrentUser } from 'common/selectors';
import { connect } from 'react-redux';
import { compose } from 'redux';

const AssessmentForm = class extends React.Component {
  state = {
    isSubmitPending: false,
  };
  generateFieldDecorator = (type, config, component) =>
    this.props.form.getFieldDecorator(type, config)(component);

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;

      this.setState({ isSubmitPending: true });
      this.props
        .onSubmit({
          assessmentId: this.props.assessmentId,
          // pilotName, pilotPhone etc
          ...values,
        })
        .then(() => {
          this.setState({ isSubmitPending: false });
          this.props.onComplete();
          message.success('Submitted successfully');
        })
        .catch(() => {
          message.error('An error occurred while submitting your assessment, please try again.');
          this.setState({ isSubmitPending: false });
        });
    });
  };
  render() {
    const {
      info: { disclaimer, policy },
      currentUser,
    } = this.props;
    const pilotName = `${currentUser.first_name} ${currentUser.last_name}`;

    return (
      <div>
        <h1 style={{ textAlign: 'center' }}>Submit Assessment</h1>
        <FormWrapper style={{ width: 450 }}>
          <Form onSubmit={this.handleSubmit}>
            <Form.Item {...formItemLayout} label="Pilot Name">
              {this.generateFieldDecorator(
                'pilotName',
                {
                  rules: [{ required: true, message: "Please enter the pilot's name" }],
                  initialValue: pilotName,
                },
                <Input placeholder="Pilot Name" />
              )}
            </Form.Item>
            <Form.Item {...formItemLayout} label="Pilot Phone">
              {this.generateFieldDecorator(
                'pilotPhone',
                {
                  rules: [
                    { required: true, message: 'Please enter a valid a phone number' },
                    {
                      pattern: /\+[0-9]{10,15}/,
                      message:
                        'Phone number must be entered in the format: +9999999999. 10 to 15 digits allowed.',
                    },
                    {
                      validator: (rule, value, callback) => {
                        if (value && (value.length < 11 || value.length > 16)) {
                          return callback(
                            'Phone number must be entered in the format: +9999999999. 10 to 15 digits allowed.'
                          );
                        }

                        return callback();
                      },
                    },
                  ],
                  initialValue: currentUser.mobile_number,
                },
                <Input placeholder="Pilot Phone" />
              )}
            </Form.Item>
            <Form.Item>
              <div style={{ lineHeight: 'initial' }}>Disclaimer: {disclaimer}</div>
            </Form.Item>
            <Form.Item
              {...{
                ...formItemLayout,
                labelCol: {
                  ...formItemLayout.labelCol,
                  className: 'remove-form-item-colon',
                },
              }}
              label=" "
            >
              {this.generateFieldDecorator(
                'attest',
                {
                  rules: [{ required: true, message: 'Please check the box to agree' }],
                },
                <Checkbox>I agree to the terms and conditions</Checkbox>
              )}
            </Form.Item>
            <Form.Item {...tailFormItemLayout}>
              <Button
                type="primary"
                style={{ width: '100%' }}
                htmlType="submit"
                loading={this.state.isSubmitPending}
              >
                Submit
              </Button>
            </Form.Item>
            {policy && (
              <div style={{ textAlign: 'center' }}>
                <a href={policy} target="_blank">
                  Policy
                </a>
              </div>
            )}
          </Form>
        </FormWrapper>
      </div>
    );
  }
};

AssessmentForm.propTypes = {
  form: PropTypes.object.isRequired,
  info: PropTypes.object.isRequired,
  assessmentId: PropTypes.string.isRequired,
  currentUser: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  currentUser: makeSelectCurrentUser(),
});
const withConnect = connect(mapStateToProps);
const WrappedForm = Form.create()(AssessmentForm);

export default compose(withConnect)(WrappedForm);
