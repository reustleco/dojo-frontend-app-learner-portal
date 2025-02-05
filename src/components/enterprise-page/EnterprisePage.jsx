import React from 'react';
import PropTypes from 'prop-types';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { AppContext, ErrorPage } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform/config';
import { Container } from '@edx/paragon';

import { LoadingSpinner } from '../loading-spinner';
import NotFoundPage from '../NotFoundPage';

import { isDefined, isDefinedAndNull } from '../../utils/common';
import { useEnterpriseCustomerConfig } from './data/hooks';

export default function EnterprisePage({ children, useEnterpriseConfigCache }) {
  const enterpriseSlug = window.location.host.split('.')[0];
  const [enterpriseConfig, fetchError] = useEnterpriseCustomerConfig(enterpriseSlug, useEnterpriseConfigCache);
  const config = getConfig();
  const user = getAuthenticatedUser();
  const { profileImage } = user;

  // Render the app as loading while waiting on the configuration or additional user metadata
  if (!isDefined([enterpriseConfig, profileImage])) {
    return (
      <Container className="py-5">
        <LoadingSpinner screenReaderText="loading organization details" />
      </Container>
    );
  }

  if (fetchError) {
    return <ErrorPage message={fetchError.message} />;
  }

  if (isDefinedAndNull(enterpriseConfig)) {
    return <NotFoundPage />;
  }

  return (
    <AppContext.Provider
      value={{
        authenticatedUser: user,
        config,
        enterpriseConfig,
        courseCards: {
          'in-progress': {
            settingsMenu: {
              hasMarkComplete: true,
            },
          },
        },
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

EnterprisePage.propTypes = {
  children: PropTypes.node.isRequired,
  useEnterpriseConfigCache: PropTypes.bool,
};

EnterprisePage.defaultProps = {
  useEnterpriseConfigCache: true,
};
