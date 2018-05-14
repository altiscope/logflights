import React from 'react';
import EditableTable from 'components/EditableTable';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import 'sanitize.css/sanitize.css';
import '../node_modules/antd/dist/antd.min.css';

storiesOf('Components', module).add('Editable Table', () => (
  <EditableTable
    data={[
      {
        order: '1',
        latitude: '-7.945337',
        longitude: '-74.842300',
        altitude: '3000',
      },
      {
        order: '2',
        latitude: '-2.945337',
        longitude: '-34.842300',
        altitude: '5000',
      },
    ]}
    columns={[
      {
        Header: 'sNo.',
        accessor: 'order',
        isEditable: false,
        width: 50,
      },
      {
        Header: 'Latitude',
        accessor: 'latitude',
        isEditable: true,
        width: 110,
        validator: ({ value }) => {
          if (/^-?\d+(\.\d+)?$/.test(value)) return '';
          return 'Please enter a valid latitude value, e.g., -44.9203';
        },
      },
      {
        Header: 'Altitude',
        accessor: 'altitude_relative',
        isEditable: true,
        width: 75,
        validator: ({ value }) => {
          if (/^\d+$/.test(value)) return '';
          return 'Please enter a valid altitude value, e.g., 1000';
        },
      },
    ]}
    onAddItem={action('onAddItem')}
    onRemoveItem={action('onRemoveItem')}
    onItemChange={action('onItemChange')}
  />
));
