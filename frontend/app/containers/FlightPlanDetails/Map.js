/*
 *
 * Map Component
 *
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import _ from 'lodash';

import { mapStyles } from './constants';
import {
  MapWrapper,
  WaypointsCTAWrapper,
  UploadWaypointsCTA,
  PublicWaypointCTAText,
} from './styles';

const google = window.google;

class Map extends PureComponent {
  componentWillMount() {
    this.initMapVariables();
  }

  componentDidUpdate() {
    if (this.props.getWaypointsFulfilled && this.props.getTelemetryFulfilled) {
      this.loadMap();
    }
  }

  initMapVariables = () => {
    this.markerArray = [];
    this.telemetryMarkerArray = [];
    this.locations = [];
    this.telemetryLocations = [];
    this.icon = '';
    this.map = {};
  };

  loadMap = () => {
    // reset variables
    this.initMapVariables();
    const waypoints = this.props.waypoints.waypoints || [];
    const telemetry = this.props.telemetry || [];

    let centerLat = '';
    let centerLong = '';

    if (waypoints.length > 0) {
      centerLat = parseFloat(waypoints[0].latitude);
      centerLong = parseFloat(waypoints[0].longitude);
    } else if (telemetry.length > 0) {
      centerLat = parseFloat(telemetry[0].latitude);
      centerLong = parseFloat(telemetry[0].longitude);
    }

    // creating map object for display
    this.map = new google.maps.Map(document.getElementById('flight-plan-map'), {
      zoom: 8, // set zoom level
      center: new google.maps.LatLng(centerLat, centerLong), // set latlng of the center
      scrollwheel: false,
      styles: mapStyles,
    });

    if (waypoints.length > 0) {
      _.each(waypoints, (value) => {
        // getting latlng and converting into format
        const items = { lat: parseFloat(value.latitude), lng: parseFloat(value.longitude) };
        this.locations.push(items);
      });

      const flightPath = new google.maps.Polyline({
        path: this.locations,
        geodesic: true,
        strokeColor: '#F8FC04',
        strokeOpacity: 1.0,
        strokeWeight: 2,
      });

      flightPath.setMap(this.map);

      for (let i = 0; i < this.locations.length; i += 1) {
        if (i === 0) {
          this.icon =
            'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=A|2DFB04|000000';
          this.addMarker(this.locations[i].lat, this.locations[i].lng);
        } else if (i === this.locations.length - 1) {
          this.icon =
            'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=B|FB0404|000000';
          this.addMarker(this.locations[i].lat, this.locations[i].lng);
        }
      }
    }

    if (telemetry.length > 0) {
      _.each(telemetry, (value) => {
        // getting latlng and converting into format
        const items = { lat: parseFloat(value.latitude), lng: parseFloat(value.longitude) };
        this.telemetryLocations.push(items);
      });

      const telemetryFlights = new google.maps.Polyline({
        path: this.telemetryLocations,
        geodesic: true,
        strokeColor: '#FF5733',
        strokeOpacity: 1.0,
        strokeWeight: 2,
      });

      telemetryFlights.setMap(this.map);

      // telemetry_MarkerArray = [];
      for (let i = 0; i < this.telemetryLocations.length; i += 1) {
        if (i === 0) {
          this.icon =
            'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=C|ECF0F1|000000';
          this.tAddMarker(this.telemetryLocations[i].lat, this.telemetryLocations[i].lng);
        } else if (i === this.telemetryLocations.length - 1) {
          this.icon =
            'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=D|2980B9|000000';
          this.tAddMarker(this.telemetryLocations[i].lat, this.telemetryLocations[i].lng);
        }
      }
    }

    if (this.locations.length > 0) {
      // Create an ElevationService.
      const elevator = new google.maps.ElevationService();

      this.displayPathElevation(this.locations, elevator, this.map);
    }

    this.setState({ mapLoaded: true });
  };

  displayPathElevation = (path, elevator, map) => {
    // Display a polyline of the elevation path.
    // eslint-disable-next-line no-new
    new google.maps.Polyline({
      // eslint-disable-line
      path,
      strokeColor: '#0000CC',
      strokeOpacity: 0.4,
      map,
    });

    // Create a PathElevationRequest object using this array.
    // Ask for 256 samples along that path.
    // Initiate the path request.
    elevator.getElevationAlongPath(
      {
        path,
        samples: 256,
      },
      this.plotElevation
    );
  };

  plotElevation = (elevations, status) => {
    const chartDiv = document.getElementById('elevation-chart');
    if (status !== 'OK') {
      // Show the error code inside the chartDiv.
      chartDiv.innerHTML = `Cannot show elevation: request failed because ${status}`;
      return;
    }
    // Create a new chart in the elevation_chart DIV.
    const chart = new google.visualization.ColumnChart(chartDiv);

    // Extract the data from which to populate the chart.
    // Because the samples are equidistant, the 'Sample'
    // column here does double duty as distance along the
    // X axis.
    const data = new google.visualization.DataTable();
    data.addColumn('string', 'Sample');
    data.addColumn('number', 'Elevation');
    for (let i = 0; i < elevations.length; i += 1) {
      data.addRow(['', elevations[i].elevation]);
    }

    // Draw the chart using the data within its DIV.
    chart.draw(data, {
      height: 150,
      legend: 'none',
      titleY: 'Elevation (m)',
    });
  };

  addMarker = (lat, lng) => {
    // Adding marker at source to destination
    const latlng = this.createLatLngObject(lat, lng);
    const marker = new google.maps.Marker({
      position: latlng,
      map: this.map,
      icon: this.icon, // icon for A and B point
    });

    this.markerArray.push(marker);
  };

  tAddMarker = (lat, lng) => {
    // Adding marker at source to destination
    const latlng = this.createLatLngObject(lat, lng);
    const marker = new google.maps.Marker({
      position: latlng,
      map: this.map,
      icon: this.icon, // icon for C and D point
    });

    this.telemetryMarkerArray.push(marker);
  };

  createLatLngObject = (latitude, longitude) => new google.maps.LatLng(latitude, longitude);

  renderCTA = () => {
    const { organization, flightPlanOperator, getWaypointsFulfilled } = this.props;
    const UPDATE_FLIGHT_PLAN_PATH = `${this.props.matchUrl}/update`;

    if (!getWaypointsFulfilled) return null;

    if (organization && flightPlanOperator && organization === flightPlanOperator) {
      return <UploadWaypointsCTA to={UPDATE_FLIGHT_PLAN_PATH}>Upload Waypoints</UploadWaypointsCTA>;
    }

    return <PublicWaypointCTAText>No Waypoints</PublicWaypointCTAText>;
  };

  render() {
    const { waypoints = [] } = this.props.waypoints;
    const telemetries = this.props.telemetry || [];
    const hasNoWaypoints = waypoints && waypoints.length === 0;
    const hasNoTelemetry = telemetries && telemetries.length === 0;
    const ctaClassnames = classNames({
      hidden: (waypoints && waypoints.length > 0) || this.props.mode === 'public',
    });

    const shouldShowMap = classNames({
      hidden: (hasNoWaypoints && hasNoTelemetry) || this.props.uploadTelemetryPending,
    });

    return (
      <div>
        <WaypointsCTAWrapper className={ctaClassnames}>{this.renderCTA()}</WaypointsCTAWrapper>
        <MapWrapper className={shouldShowMap} id="flight-plan-map" />
        <div className={shouldShowMap} id="elevation-chart" />
      </div>
    );
  }
}

Map.propTypes = {
  getWaypointsFulfilled: PropTypes.bool,
  getTelemetryFulfilled: PropTypes.bool,
  uploadTelemetryPending: PropTypes.bool,
  waypoints: PropTypes.object,
  telemetry: PropTypes.array,
  matchUrl: PropTypes.string.isRequired,
  organization: PropTypes.string,
  mode: PropTypes.oneOf(['public', 'private']),
  flightPlanOperator: PropTypes.string,
};

export default Map;
