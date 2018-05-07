/*
 *
 * FlightPlanDetails Styles
 *
 */

import styled from 'styled-components';
import { Card } from 'antd';
import { Link } from 'react-router-dom';

export const CardContent = styled.div`
  padding: 10px 16px;
`;

export const FlightInfoWrapper = styled(Card)`
  margin: 16px 0 0;
  min-width: 300px;
  padding: 0;
  border: 0;
  &:hover {
    border-color: #fff;
    box-shadow: none!important;
  };

  > .ant-card-body {
    padding: 0;
  };
`;

export const Info = styled.div`
  padding: 6px 0;
`;

export const MapWrapper = styled.div`
  margin: 24px 0;
  min-height: 500px;
`;

export const WaypointsCTAWrapper = styled.div`
  padding: 16px;
  text-align: center;
`;

export const UploadWaypointsCTA = styled(Link)`
  font-size: 2em;
`;

export const PublicWaypointCTAText = styled.p`
  font-size: 2em;
`;

export const WaypointGridWrapper = styled.div`
  margin-top: 24px;
`;
