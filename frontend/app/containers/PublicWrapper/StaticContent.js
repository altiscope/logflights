/**
 *
 * PublicWrapper
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import termsOfServiceContent from 'static/terms-of-service.md';
import privacyPolicyContent from 'static/privacy-policy.md';
import { PublicLayout, PublicHeader, Logo, ContentArea, MainContent } from './styles';

export const StaticContent = ({ children }) => (
  <PublicLayout>
    <PublicHeader>
      <Logo>
        <Link to="/planner">log.flights</Link>
      </Logo>
    </PublicHeader>
    <ContentArea>
      <MainContent>{children}</MainContent>
    </ContentArea>
  </PublicLayout>
);

StaticContent.propTypes = {
  children: PropTypes.node,
};

export const TermsOfService = () => (
  <StaticContent>
    <div dangerouslySetInnerHTML={{ __html: termsOfServiceContent }} />
  </StaticContent>
);
export const PrivacyPolicy = () => (
  <StaticContent>
    <div dangerouslySetInnerHTML={{ __html: privacyPolicyContent }} />
  </StaticContent>
);
