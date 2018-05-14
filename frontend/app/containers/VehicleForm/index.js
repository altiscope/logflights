/**
 *
 * VehicleForm
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose, bindActionCreators } from 'redux';
import { Row, Col, Form, Select, Input, InputNumber, Button, message, Spin } from 'antd';
import _ from 'lodash';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import { formItemLayout, tailFormItemLayout, FormWrapper } from 'common/styles';
import { VEHICLE_TYPES, VEHICLE_STATES } from './constants';
import makeSelectVehicleForm from './selectors';
import reducer from './reducer';
import saga from './saga';
import * as formRules from './form-rules';
import {
  getManufacturers,
  createVehicle,
  getVehicle,
  updateVehicle,
  clearVehicleState,
} from './actions';

const FormItem = Form.Item;
const Option = Select.Option;

const defaultValues = {
  operator: '',
  manufacturer_id: '',
  model: '',
  empty_weight: '',
  vehicle_type: '',
  state: '',
  manufacturer: '',
  serial_number: '',
  id: '',
};

export class VehicleForm extends React.Component {
  // eslint-disable-line react/prefer-stateless-function

  componentWillMount() {
    const { vehicleForm, match } = this.props;

    if (vehicleForm.data.manufacturers.length === 0) {
      this.props.getManufacturers();
    }

    // update mode - get vehicle
    if (match.params.id) {
      this.props.getVehicle(match.params.id);
    }
  }

  componentDidUpdate(prevProps) {
    const { vehicle } = this.props.vehicleForm.data;
    const match = this.props.match;
    const previousVehicle = prevProps.vehicleForm.data.vehicle;

    // set value upon receiving data from the endpoints
    if (_.isEmpty(previousVehicle) && !_.isEmpty(vehicle)) {
      // convert vehicleType to string
      this.props.form.setFieldsValue({ ...vehicle, vehicle_type: String(vehicle.vehicle_type) });
    }

    // clear and set form only if this changes from edit to create
    if (!match.params.id && prevProps.match.params.id) {
      this.props.clearVehicleState();
      this.props.form.setFieldsValue(defaultValues);
    }
  }

  componentWillUnmount() {
    // create vehicle from state when unmounting
    this.props.clearVehicleState();
  }

  generateFieldDecorator = (type, config, component) =>
    this.props.form.getFieldDecorator(type, config)(component);

  handleSubmit = (e) => {
    e.preventDefault();

    const { match } = this.props;

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return message.error('Please fix the errors');
      }

      return match.params.id
        ? this.props.updateVehicle({ ...values, id: match.params.id })
        : this.props.createVehicle(values);
    });
  };

  vehicleTypeChoices = () =>
    Object.keys(VEHICLE_TYPES).map((key) => {
      const { label, id } = VEHICLE_TYPES[key];

      return (
        <Option key={label} value={String(id)}>
          {label}
        </Option>
      );
    });

  vehicleStateChoices = () =>
    Object.keys(VEHICLE_STATES).map((key) => {
      const { label, id } = VEHICLE_STATES[key];

      return (
        <Option key={label} value={String(id)}>
          {label}
        </Option>
      );
    });

  manufacturers = () =>
    this.props.vehicleForm.data.manufacturers.map((m) => (
      <Option key={m.name} value={String(m.name)}>
        {m.name}
      </Option>
    ));

  isFormPending = () => {
    const { getManufacturersPending, getVehiclePending } = this.props.vehicleForm.ui;

    return getManufacturersPending || getVehiclePending;
  };

  renderFormTitle = () =>
    window.location.pathname.includes('update') ? 'Update Vehicle' : 'New Vehicle';

  render() {
    const { createVehiclePending } = this.props.vehicleForm.ui;
    const controlWidth = { width: '100%' };

    return (
      <Row>
        <Row>
          <Col span="24">
            <h1>{this.renderFormTitle()}</h1>
          </Col>
        </Row>
        <Row type="flex" justify="start">
          <FormWrapper maxWidth="650px">
            <Spin spinning={this.isFormPending()}>
              <Form onSubmit={this.handleSubmit}>
                <FormItem {...formItemLayout} label="Vehicle Type" hasFeedback>
                  {this.generateFieldDecorator(
                    'vehicle_type',
                    formRules.vehicleTypeRule,
                    <Select>{this.vehicleTypeChoices()}</Select>
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="Manufacturer" hasFeedback>
                  {this.generateFieldDecorator(
                    'manufacturer',
                    formRules.manufacturerRule,
                    <Select>{this.manufacturers()}</Select>
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="Model" hasFeedback>
                  {this.generateFieldDecorator('model', formRules.modelRule, <Input type="text" />)}
                </FormItem>
                <FormItem {...formItemLayout} label="Serial Number" hasFeedback>
                  {this.generateFieldDecorator(
                    'serial_number',
                    formRules.serialNumberRule,
                    <Input type="text" />
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="Empty Weight (kg)" hasFeedback>
                  {this.generateFieldDecorator(
                    'empty_weight',
                    formRules.emptyWeightRule,
                    <InputNumber style={controlWidth} min={0} max={100} step={0.1} />
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="State" hasFeedback>
                  {this.generateFieldDecorator(
                    'state',
                    formRules.stateRule,
                    <Select>{this.vehicleStateChoices()}</Select>
                  )}
                </FormItem>
                <FormItem {...tailFormItemLayout}>
                  <Button loading={createVehiclePending} type="primary" htmlType="submit">
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

VehicleForm.propTypes = {
  form: PropTypes.object.isRequired,
  getManufacturers: PropTypes.func.isRequired,
  vehicleForm: PropTypes.object.isRequired,
  createVehicle: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  getVehicle: PropTypes.func.isRequired,
  updateVehicle: PropTypes.func.isRequired,
  clearVehicleState: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  vehicleForm: makeSelectVehicleForm(),
});

function mapDispatchToProps(dispatch) {
  return {
    getManufacturers: bindActionCreators(getManufacturers, dispatch),
    createVehicle: bindActionCreators(createVehicle, dispatch),
    getVehicle: bindActionCreators(getVehicle, dispatch),
    updateVehicle: bindActionCreators(updateVehicle, dispatch),
    clearVehicleState: bindActionCreators(clearVehicleState, dispatch),
  };
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);

const withReducer = injectReducer({ key: 'vehicleForm', reducer });
const withSaga = injectSaga({ key: 'vehicleForm', saga });
const WrappedVehicleForm = Form.create()(VehicleForm);

export default compose(withReducer, withSaga, withConnect)(WrappedVehicleForm);
