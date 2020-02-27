import React from 'react';
import PropTypes from 'prop-types';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { AppContext } from '@edx/frontend-platform/react';

import { LoadingSpinner } from '../loading-spinner';
import NotFoundPage from '../NotFoundPage';

import { useEnterpriseCustomerConfig } from './data/hooks';

export default function EnterprisePage({ children }) {
  const [enterpriseConfig] = useEnterpriseCustomerConfig();

  const user = getAuthenticatedUser();
  const { username } = user;

  // We explicitly set enterpriseConfig to null if there is no configuration, the learner portal is
  // not enabled, or there was an error fetching the configuration. In all these cases, we want to 404.
  if (enterpriseConfig === null) {
    return <NotFoundPage />;
  }

  if (!enterpriseConfig || !enterpriseConfig.name) {
    return (
      <div className="py-5">
        <LoadingSpinner screenReaderText="loading company details" />
      </div>
    );
  }

  return (
    <AppContext.Provider
      value={{
        header: {
          mainMenu: [
            {
              type: 'item',
              href: process.env.CATALOG_BASE_URL,
              content: 'Catalog',
            },
            {
              type: 'item',
              href: 'https://support.edx.org/hc/en-us',
              content: 'Help',
            },
          ],
          userMenu: [
            {
              type: 'item',
              href: process.env.LMS_BASE_URL,
              content: 'Dashboard',
            },
            {
              type: 'item',
              href: `${process.env.LMS_BASE_URL}/u/${username}`,
              content: 'My Profile',
            },
            {
              type: 'item',
              href: `${process.env.LMS_BASE_URL}/account/settings`,
              content: 'Account Settings',
            },
            {
              type: 'item',
              href: process.env.ORDER_HISTORY_URL,
              content: 'Order History',
            },
            {
              type: 'item',
              href: 'https://support.edx.org/hc/en-us',
              content: 'Help',
            },
            {
              type: 'item',
              href: process.env.LOGOUT_URL,
              content: 'Sign Out',
            },
          ],
        },
        courseCards: {
          'in-progress': {
            settingsMenu: {
              hasMarkComplete: true,
            },
          },
        },
        enterpriseConfig,
      }}
    >
      {children(enterpriseConfig)}
    </AppContext.Provider>
  );
}

EnterprisePage.propTypes = {
  children: PropTypes.node.isRequired,
};
