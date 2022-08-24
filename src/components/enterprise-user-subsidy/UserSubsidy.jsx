import React, {
  createContext, useContext, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';
import { Container } from '@edx/paragon';

import { LoadingSpinner } from '../loading-spinner';

import {
  useCatalogData, useLearningPathData,
} from './data/hooks';
import { LOADING_SCREEN_READER_TEXT } from './data/constants';

export const UserSubsidyContext = createContext();

const UserSubsidy = ({ children }) => {
  const { enterpriseConfig } = useContext(AppContext);
  const [catalogData, isLoadingCatalogData] = useCatalogData(enterpriseConfig.uuid);
  const [learningPathData, isLoadingLearningPathdata] = useLearningPathData();

  const isLoading = isLoadingCatalogData || isLoadingLearningPathdata;

  const contextValue = useMemo(
    () => {
      if (isLoading) {
        return {};
      }
      return {
        catalogData,
        learningPathData,
      };
    },
    [
      isLoading,
      enterpriseConfig.uuid,
      catalogData,
      learningPathData,
    ],
  );

  if (isLoading) {
    return (
      <Container className="py-5">
        <LoadingSpinner screenReaderText={LOADING_SCREEN_READER_TEXT} />
      </Container>
    );
  }
  return (
    <>
      {/* Render the children so the rest of the page shows */}
      <UserSubsidyContext.Provider value={contextValue}>
        {children}
      </UserSubsidyContext.Provider>
    </>
  );
};

UserSubsidy.propTypes = {
  children: PropTypes.node.isRequired,
};

export default UserSubsidy;
