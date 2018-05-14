import * as React from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'antd';

class EditableCell extends React.Component {
  state = {
    hasFocus: false,
  };
  render() {
    const { cellInfo, onItemChange } = this.props;
    const { column, row, value, index } = cellInfo;

    const { hasFocus } = this.state;
    const validationError = column.validator && column.validator(cellInfo);
    const hasError = validationError !== '';

    let border;
    if (hasError) {
      border = '1px solid #ff0000';
    } else if (hasFocus) {
      border = '1px solid #0000ff';
    } else {
      border = '1px solid #eeeeee';
    }

    return (
      <Tooltip placement="top" visible={hasFocus && hasError} title={validationError}>
        <div
          style={{
            backgroundColor: hasError ? '#ffcccc' : '#fff',
            border,
            lineHeight: 2.0,
          }}
        >
          <input
            type="text"
            onBlur={() => this.setState({ hasFocus: false })}
            onFocus={() => this.setState({ hasFocus: true })}
            onChange={(e) => {
              const newValue = e.target.value;

              if (value === newValue) {
                // The value did not change.
                return;
              }

              const newItem = {
                ...row,
                [column.accessor]: newValue,
              };
              onItemChange(index, newItem);
            }}
            style={{ width: '100%' }}
            value={value}
          />
        </div>
      </Tooltip>
    );
  }
}

EditableCell.propTypes = {
  cellInfo: PropTypes.object.isRequired,
  onItemChange: PropTypes.func.isRequired,
};
export default EditableCell;
