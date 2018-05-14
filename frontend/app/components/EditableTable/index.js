import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Button } from 'antd';
import { compose, withProps } from 'recompose';
import EditableCell from './EditableCell';

const EditableTable = (props) => {
  const { data, columns, onItemChange } = props;
  return (
    <div>
      <table>
        <thead>
          <tr>
            {columns.map(({ id, width, Header }) => (
              <th key={id} style={{ width }}>
                {Header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.id}>
              {columns.map((column) => {
                const { id, accessor, Cell } = column;

                const cellProps = {
                  cellInfo: {
                    column,
                    index,
                    row: item,
                    value: item[accessor],
                  },
                  onItemChange,
                };
                return (
                  <td key={id} style={{ width: column.width }}>
                    {Cell ? <Cell {...cellProps} /> : item[accessor]}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

EditableTable.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  onItemChange: PropTypes.func.isRequired,
};

const withColumns = withProps(({ columns, onAddItem, onRemoveItem }) => {
  const editableColumns = columns.map((column) => ({
    ...column,
    Cell: column.isEditable ? EditableCell : undefined,
  }));

  editableColumns.push({
    id: 'actions',
    // eslint-disable-next-line
    Cell: ({ cellInfo: { index } }) => (
      <div>
        <Button
          tabIndex={-1}
          onClick={() => onAddItem(index)}
          size="small"
          style={{ marginLeft: 5 }}
        >
          <Icon type="plus-circle-o" />Above
        </Button>
        <Button
          tabIndex={-1}
          onClick={() => onAddItem(index + 1)}
          size="small"
          style={{ marginLeft: 5 }}
        >
          <Icon type="plus-circle-o" />Below
        </Button>
        <Button
          tabIndex={-1}
          onClick={() => onRemoveItem(index)}
          size="small"
          style={{ marginLeft: 5 }}
        >
          <Icon type="delete" />
        </Button>
      </div>
    ),
  });

  return {
    columns: editableColumns,
  };
});

export default compose(withColumns)(EditableTable);
