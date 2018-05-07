/*
 *
 * CloneFlightPlanLink Component
 *
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Popover, Input, Form, message } from 'antd';
import { ClonePlanButton } from './styles';

const FormItem = Form.Item;

class CloneFlightPlanLink extends PureComponent {

  state = {
    visible: false,
  }

  componentWillReceiveProps(nextProps) {
    // Hide the popover after the form has been saved.
    if (this.props.cloneFlightPlanPending && !nextProps.cloneFlightPlanPending) {
      this.hide();
    }
  }

  hide = () => {
    this.setState({
      visible: false,
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return message.error('Flight Plan is Required');
      }

      return this.props.cloneFlightPlan(this.props.flightPlanId, values.flightId);
    });
  }

  popoverContent = () => {
    const { getFieldDecorator } = this.props.form;
    const { cloneFlightPlanPending } = this.props;
    const formItemStyle = { marginBottom: '0', width: '200px' };

    return (
      <Form onSubmit={this.handleSubmit}>
        <FormItem style={formItemStyle} hasFeedback>
          { getFieldDecorator('flightId', {
            rules: [{ required: true, message: 'Please enter a new flight ID' }],
          })(<Input placeholder="New Flight ID" />)}
        </FormItem>
        <ClonePlanButton loading={cloneFlightPlanPending} htmlType="submit" type="primary">Clone</ClonePlanButton>
      </Form>
    );
  }

  handleVisibleChange = (visible) => {
    this.setState({ visible });
  }

  render() {
    return (
      <Popover
        content={this.popoverContent()}
        title="Clone Flight Plan"
        trigger="click"
        visible={this.state.visible}
        onVisibleChange={this.handleVisibleChange}
      >
        <a href="#/clone">Clone</a>
      </Popover>
    );
  }
}

CloneFlightPlanLink.propTypes = {
  form: PropTypes.object.isRequired,
  flightPlanId: PropTypes.string,
  cloneFlightPlan: PropTypes.func,
  cloneFlightPlanPending: PropTypes.bool,
};

export default Form.create()(CloneFlightPlanLink);
