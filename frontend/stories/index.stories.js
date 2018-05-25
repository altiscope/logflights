import React from 'react';
import EditableTable from 'components/EditableTable';
import { Input, Label, Select, Checkbox, Radio, Button, Card } from 'components/Form';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

const selectOptions = [
  { value: 10, label: 'Ten' },
  { value: 20, label: 'Twenty' },
  { value: 30, label: 'Thirty' },
];

storiesOf('UI', module).add('Kitchen Sink', () => (
  <div>
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <div style={{ padding: 10 }}>
        <div>
          <Label for="select" title="Select">
            Select
          </Label>
        </div>
        <div style={{ width: 250 }}>
          <Select options={selectOptions} />
        </div>
      </div>
      <div style={{ padding: 10 }}>
        <div>
          <Label for="select" title="Select">
            Select with error
          </Label>
        </div>
        <div style={{ width: 250 }}>
          <Select options={selectOptions} hasError />
        </div>
      </div>
      <div style={{ padding: 10 }}>
        <div>
          <Label for="select" title="Select">
            Select with disabled
          </Label>
        </div>
        <div style={{ width: 250 }}>
          <Select isDisabled options={selectOptions} hasError />
        </div>
      </div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <div style={{ padding: 10, width: 250 }}>
        <div>
          <Label for="example_a" title="Example A">
            Default, typing and focused:
          </Label>
        </div>
        <Input id="example_a" value="Example A" style={{ width: 220 }} />
      </div>
      <div style={{ padding: 10 }}>
        <div>
          <Label for="example_b" title="Example B">
            Error:
          </Label>
        </div>
        <Input value="Example B" hasError style={{ width: 220 }} />
      </div>
      <div style={{ padding: 10 }}>
        <div>
          <Label for="example_c" title="Example C">
            Disabled:
          </Label>
        </div>
        <Input value="Example C" disabled style={{ width: 220 }} />
      </div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 10 }}>
          <Checkbox name="SomeThing" checked={false}>
            Test
          </Checkbox>
        </div>
        <div style={{ padding: 10 }}>
          <Checkbox name="SomeThing" checked>
            Test
          </Checkbox>
        </div>
        <div style={{ padding: 10 }}>
          <Checkbox name="SomeThing" disabled>
            Test
          </Checkbox>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 10 }}>
          <Radio name="radio" checked>
            Test
          </Radio>
        </div>
        <div style={{ padding: 10 }}>
          <Radio name="radio">Test</Radio>
        </div>
        <div style={{ padding: 10 }}>
          <Radio name="radio" disabled>
            Test
          </Radio>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 10 }}>
          <Button>SIGN UP</Button>
        </div>
        <div style={{ padding: 10 }}>
          <Button disabled>SIGN UP</Button>
        </div>
        <div style={{ padding: 10 }}>
          <Button type="secondary">SIGN UP</Button>
        </div>
        <div style={{ padding: 10 }}>
          <Button type="secondary" disabled>
            SIGN UP
          </Button>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 10 }}>
          <Card>SIGN UP</Card>
        </div>
        <div style={{ padding: 10 }}>
          <Card boxShadow>SIGN UP</Card>
        </div>
      </div>
    </div>
  </div>
));
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
