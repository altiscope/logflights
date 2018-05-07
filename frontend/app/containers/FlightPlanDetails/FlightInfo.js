/*
 *
 * FlightInfo Component
 *
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import _ from 'lodash';
import { Row, Col, Upload, Button, Icon, message } from 'antd';
import { getDefaultOptions as getDefaultAPIOptions } from 'services/api';
import { FlightInfoWrapper, Info } from './styles';

class FlightInfo extends PureComponent {
  getUploadProps = () => {
    const flightPlanId = this.props.flightPlan.id;

    return {
      name: 'telemetry',
      customRequest: ({ onSuccess, onError, onProgress, file }) => {
        this.props.uploadTelemetry({
          type: 'telemetry',
          file,
          onSuccess,
          onProgress,
          onError,
          flightPlanId,
        });
      },
      beforeUpload: (file) => {
        const isTelemetryFile = this.isValidTelemetryFile(file);

        if (!isTelemetryFile) {
          message.error('Unsupported Telemetry Format');
          // remove the invalid file
          this.props.setUploadedTelemetry([]);
        }

        return isTelemetryFile;
      },
      onChange: (info) => {
        // 1. Limit the number of uploaded files
        // Only to show one recent uploaded files, and old ones will be replaced by the new
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
          if (file.response && this.isValidTelemetryFile(file)) {
            return file.response.status === 'success';
          }

          return this.isValidTelemetryFile(file);
        });

        this.props.setUploadedTelemetry(fileList);
      },
      onRemove: (file) => {
        const deleteTelemetry = confirm('Remove Telemetry?');

        if (deleteTelemetry && !file.error) {
          this.props.deleteTelemetry(this.props.flightPlan.id);
        }

        return deleteTelemetry;
      },
    };
  };

  isValidTelemetryFile = (file) => {
    const fileName = file.name.toLowerCase();

    // todo: use fileName in [Array of allowed file names]
    return (
      fileName.includes('.tlog') ||
      fileName.includes('.ulg') ||
      fileName.includes('.txt') ||
      fileName.includes('.bin')
    );
  };

  renderTelemetryControls() {
    // @TODO refactor to only need relative path
    const { baseURL } = getDefaultAPIOptions();
    const downloadLink = `${baseURL}/plans/${
      this.props.flightPlan.id
    }/download_telemetry/`;
    const hasTelemetry = this.props.telemetry.length > 0;

    const isOwner =
      this.props.flightPlan &&
      this.props.currentUser &&
      this.props.flightPlan.operator === this.props.currentUser.organization;

    if (this.props.mode === 'public' || !isOwner) {
      if (hasTelemetry) {
        return <a href={downloadLink}>Download Telemetry</a>;
      }

      return <span>No Telemetry Uploaded</span>;
    }

    return (
      <Upload
        {...this.getUploadProps()}
        fileList={this.props.uploadedTelemetry}
      >
        <Button>
          <Icon type="upload" />{' '}
          {hasTelemetry ? 'Replace Telemetry' : 'Upload Telemetry'}
        </Button>
      </Upload>
    );
  }

  render() {
    const { flightPlan } = this.props;
    const { planned_arrival_time, planned_departure_time } = flightPlan;
    const format = 'YYYY-MM-DD HH:mm:ss ';

    const arrivalTime = moment(new Date(planned_arrival_time * 1000)).format(
      format
    ); // eslint-disable-line
    const departureTime = moment(
      new Date(planned_departure_time * 1000)
    ).format(format); // eslint-disable-line

    return (
      <Row>
        <Col span="6">
          <FlightInfoWrapper loading={this.props.isLoading}>
            <Info>
              <h3>Operator: </h3>
              <p>{flightPlan.operator}</p>
            </Info>
            <Info>
              <h3>Flight ID: </h3>
              <p>{flightPlan.flight_id}</p>
            </Info>
            <Info>
              <h3>Serial Number: </h3>
              <p>{_.get(flightPlan, 'vehicle.serial_number', '')}</p>
            </Info>
          </FlightInfoWrapper>
        </Col>
        <Col span="6">
          <FlightInfoWrapper loading={this.props.isLoading}>
            <Info>
              <h3>Departure Time: </h3>
              <p>{departureTime}</p>
            </Info>
            <Info>
              <h3>Arrival Time: </h3>
              <p>{arrivalTime}</p>
            </Info>
            <Info>
              <h3>Telemetry: </h3>
              {this.renderTelemetryControls()}
            </Info>
          </FlightInfoWrapper>
        </Col>
      </Row>
    );
  }
}

FlightInfo.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  flightPlan: PropTypes.object.isRequired,
  uploadTelemetry: PropTypes.func.isRequired,
  setUploadedTelemetry: PropTypes.func.isRequired,
  uploadedTelemetry: PropTypes.array,
  telemetry: PropTypes.array,
  deleteTelemetry: PropTypes.func.isRequired,
  currentUser: PropTypes.object,
  mode: PropTypes.oneOf(['public', 'private']),
};

export default FlightInfo;
