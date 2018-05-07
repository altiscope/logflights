/*
 *
 * FlightPlanList Filters
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Radio } from 'antd';
import FiltersRadioGroup from 'components/FiltersRadioGroup';

const RadioButton = Radio.Button;

function Filters({ onFilterChange, flightPlansFilter }) {
  const handleChange = (e) => onFilterChange(e.target.value);

  return (
    <FiltersRadioGroup onChange={handleChange} value={flightPlansFilter}>
      <RadioButton value="active">Active</RadioButton>
      <RadioButton value="invalid">Invalidated</RadioButton>
    </FiltersRadioGroup>
  );
}

Filters.propTypes = {
  onFilterChange: PropTypes.func,
  flightPlansFilter: PropTypes.string,
};

export default Filters;
