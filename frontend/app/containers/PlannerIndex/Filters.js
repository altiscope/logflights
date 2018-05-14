import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { DatePicker, Select, Button, Icon } from 'antd';
import moment from 'moment';
import { FilterWrapper } from './styles';

const { RangePicker } = DatePicker;
const { Option } = Select;

class Filters extends PureComponent {
  state = {
    dateFilter: {
      date_start: '',
      date_end: '',
    },
    operatorId: 'placeholder',
  };

  onChangeDateFilters = (date, dateString) => {
    this.setState({
      dateFilter: {
        date_start: dateString[0],
        date_end: dateString[1],
      },
    });
  };

  onChangeOperatorFilter = (operatorId) => {
    this.setState({ operatorId });
  };

  searchFlights = () => {
    let { operatorId } = this.state;

    // clear the value if it is placeholder
    operatorId = operatorId === 'placeholder' ? '' : operatorId;
    this.props.getFlights({ ...this.state.dateFilter, operator_id: operatorId });
  };

  resetFilters = () => {
    // reset state
    this.setState({
      operatorId: 'placeholder',
      dateFilter: {
        date_start: '',
        date_end: '',
      },
    });

    // reset calendar
    const klass = '.ant-calendar-picker-clear';
    const resetBtn = document.querySelector(klass);

    if (resetBtn) {
      resetBtn.click();
    }

    this.props.getFlights();
  };

  renderOperators = () => {
    const operators = [
      { id: 'placeholder', organization: 'Select Operator' },
      ...this.props.operators,
    ];

    return operators.map((o) => (
      <Option key={String(o.id)} value={String(o.id)}>
        {o.organization}
      </Option>
    ));
  };

  render() {
    return (
      <FilterWrapper>
        <Select
          style={{ width: 180 }}
          showSearch
          onChange={this.onChangeOperatorFilter}
          placeholder="Select Operator"
          defaultValue="placeholder"
          value={this.state.operatorId}
        >
          {this.renderOperators()}
        </Select>
        <RangePicker
          onChange={this.onChangeDateFilters}
          showTime={{
            hideDisabledOptions: true,
            defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('11:59:59', 'HH:mm:ss')],
          }}
          format="YYYY-MM-DD"
        />
        <Button type="primary" onClick={this.searchFlights}>
          <Icon type="search" /> Search
        </Button>
        <Button onClick={this.resetFilters}>
          <Icon type="close" /> Reset
        </Button>
      </FilterWrapper>
    );
  }
}

Filters.propTypes = {
  operators: PropTypes.array,
  getFlights: PropTypes.func.isRequired,
};

export default Filters;
