/*
 *
 * VehicleList Filters
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Radio } from 'antd';
import FiltersRadioGroup from 'components/FiltersRadioGroup';

const RadioButton = Radio.Button;

function Filters({ onFilterChange, vehiclesFilter }) {
  const handleChange = (e) => onFilterChange(e.target.value);

  return (
    <FiltersRadioGroup onChange={handleChange} value={vehiclesFilter}>
      <RadioButton value="active">Active</RadioButton>
      <RadioButton value="inactive">Inactive</RadioButton>
    </FiltersRadioGroup>
  );
}

Filters.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
  vehiclesFilter: PropTypes.string,
};

export default Filters;
