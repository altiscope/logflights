import styled from 'styled-components';
import { AutoComplete } from 'antd';

export const Wrapper = styled.div`
  padding: 12px 12px 12px 0;
`;

export const AutoCompleteStyled = styled(AutoComplete).attrs({
  className: 'certain-category-search',
  dropdownClassName: 'certain-category-search-dropdown',
})`
  .ant-select-selection__placeholder {
    left: 15px;
    right: 0;
  }
  .ant-input {
    border-color: transparent;
    box-shadow: none;
    padding-left: 24px;
    padding-right: 7px;
  }
  .ant-input-suffix {
    left: 7px;
    right: auto;
  }
`;
