/* eslint-disable import/prefer-default-export */
import React, { useContext } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { Button } from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';

import { shouldUpgradeUserEnrollment } from '../data/utils';

/**
 * Exports a number of UI components that represent the correct enroll button behavior for each
 * scenario supported. Use the correct one based on the scenario.
 */

// Start Internal code (do not export)
const enrollLinkClass = 'btn-block';

const EnrollButtonWrapper = ({
  as: Component,
  children,
  ...props
}) => (
  <div className="enroll-wrapper" style={{ width: 270 }}>
    <Component {...props}>
      {children}
    </Component>
  </div>
);

EnrollButtonWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  as: PropTypes.elementType,
};

EnrollButtonWrapper.defaultProps = {
  as: Button,
};

const EnrollButtonCta = (EnrollLabel, props) => (
  <EnrollButtonWrapper {...props}>
    <EnrollLabel />
  </EnrollButtonWrapper>
);
// End internal code

// Exported components

// Disabled enroll
const EnrollBtnDisabled = ({ enrollLabel }) => (
  <EnrollButtonCta
    enrollLabel={enrollLabel}
    as="div"
    className="btn btn-light btn-block disabled"
  />
);

EnrollBtnDisabled.propTypes = {
  enrollLabel: PropTypes.shape.isRequired,
};

// Data sharing consent
const ToDataSharingConsentPage = ({ enrollLabel, enrollmentUrl }) => (
  <EnrollButtonCta
    enrollLabel={enrollLabel}
    as="a"
    className={classNames('btn btn-primary btn-brand-primary', enrollLinkClass)}
    href={enrollmentUrl}
  />
);

ToDataSharingConsentPage.propTypes = {
  enrollLabel: PropTypes.shape.isRequired,
  enrollmentUrl: PropTypes.string.isRequired,
};

// Courseware page
const ToCoursewarePage = ({
  enrollLabel, enrollmentUrl, courseKey, userEnrollment, subscriptionLicense,
}) => {
  const { config } = useContext(AppContext);
  const determineLandingUrlForCourseware = () => {
    const courseInfoUrl = `${config.LMS_BASE_URL}/courses/${courseKey}/info`;
    const shouldUseEnrollmentUrl = shouldUpgradeUserEnrollment({
      userEnrollment,
      subscriptionLicense,
      enrollmentUrl,
    });
    const landingUrl = shouldUseEnrollmentUrl ? enrollmentUrl : courseInfoUrl;
    return landingUrl;
  };

  return (
    <EnrollButtonCta
      enrollLabel={enrollLabel}
      className={classNames(enrollLinkClass, 'btn-brand-primary')}
      href={determineLandingUrlForCourseware()}
    />
  );
};

ToCoursewarePage.propTypes = {
  enrollLabel: PropTypes.shape.isRequired,
  enrollmentUrl: PropTypes.string.isRequired,
  courseKey: PropTypes.string.isRequired,
  userEnrollment: PropTypes.shape.isRequired,
  subscriptionLicense: PropTypes.shape.isRequired,
};

// view on dashboard
const ViewOnDashboard = ({ enrollLabel }) => {
  const { enterpriseConfig } = useContext(AppContext);
  return (
    <EnrollButtonCta
      enrollLabel={enrollLabel}
      as={Link}
      className={classNames('btn btn-primary btn-brand-primary', enrollLinkClass)}
      to={`/${enterpriseConfig.slug}`}
    />
  );
};

ViewOnDashboard.propTypes = {
  enrollLabel: PropTypes.shape.isRequired,
};

export {
  EnrollBtnDisabled,
  ToDataSharingConsentPage,
  ToCoursewarePage,
  ViewOnDashboard,
};
