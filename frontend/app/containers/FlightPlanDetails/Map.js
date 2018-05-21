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
import { MapWrapper } from './styles';

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

    this.setState({ mapLoaded: true });
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

  render() {
    const { waypoints = [] } = this.props.waypoints;
    const telemetries = this.props.telemetry || [];
    const hasNoWaypoints = waypoints && waypoints.length === 0;
    const hasNoTelemetry = telemetries && telemetries.length === 0;

    const shouldShowMap = classNames({
      hidden: (hasNoWaypoints && hasNoTelemetry) || this.props.uploadTelemetryPending,
    });

    return (
      <div>
        <MapWrapper className={shouldShowMap} id="flight-plan-map" />
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
};

export default Map;
