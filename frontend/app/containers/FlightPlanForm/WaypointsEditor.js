import * as React from 'react';
import _ from 'lodash';
import { message, Button, Spin, Radio } from 'antd';
import PropTypes from 'prop-types';
import { getClient } from 'services/api';
import EditableTable from 'components/EditableTable';
import { createStructuredSelector } from 'reselect';
import { makeSelectCurrentUser } from 'common/selectors';
import { connect } from 'react-redux';
import { compose } from 'redux';
import randomstring from 'randomstring';

const isItemEmpty = (row) =>
  _.every([row.latitude, row.longitude, row.altitude], (value) => value === '');

// AGL = altitude_relative
const altitudeTypes = [{ label: 'AGL', value: 'agl' }, { label: 'MSL', value: 'msl' }];

const initialData = {
  latitude: '',
  longitude: '',
  altitude: '',
};

class WaypointsEditor extends React.Component {
  constructor(props) {
    super(props);

    let altitudeUnit;
    if (props.currentUser && props.currentUser.altitude_unit) {
      altitudeUnit = props.currentUser.altitude_unit === 'f' ? 'feet' : 'meters';
    }

    this.state = {
      error: null,
      isLoaded: !props.id,
      data: props.id ? [] : [{ ...initialData, id: Math.random() }],
      isSubmitPending: false,
      altitudeType: props.id ? null : 'agl',
      id: props.id ? props.id : null,
      altitudeUnit: altitudeUnit || 'feet',
    };
    this.columns = [
      {
        id: 'order',
        Header: 'sNo.',
        accessor: 'order',
        isEditable: false,
        width: 50,
      },
      {
        id: 'latitude',
        Header: 'Latitude',
        accessor: 'latitude',
        isEditable: true,
        width: 110,
        validator: ({ value, row }) => {
          if (isItemEmpty(row)) return '';
          if (/^-?\d+(\.\d+)?$/.test(value) && value <= 90 && value >= -90) return '';
          return 'Please enter a valid latitude value, e.g., -44.9203';
        },
      },
      {
        id: 'longitude',
        Header: 'Longitude',
        accessor: 'longitude',
        isEditable: true,
        width: 110,
        validator: ({ value, row }) => {
          if (isItemEmpty(row)) return '';
          if (/^-?\d+(\.\d+)?$/.test(value) && value <= 180 && value >= -180) return '';
          return 'Please enter a valid longitude value, e.g., -124.9203';
        },
      },
      {
        id: 'altitude',
        Header: `Altitude (${this.state.altitudeUnit})`,
        accessor: 'altitude',
        isEditable: true,
        width: 110,
        validator: ({ value, row }) => {
          if (isItemEmpty(row)) return '';
          if (/^\d+$/.test(value)) return '';
          return 'Please enter a valid altitude value, e.g., 1000';
        },
      },
    ];
  }

