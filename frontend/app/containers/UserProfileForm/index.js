/**
 *
 * UserProfileForm
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose, bindActionCreators } from 'redux';
import _ from 'lodash';
import { Row, Col, Form, Input, Button, Spin, message, Radio } from 'antd';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import { formItemLayout, tailFormItemLayout, FormWrapper } from 'common/styles';
import makeSelectUserProfileForm from './selectors';
import reducer from './reducer';
import saga from './saga';
import { requiredRule } from './form-rules';
import { getUserProfile, updateUserProfile } from './actions';

const FormItem = Form.Item;

const altitudeUnits = [{ label: 'Feet', value: 'f' }, { label: 'Meters', value: 'm' }];

export class UserProfileForm extends React.Component {
  componentWillMount() {
    this.props.getUserProfile();
  }

  generateFieldDecorator = (type, config, component) =>
    this.props.form.getFieldDecorator(type, config)(component);

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return message.error('Please fix the errors');
      }

      const { userProfile } = this.props.userProfileForm.data;

      return this.props.updateUserProfile({ ...values, id: userProfile.id });
    });
  };

  render() {
    return (
      <Row>
        <Row>
          <Col span="24">
            <h1>User Profile</h1>
          </Col>
        </Row>
        <Row type="flex" justify="start">
          <FormWrapper maxWidth="650px">
            <Spin spinning={this.props.userProfileForm.ui.getUserProfilePending}>
              <Form onSubmit={this.handleSubmit}>
                <FormItem {...formItemLayout} label="First Name" hasFeedback>
                  {this.generateFieldDecorator('first_name', requiredRule(), <Input type="text" />)}
                </FormItem>
                <FormItem {...formItemLayout} label="Last Name" hasFeedback>
                  {this.generateFieldDecorator('last_name', requiredRule(), <Input type="text" />)}
                </FormItem>
                <FormItem {...formItemLayout} label="Email" hasFeedback>
                  {this.generateFieldDecorator('email', requiredRule(), <Input type="text" />)}
                </FormItem>
                <FormItem {...formItemLayout} label="Mobile" hasFeedback>
                  {this.generateFieldDecorator(
                    'mobile_number',
                    requiredRule(),
                    <Input type="text" />
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="Organization" hasFeedback>
                  {this.generateFieldDecorator(
                    'organization',
                    requiredRule(),
                    <Input type="text" />
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="Altitude Unit" hasFeedback>
                  {this.generateFieldDecorator(
                    'altitude_unit',
                    requiredRule(),
                    <Radio.Group options={altitudeUnits} />
                  )}
                </FormItem>
                <FormItem {...tailFormItemLayout}>
                  <Button type="primary" htmlType="submit">
                    Save
                  </Button>
                </FormItem>
              </Form>
            </Spin>
          </FormWrapper>
        </Row>
      </Row>
    );
  }
}

UserProfileForm.propTypes = {
  form: PropTypes.object.isRequired,
  getUserProfile: PropTypes.func.isRequired,
  userProfileForm: PropTypes.object.isRequired,
  updateUserProfile: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  userProfileForm: makeSelectUserProfileForm(),
});

function mapDispatchToProps(dispatch) {
  return {
    getUserProfile: bindActionCreators(getUserProfile, dispatch),
    updateUserProfile: bindActionCreators(updateUserProfile, dispatch),
  };
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);

const withReducer = injectReducer({ key: 'userProfileForm', reducer });
const withSaga = injectSaga({ key: 'userProfileForm', saga });

const WrappedUserProfileForm = Form.create({
  mapPropsToFields: (props) =>
    _.reduce(
      props.userProfileForm.data.userProfile,
      (memo, value, key) => {
        // eslint-disable-next-line
        memo[key] = {
          value,
        };
        return memo;
      },
      {}
    ),
})(UserProfileForm);

export default compose(withReducer, withSaga, withConnect)(WrappedUserProfileForm);
