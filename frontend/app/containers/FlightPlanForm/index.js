/**
 *
 * FlightPlanForm
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import moment from 'moment';
import { createStructuredSelector } from 'reselect';
import { compose, bindActionCreators } from 'redux';
import {
  Row,
  Col,
  Form,
  Input,
  InputNumber,
  Icon,
  Select,
  DatePicker,
  Button,
  message,
  Spin,
  Upload,
} from 'antd';
import classNames from 'classnames';
import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import { formItemLayout, tailFormItemLayout, FormWrapper } from 'common/styles';
import makeSelectFlightPlanForm from './selectors';
import reducer from './reducer';
import saga from './saga';
import { requiredRule, arrivalDateRule } from './form-rules';
import {
  getVehicles,
  getFlightPlan,
  getMissionTypes,
  createFlightPlan,
  clearFlightPlanState,
  updateFlightPlan,
  uploadWaypoints,
  setUploadedWaypoint,
  markWaypointsForDeletion,
  uploadWaypointsFulfilled,
} from './actions';
import WaypointsEditor from './WaypointsEditor';

const FormItem = Form.Item;
const Option = Select.Option;

const defaultValues = {
  id: '',
  operator: '',
  mission_type: '',
  flight_id: '',
  planned_departure_time: null,
  planned_arrival_time: null,
  vehicle: '',
  payload_weight: '',
  waypoints: '',
};

export class FlightPlanForm extends React.Component {
  state = {
    waypoints: null,
    hasCustomWaypointsData: false,
  };

  componentWillMount() {
    const { flightPlanForm } = this.props;

    if (flightPlanForm.data.vehicles.length === 0) {
      this.props.getVehicles();
    }

    if (flightPlanForm.data.missionTypes.length === 0) {
      this.props.getMissionTypes();
    }

    // update mode - get flight plan
    if (this.props.match.params.id) {
      this.props.getFlightPlan(this.props.match.params.id);
    }
  }

  componentDidUpdate(prevProps) {
    const { flightPlan } = this.props.flightPlanForm.data;
    const { flightPlanForm } = this.props;
    const match = this.props.match;
    const previousFlightPlan = prevProps.flightPlanForm.data.flightPlan;

    // set value upon receiving data from the endpoints
    if (_.isEmpty(previousFlightPlan) && !_.isEmpty(flightPlan)) {
      // this.props.form.setFieldsValue(flightPlan);
      this.props.form.setFieldsValue({
        ...flightPlan,
        vehicle: flightPlan.vehicle.id,
      });
    }

    // clear and set form only if this changes from edit to create
    if (!match.params.id && prevProps.match.params.id) {
      this.props.clearFlightPlanState();
      this.props.form.setFieldsValue(defaultValues);
    }

    if (flightPlanForm.data.vehicles.length === 0) {
      this.props.getVehicles();
    }

    if (flightPlanForm.data.missionTypes.length === 0) {
      this.props.getMissionTypes();
    }
  }

  componentWillUnmount() {
    this.props.clearFlightPlanState();
  }

  getFlightPlanParams = (values) => {
    // if waypoints is populated, add it to flight plan params
    const { newWaypointId } = this.props.flightPlanForm.ui;

    if (newWaypointId) {
      return { ...values, waypoints: newWaypointId };
    }

    return values;
  };

  getFormTitle = () =>
    window.location.pathname.includes('update') ? 'Update Flight Plan' : 'New Flight Plan';

  /*
   * onProgress: (event: { percent: number }): void
   * onError: (event: Error, body?: Object): void
   * onSuccess: (body: Object): void
   * data: Object
   * filename: String
   * file: File
   * withCredentials: Boolean
   * action: String
   * headers: Object
   */
  getUploadProps = () => ({
    name: 'waypoints',
    customRequest: ({ onSuccess, onError, onProgress, file }) => {
      this.props.uploadWaypoints({
        type: 'waypoints',
        file,
        onSuccess,
        onProgress,
        onError,
      });
    },
    beforeUpload: (file) => {
      const isWaypointFile = this.isValidWaypointFile(file);

      if (!isWaypointFile) {
        message.error('Unsupported Waypoint Format, please upload a different waypoint file.');
      }

      return isWaypointFile;
    },
    onChange: (info) => {
      // 1. Limit the number of uploaded files
      // Only to show two recent uploaded files, and old ones will be replaced by the new
      let fileList = info.fileList.slice(-1);

      // 2. read from response and show file link
      fileList = fileList.map((file) => {
        const newFile = {
          ...file,
        };
        if (file.response) {
          // Component will show file.url as link
          newFile.url = file.response.url;
        }
        return newFile;
      });

      // 3. filter successfully uploaded files according to response from server
      fileList = fileList.filter((file) => {
        const isValid = this.isValidWaypointFile(file);

        if (file.response) {
          return file.response.status === 'success' && isValid;
        }

        return isValid;
      });

      this.props.setUploadedWaypoint(fileList);
      this.setState({ hasCustomWaypointsData: false });
    },
    onRemove: () => {
      this.props.markWaypointsForDeletion();
    },
  });

  getFormLabelProps = (fieldId, { disabled } = { disabled: false }) => ({
    className: classNames({
      'has-error': this.props.form.getFieldError(fieldId),
      'form-item-disabled': disabled,
    }),
    xs: { span: 24 },
    sm: { span: 6 },
  });

  generateFieldDecorator = (type, config, component) =>
    this.props.form.getFieldDecorator(type, config)(component);

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return message.error('Please fix the errors');
      }

      if (this.props.match.params.id) {
        return this.props.updateFlightPlan(
          this.getFlightPlanParams({
            ...values,
            id: this.props.match.params.id,
          }),
          this.props.flightPlanForm.ui.removeWaypoint
        );
      }

      return this.props.createFlightPlan(this.getFlightPlanParams(values));
    });
  };

  isFormPending = () => {
    const {
      getVehiclesPending,
      missionTypesPending,
      getFlightPlanPending,
    } = this.props.flightPlanForm.ui;

    return getVehiclesPending || missionTypesPending || getFlightPlanPending;
  };

  missionTypes = () =>
    this.props.flightPlanForm.data.missionTypes.map((m) => (
      <Option key={String(m.id)} value={String(m.title)}>
        {m.title}
      </Option>
    ));

  vehicles = () =>
    this.props.flightPlanForm.data.vehicles.map((v) => (
      <Option key={String(v.id)} value={String(v.id)}>
        {v.serial_number}
      </Option>
    ));

  isValidWaypointFile = (file) => file.name.includes('.waypoints') || file.name.includes('.plan');

  validateArrivalDate = (rule, value, callback) => {
    const form = this.props.form;
    const departure = moment(form.getFieldValue('planned_departure_time'));

    if (value && moment(value).isBefore(departure)) {
      return callback('Arrival date should be after departure date');
    }

    return callback();
  };

  render() {
    const {
      createFlightPlanPending,
      updateFlightPlanPending,
      uploadedWaypoint,
      newWaypointId,
    } = this.props.flightPlanForm.ui;
    const controlWidth = { width: '100%' };

    const waypointMetadataId =
      newWaypointId ||
      _.get(
        this.props,
        // waypoint_metadata_id when editing
        'flightPlanForm.data.flightPlan.waypoints.id',
        // waypoint_metdata_id when new
        newWaypointId
      );

    const { form } = this.props;

    return (
      <Row>
        <Row>
          <Col span="24">
            <h1>{this.getFormTitle()}</h1>
          </Col>
        </Row>
        <Row>
          <Col span="12">
            <FormWrapper maxWidth="650px">
              <Spin spinning={this.isFormPending()} size="large">
                <Form onSubmit={this.handleSubmit}>
                  <FormItem
                    {...formItemLayout}
                    label="Flight ID"
                    labelCol={this.getFormLabelProps('flight_id')}
                    hasFeedback
                  >
                    {this.generateFieldDecorator(
                      'flight_id',
                      requiredRule(),
                      <Input type="text" />
                    )}
                  </FormItem>
                  <FormItem
                    {...formItemLayout}
                    label="Vehicle"
                    labelCol={this.getFormLabelProps('vehicle')}
                    hasFeedback
                  >
                    {this.generateFieldDecorator(
                      'vehicle',
                      requiredRule(),
                      <Select>{this.vehicles()}</Select>
                    )}
                  </FormItem>
                  <FormItem
                    {...formItemLayout}
                    label="Mission"
                    labelCol={this.getFormLabelProps('mission_type')}
                    hasFeedback
                  >
                    {this.generateFieldDecorator(
                      'mission_type',
                      requiredRule(),
                      <Select>{this.missionTypes()}</Select>
                    )}
                  </FormItem>
                  <FormItem
                    {...formItemLayout}
                    label="Departure Time"
                    labelCol={this.getFormLabelProps('planned_departure_time')}
                    hasFeedback
                  >
                    {this.generateFieldDecorator(
                      'planned_departure_time',
                      {
                        ...requiredRule(),
                        initialValue: moment(),
                        onChange(value) {
                          if (form.getFieldValue('planned_arrival_time') || !value) return;

                          form.setFieldsValue({
                            planned_arrival_time: value.clone().add(1, 'hour'),
                          });
                        },
                      },
                      <DatePicker
                        style={controlWidth}
                        showTime={{
                          format: 'HH:mm',
                        }}
                        format="YYYY-MM-DD HH:mm"
                        placeholder="Select Time"
                      />
                    )}
                  </FormItem>
                  <FormItem
                    {...formItemLayout}
                    label="Arrival Time"
                    labelCol={this.getFormLabelProps('planned_arrival_time')}
                    hasFeedback
                  >
                    {this.generateFieldDecorator(
                      'planned_arrival_time',
                      {
                        ...arrivalDateRule(this.validateArrivalDate),
                        initialValue: moment().add(1, 'hour'),
                      },
                      <DatePicker
                        style={controlWidth}
                        showTime={{
                          format: 'HH:mm',
                        }}
                        format="YYYY-MM-DD HH:mm"
                        placeholder="Select Time"
                      />
                    )}
                  </FormItem>
                  <FormItem
                    {...formItemLayout}
                    label="Payload Weight (kg)"
                    labelCol={this.getFormLabelProps('payload_weight')}
                    hasFeedback
                  >
                    {this.generateFieldDecorator(
                      'payload_weight',
                      requiredRule(),
                      <InputNumber style={controlWidth} min={0} max={100} step={0.1} />
                    )}
                  </FormItem>
                  <FormItem {...tailFormItemLayout}>
                    <Button
                      loading={createFlightPlanPending || updateFlightPlanPending}
                      type="primary"
                      htmlType="submit"
                    >
                      Save
                    </Button>
                  </FormItem>
                </Form>
              </Spin>
            </FormWrapper>
          </Col>
          <Col span="12">
            <Upload
              {...this.getUploadProps()}
              fileList={
                uploadedWaypoint[0] && uploadedWaypoint[0].name === '' ? [] : uploadedWaypoint
              }
            >
              <Button>
                <Icon type="upload" /> Click to Upload Waypoints
              </Button>
              <span style={{ padding: 10 }}>or, enter below</span>
            </Upload>
            <WaypointsEditor
              id={waypointMetadataId}
              flightPlanId={this.props.match.params.id}
              onSave={(waypointId) => {
                this.setState({
                  hasCustomWaypointsData: true,
                });
                if (waypointId && waypointId !== waypointMetadataId) {
                  this.props.uploadWaypointsFulfilled({
                    success: true,
                    wm_id: waypointId,
                    url: '',
                  });
                }
                // Reset file uploads
                this.props.setUploadedWaypoint([]);
              }}
            />
          </Col>
        </Row>
      </Row>
    );
  }
}