  componentDidMount() {
    this.fetchWaypoints();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.id !== this.state.id) {
      this.setState(
        {
          id: nextProps.id,
          altitudeType: nextProps.id ? null : 'agl',
          data: nextProps.id ? [] : [{ ...initialData, id: Math.random() }],
          isLoaded: !nextProps.id,
        },
        this.fetchWaypoints
      );
    }
  }
  fetchWaypoints() {
    if (!this.state.id) return;
    this.setState({ error: false });
    getClient()
      .get(`/waypoints/${this.state.id}/`)
      .then(({ data }) => {
        // Normalize the data

        const normalizedData = _.chain(this.resequenceOrderNumbers(data.waypoints))
          .map((item) => ({
            ...item,
            altitude: convertToAltitudeValue(this.state.altitudeUnit, item),
            id: randomstring.generate(7), // need unique id to be used as key
          }))
          .map((item) => _.omitBy(item, (value, key) => key === 'altitude_relative'))
          .value();

        this.setState({
          isLoaded: true,
          altitudeType: data.waypoints[0].altitude !== null ? 'msl' : 'agl',
          data: normalizedData,
        });
      })
      .catch(() => {
        this.setState({ error: true });
      });
  }
  handleAddItem = (index) => {
    const data = [...this.state.data];
    data.splice(index, 0, {
      ...initialData,
    });
    this.setState({
      data: this.resequenceOrderNumbers(data),
    });
  };
  handleRemoveItem = (index) => {
    const data = [...this.state.data];
    // Do not allow removing the last item since they cannot re-add after that.
    if (data.length === 1) return;
    data.splice(index, 1);
    this.setState({
      data: this.resequenceOrderNumbers(data),
    });
  };
  handleItemChange = (index, item) => {
    const data = [...this.state.data];
    data[index] = item;
    this.setState({ data: this.resequenceOrderNumbers(data) });
  };
  handleSubmit = async () => {
    this.setState({ isSubmitPending: true });
    const { altitudeType, altitudeUnit } = this.state;

    // Take altitude value and convert to centimeters
    // and denote prop as either agl/msl
    const convertAltitudeToParams = ({ altitude }) => {
      let value;
      if (altitudeUnit === 'feet') {
        value = parseInt(altitude * 30.84, 10); // 1ft = 30.84cm, cast to int
      } else if (altitudeUnit === 'meters') {
        value = altitude * 100; // 1m = 100cm
      } else {
        throw new Error('Unknown altitudeUnit', altitudeUnit);
      }

      return {
        altitude: altitudeType === 'msl' ? value : null,
        altitude_relative: altitudeType === 'agl' ? value : null,
      };
    };

    const waypoints = this.resequenceOrderNumbers(
      _.reject(this.state.data, (waypoint) => isItemEmpty(waypoint))
    )
      // Remove ids to be more clear
      .map((item) => _.omitBy(item, (value, key) => key === 'id'))
      .map((item) => ({
        ...item,
        ...convertAltitudeToParams(item),
      }));

    const tempId = randomstring.generate(7);
    const params = {
      params: {
        id: this.props.flightPlanId ? this.props.flightPlanId : tempId,
        type: 'waypoints_array',
        waypoints,
      },
    };

    try {
      const { data } = await getClient().post('/plans/uploads/', params);
      const self = this;
      const checkState = () =>
        new Promise((resolve, reject) => {
          const check = async function checkUploadStatus() {
            const status = await getClient().get(data.url);
            if (status.data.state === 'p') {
              self.setState({ isSubmitPending: false });
              if (status.statusText === 'OK') {
                message.success('Waypoints Saved');
                self.props.onSave(status.data.id ? status.data.id : undefined);
              } else {
                reject('Error');
              }
              resolve();
            } else if (status.data.state === 'e') {
              reject(status.data.error);
            } else {
              setTimeout(check, 1000);
            }
          };
          check();
        });

      checkState();
    } catch (e) {
      this.setState({ isSubmitPending: false });
      message.error('Please correct any invalid values then try again.');
    }
  };
  resequenceOrderNumbers = (data) => {
    let count = 0;
    return data.map((item) => {
      let order;
      if (isItemEmpty(item)) {
        order = '';
      } else {
        count += 1;
        order = count;
      }
      return {
        ...item,
        order,
      };
    });
  };
  render() {
    const { error, isLoaded, isSubmitPending, data } = this.state;
    if (error) return <div>Error loading waypoints data</div>;
    if (!isLoaded) {
      return (
        <div style={{ textAlign: 'center' }}>
          <Spin />
        </div>
      );
    }

    // Check if all values pass their validator checks.
    const isNotEmpty = !_.every(data, isItemEmpty);
    const canSubmit =
      isNotEmpty &&
      _.reduce(
        data,
        (memo, row) => {
          if (!memo) return memo;
          const isRowValid = _.every(this.columns, (column) => {
            if (column.validator) {
              const value = row[column.accessor];
              return column.validator({ value, row }) === '';
            }
            // Has no validator, valid by default.
            return true;
          });
          return isRowValid;
        },
        true
      );

    return (
      <div>
        <div>
          <div style={{ maxHeight: 400, overflowX: 'hidden', overflowY: 'auto' }}>
            <div style={{ padding: 10 }}>
              <strong>Type: </strong>
              <Radio.Group
                options={altitudeTypes}
                value={this.state.altitudeType}
                onChange={(e) => this.setState({ altitudeType: e.target.value })}
              />
            </div>
            <EditableTable
              data={data}
              columns={this.columns}
              onAddItem={this.handleAddItem}
              onRemoveItem={this.handleRemoveItem}
              onItemChange={this.handleItemChange}
            />
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: 10 }}>
          <Button
            type="primary"
            htmlType="submit"
            onClick={this.handleSubmit}
            loading={isSubmitPending}
            disabled={!canSubmit}
          >
            {isSubmitPending ? 'Processing Waypoints' : 'Update Waypoints'}
          </Button>
        </div>
      </div>
    );
  }
}
WaypointsEditor.propTypes = {
  id: PropTypes.string,
  // eslint-disable-next-line
  onSave: PropTypes.func.isRequired,
  currentUser: PropTypes.object.isRequired,
  flightPlanId: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  currentUser: makeSelectCurrentUser(),
});

const withConnect = connect(mapStateToProps);

export default compose(withConnect)(WaypointsEditor);

// eslint-disable-next-line camelcase
export function convertToAltitudeValue(altitudeUnit, { altitude, altitude_relative }) {
  // eslint-disable-next-line camelcase
  const value = altitude !== null ? altitude : altitude_relative;
  if (altitudeUnit === 'feet') {
    return Math.round(value / 30.84); // 1ft = 30.84cm
  } else if (altitudeUnit === 'meters') {
    return value / 100; // 100cm = 1m
  }
  throw new Error('Unknown altitudeUnit', altitudeUnit);
}
