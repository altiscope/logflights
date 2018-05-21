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
import { Link } from 'react-router-dom';
import { getDefaultOptions as getDefaultAPIOptions } from 'services/api';

const formatDuration = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const totalSecondsRemainder = totalSeconds % 3600;
  const minutes = Math.floor(totalSecondsRemainder / 60);
  // const seconds = Math.floor(totalSeconds % 60);
  let duration = '';
  if (hours > 0) {
    duration += `${hours} hours`;
  }
  if (minutes > 0) {
    duration += ` ${minutes} minutes`;
  }
  // if (seconds > 0) {
  //   duration += ` ${seconds} seconds`;
  // }
  return duration;
};

const formatTime = (time) => {
  const format = 'YYYY-MM-DD HH:mm:ss ';
  return moment(new Date(time * 1000)).format(format);
};

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
    const downloadLink = `${baseURL}/plans/${this.props.flightPlan.id}/download_telemetry/`;
    const hasTelemetry = this.props.telemetry.length > 0;

    if (this.props.mode === 'public' || !this.props.isOwner) {
      if (hasTelemetry) {
        return <a href={downloadLink}>Download Telemetry</a>;
      }

      return <span>No Telemetry Uploaded</span>;
    }

    return (
      <Upload {...this.getUploadProps()} fileList={this.props.uploadedTelemetry}>
        <Button>
          <Icon type="upload" /> {hasTelemetry ? 'Replace Telemetry' : 'Upload Telemetry'}
        </Button>
      </Upload>
    );
  }

  render() {
    const { flightPlan, telemetry, waypoints, isOwner } = this.props;
    const {
      // eslint-disable-next-line camelcase
      planned_duration_in_secs,
      // eslint-disable-next-line camelcase
      planned_arrival_time,
      // eslint-disable-next-line camelcase
      planned_departure_time,
    } = flightPlan;

    const distance = _.get(
      flightPlan.telemetry ? flightPlan.telemetry : flightPlan.waypoints,
      'distance',
      0
    );
    const items = [
      { label: 'FLIGHT ID', value: flightPlan.flight_id },
      { label: 'VEHICLE SERIAL#', value: _.get(flightPlan, 'vehicle.serial_number', '') },
      { label: 'MISSION TYPE', value: _.get(flightPlan, 'mission_type', '') },
      {
        label: 'LOCATION',
        value: _.get(
          flightPlan.telemetry ? flightPlan.telemetry : flightPlan.waypoints,
          'location',
          ''
        ),
      },
      {
        label: 'DISTANCE',
        value: `${Math.round(distance)} meters`,
      },
      { label: 'PLANNED DEPARTURE TIME', value: formatTime(planned_departure_time) },
      { label: 'PLANNED ARRIVAL TIME', value: formatTime(planned_arrival_time) },
      { label: 'PLANNED DURATION', value: formatDuration(planned_duration_in_secs) },
      { label: 'TELEMETRY', value: this.renderTelemetryControls() },
    ];

    if (telemetry.length > 0 && flightPlan.telemetry) {
      items.push(
        {
          label: 'ACTUAL DEPARTURE TIME',
          value: formatTime(flightPlan.telemetry.actual_departure_time),
        },
        {
          label: 'ACTUAL ARRIVAL TIME',
          value: formatTime(flightPlan.telemetry.actual_arrival_time),
        },
        {
          label: 'ACTUAL DURATION',
          value: formatDuration(flightPlan.telemetry.actual_duration_in_secs),
        }
      );
    }

    if (isOwner && waypoints.length === 0) {
      items.push({
        label: 'WAYPOINTS',
        value: <Link to={`/dashboard/flight-plans/${flightPlan.id}/update`}>Upload Waypoints</Link>,
      });
    } else if (!isOwner) {
      items.push({
        label: 'WAYPOINTS',
        value: 'No waypoints',
      });
    }

    return (
      <div className="lf-c-card lf-u-padding-sm">
        {items.map(({ label, value }) => (
          <Row key={label} className="lf-u-padding-sm">
            <Col span="10" className="lf-u-color-secondary">
              {label}
            </Col>
            <Col span="14">{value}</Col>
          </Row>
        ))}
      </div>
    );
  }
}

FlightInfo.propTypes = {
  flightPlan: PropTypes.object.isRequired,
  uploadTelemetry: PropTypes.func.isRequired,
  setUploadedTelemetry: PropTypes.func.isRequired,
  uploadedTelemetry: PropTypes.array,
  telemetry: PropTypes.array,
  deleteTelemetry: PropTypes.func.isRequired,
  mode: PropTypes.oneOf(['public', 'private']),
  isOwner: PropTypes.bool.isRequired,
  waypoints: PropTypes.array.isRequired,
};

export default FlightInfo;