FlightPlanForm.propTypes = {
  form: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  flightPlanForm: PropTypes.object.isRequired,
  getMissionTypes: PropTypes.func.isRequired,
  getVehicles: PropTypes.func.isRequired,
  createFlightPlan: PropTypes.func.isRequired,
  clearFlightPlanState: PropTypes.func.isRequired,
  getFlightPlan: PropTypes.func.isRequired,
  updateFlightPlan: PropTypes.func.isRequired,
  uploadWaypoints: PropTypes.func.isRequired,
  setUploadedWaypoint: PropTypes.func.isRequired,
  markWaypointsForDeletion: PropTypes.func.isRequired,
  uploadWaypointsFulfilled: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  flightPlanForm: makeSelectFlightPlanForm(),
});

function mapDispatchToProps(dispatch) {
  return {
    getMissionTypes: bindActionCreators(getMissionTypes, dispatch),
    uploadWaypoints: bindActionCreators(uploadWaypoints, dispatch),
    getVehicles: bindActionCreators(getVehicles, dispatch),
    createFlightPlan: bindActionCreators(createFlightPlan, dispatch),
    clearFlightPlanState: bindActionCreators(clearFlightPlanState, dispatch),
    getFlightPlan: bindActionCreators(getFlightPlan, dispatch),
    updateFlightPlan: bindActionCreators(updateFlightPlan, dispatch),
    setUploadedWaypoint: bindActionCreators(setUploadedWaypoint, dispatch),
    markWaypointsForDeletion: bindActionCreators(markWaypointsForDeletion, dispatch),
    uploadWaypointsFulfilled: bindActionCreators(uploadWaypointsFulfilled, dispatch),
  };
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);

const withReducer = injectReducer({ key: 'flightPlanForm', reducer });
const withSaga = injectSaga({ key: 'flightPlanForm', saga });
const WrappedFlightPlanForm = Form.create()(FlightPlanForm);

export default compose(withReducer, withSaga, withConnect)(WrappedFlightPlanForm);
