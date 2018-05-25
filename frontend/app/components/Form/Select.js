/**
 * Wrapper for react-select
 * https://github.com/JedWatson/react-select/
 */
import React from 'react';
import ReactSelect from 'react-select';
import Color from './Color';

// Reference of the default styles:
// https://github.com/JedWatson/react-select/blob/v2/src/styles.js
const selectStyles = {
  //   option: (base, state) => ({
  //     ...base,
  //     borderBottom: '1px dotted pink',
  //     color: state.isFullscreen ? 'red' : 'blue',
  //     padding: 20,
  //   }),
  control: (base, state) => {
    let borderColor = Color.SLATE;
    if (state.selectProps.hasError) {
      borderColor = Color.ERROR;
    } else if (state.isFocused) {
      borderColor = Color.SKY_BLUE;
    }
    return {
      ...base,
      boxShadow: 'none',
      borderWidth: state.isDisabled ? 0 : 1,
      borderStyle: 'solid',
      borderColor,
      backgroundColor: state.isDisabled ? Color.slate(0.2) : Color.CLOUD_WHITE,
      // Remove default hover style
      '&:hover': {},
      '&:focus': {
        borderColor,
      },
    };
  },
  menu: (base, state) => {
    let borderColor = Color.SKY_BLUE;
    if (state.selectProps.hasError) {
      borderColor = Color.ERROR;
    }
    return {
      ...base,
      borderRadius: 4,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor,
      '&:hover': {
        borderColor,
      },
    };
  },
  dropdownIndicator: (base, state) => {
    let color = Color.HINT;
    if (state.isDisabled) {
      color = Color.HINT;
    } else if (state.selectProps.hasError) {
      color = Color.ERROR;
    }
    return {
      ...base,
      color,
    };
  },
  // Hide/disable indicator separator bar
  indicatorSeparator: () => ({}),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: '10px 14px',
    fontSize: '16px',
    letterSpacing: '-0.1px',
    lineHeight: '29px',
    color: Color.PRIMARY,
  }),
  placeholder: (base) => ({
    ...base,
    margin: 0,
    padding: '10px 14px',
    fontSize: '16px',
    letterSpacing: '-0.1px',
    lineHeight: '29px',
    color: Color.HINT,
  }),
};
export default (props) => <ReactSelect styles={selectStyles} {...props} />;
