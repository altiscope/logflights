import styled from 'styled-components';
import { Row } from 'antd';

export const FilterWrapper = styled(Row).attrs({
  type: 'flex',
  justify: 'flex-end',
})`
  padding: 12px 0 12px;
  > *:not(:last-child) {
    margin-right: 10px;
  }
`;
