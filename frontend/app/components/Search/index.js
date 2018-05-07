import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Input, Icon } from 'antd';
import { Wrapper, AutoCompleteStyled } from './styles';

class Search extends Component {
  static defaultProps = {
    placeholder: 'Search...',
    width: 250,
  }

  render() {
    const { placeholder, width } = this.props;

    return (
      <Wrapper>
        <AutoCompleteStyled
          dropdownMatchSelectWidth={false}
          dropdownStyle={{ width }}
          style={{ width }}
          dataSource={[]}
          placeholder={placeholder}
          optionLabelProp="value"
        >
          <Input suffix={<Icon type="search" className="certain-category-icon" />} />
        </AutoCompleteStyled>
      </Wrapper>
    );
  }
}

Search.propTypes = {
  placeholder: PropTypes.string,
  width: PropTypes.number,
};

export default Search;

