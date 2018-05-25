import styled from 'styled-components';
import Color from './Color';

const boxShadow = '0px 2px 16px 0 rgba(0, 0, 0, 0.12)';

export default styled.div`
  border-width: 1px;
  border-style: solid;
  border-color: ${Color.slate(0.5)};
  border-radius: 4px;
  box-shadow: ${(props) => (props.boxShadow ? boxShadow : 'none')};
  padding: 24px 16px;
  @media (max-width: 575px) {
    padding: 32px 24px;
  }
  @media (max-width: 767px) {
    padding: 24px 24px;
  }
  @media (max-width: 991px) {
    padding: 24px 16px;
  }
`;
