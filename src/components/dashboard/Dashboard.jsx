import React, {
  useContext, useEffect, useState, useCallback, useMemo,
} from 'react';
import { Helmet } from 'react-helmet';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Container, Row, Col, Pagination, TransitionReplace, Button, Hyperlink, Toast, Spinner,
} from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';
import PropTypes from 'prop-types';
import { CourseCard, CourseDetails } from '@reustleco/dojo-frontend-common';

import emptyStateImage from '../../assets/images/empty-state.svg';
import noResultsImage from '../../assets/images/no-results.svg';

import DashboardPanel from './DashboardPanel';
import DashboardDrawer from './DashboardDrawer';
import { UserSubsidyContext } from '../enterprise-user-subsidy';
import { Filter, ActiveFilter } from '../filter/Filter';
import {
  Alarm,
  Baseline,
  Certificate,
  Checklist,
  Dash,
  World,
} from './data/svg';

import { languageCodeToLabel } from '../../utils/common';

function EmptyState({ title, text, image = emptyStateImage }) {
  return (
    <div className="dashboard-empty-state">
      {image && <img src={image} alt="" />}
      {title && (
        <h3 className="dashboard-empty-state-title">
          {title}
        </h3>
      )}
      {text && (
        <p className="dashboard-empty-state-text">
          {text}
        </p>
      )}
    </div>
  );
}

EmptyState.propTypes = {
  title: PropTypes.string,
  text: PropTypes.node,
  image: PropTypes.string,
};

EmptyState.defaultProps = {
  title: '',
  text: null,
  image: emptyStateImage,
};

const COURSES_PER_CATALOG_PAGE = 12;

export default function Dashboard() {
  const {
    enterpriseConfig: {
      name,
    },
    authenticatedUser,
  } = useContext(AppContext);
  const { state } = useLocation();
  const history = useHistory();
  const {
    learningPathData: {
      learning_path_name: learningPathName, kickoff_survey: kickoffSurvey, courses, count = 0,
    },
    catalog: { data: { courses_metadata: catalogCourses }, filter, requestCourse },
  } = useContext(UserSubsidyContext);

  const catalogPageCount = Math.ceil(catalogCourses.length / COURSES_PER_CATALOG_PAGE);
  const [activeCatalogPage, setActiveCatalogPage] = useState(1);
  const catalogCoursesOnActivePage = catalogCourses?.slice(
    (activeCatalogPage - 1) * COURSES_PER_CATALOG_PAGE,
    (activeCatalogPage - 1) * COURSES_PER_CATALOG_PAGE + COURSES_PER_CATALOG_PAGE,
  ) ?? [];
  const [activeCourseId, setActiveCourse] = useState(null);
  const [toastBody, setToastBody] = useState(null);
  const [isLoading, setLoading] = useState(false);

  const activeCourse = useMemo(() => {
    if (!activeCourseId) { return null; }
    return [...courses || [], ...catalogCourses || []].find(course => course.id === activeCourseId);
  }, [activeCourseId, courses, catalogCourses]);

  useEffect(() => {
    if (state?.activationSuccess) {
      const updatedLocationState = { ...state };
      delete updatedLocationState.activationSuccess;
      history.replace({
        ...history.location,
        state: updatedLocationState,
      });
    }
  }, []);

  useEffect(() => {
    setActiveCatalogPage(1);
  }, [filter.current]);

  const userFirstName = authenticatedUser?.name.split(' ').shift();
  const onDrawerClose = () => setActiveCourse(null);

  const getCourseCTAButton = useCallback(() => {
    if (!activeCourse) { return null; }
    if (activeCourse.edx_course_id && activeCourse.course_link) {
      return {
        type: 'primary',
        text: 'Start course',
        onClick: () => window.open(activeCourse.course_link),
      };
    }
    if (activeCourse.in_learning_path) {
      return {
        type: 'primary',
        text: 'Start learning survey',
        onClick: () => window.open(kickoffSurvey),
      };
    }
    if (activeCourse.user_requested_access) {
      return {
        type: 'primary',
        text: 'Access requested',
        onClick: () => {
          setToastBody(
            <>
              <span className="d-block h5 mb-2 text-white">
                We&apos;re working on it!
              </span>
              We have received your request and are working on preparing this course for you,
              feel free to reach out to us on #dojo&#8209;platform&#8209;support
            </>,
          );
        },
      };
    }
    return {
      type: 'primary',
      text: isLoading ? <Spinner animation="border" /> : 'Request access',
      onClick: async () => {
        try {
          setLoading(true);
          await requestCourse(activeCourse.id);
          setToastBody(
            <>
              <span className="d-block h5 mb-2 text-white">
                Thanks for reaching out. Dojo staff will contact you soon!
              </span>
              Meanwhile, if you have any questions, feel free to reach out to us on
              #dojo&#8209;platform&#8209;support
            </>,
          );
        } catch {
          setToastBody(
            <>
              <span className="d-block h5 mb-2 text-white">
                Unexpected error
              </span>
              An error occurred when requesting access, feel free to reach out to us on
              #dojo&#8209;platform&#8209;support
            </>,
          );
        } finally {
          setLoading(false);
        }
      },
    };
  }, [activeCourse, isLoading]);

  return (
    <>
      <Helmet title={`Dashboard - ${name}`} />
      <Container size="lg" className="py-5">
        <Row className="align-items-center mb-4">
          <Col sm={6}>
            <h2 className="h2 pb-1.5">
              {userFirstName ? `Welcome, ${userFirstName}!` : 'Welcome!'}
            </h2>
            <p className="dashboard-welcome-subtitle">Today is a great day for education.</p>
          </Col>
          <Col sm={6} className="text-center text-md-right">
            {kickoffSurvey && (
              <Button
                as={Hyperlink}
                target="_blank"
                showLaunchIcon={false}
                destination={kickoffSurvey}
                variant="primary"
              >Start learning survey
              </Button>
            )}
          </Col>
        </Row>
        <DashboardPanel
          title="My learning path"
          subtitle={learningPathName}
          id="learning-path"
          headerAside={(
            <div>
              <div className="small text-dark-400">
                Available for kick-off
              </div>
              <div className="h4">
                {count} {count === 1 ? 'course' : 'courses'}
              </div>
            </div>
          )}
        >
          {count === 0
            ? (
              <EmptyState
                title="You don't have a course in Learning path yet"
                text="Check out our complete course catalog for courses that might interest you"
              />
            )
            : (
              <Row data-testid="learningPath" className="dashboard-coursecard-grid">
                {courses?.map((course) => (
                  <Col xs={12} md={6} lg={4} key={course.id}>
                    <CourseCard
                      active={activeCourse?.id === course.id}
                      title={course.title}
                      hours={course.hours_required}
                      languages={[course.primary_language].map(languageCodeToLabel)}
                      skills={[course.difficulty_level]}
                      bgKey={course.id % 10}
                      onClick={() => setActiveCourse(course.id)}
                    />
                  </Col>
                ))}
              </Row>
            )}
        </DashboardPanel>
        <DashboardPanel
          title="Course catalog"
          id="course-catalog"
        >
          <hr />
          <Row>
            <Col lg={8} data-testid="courseCatalog">
              <ActiveFilter filter={filter} />
              {catalogCoursesOnActivePage.length === 0 && (
                <EmptyState
                  image={noResultsImage}
                  title="Can't find what you're looking for?"
                  text={<>Get in touch with us at #dojo-help or <a href="mailto:dojo@woven-planet.global">dojo@woven-planet.global</a></>}
                />
              )}
              <div className="dashboard-catalog-wrap">
                <TransitionReplace>
                  <Row key={activeCatalogPage} className="dashboard-catalog-page dashboard-coursecard-grid">
                    {catalogCoursesOnActivePage.map((course) => (
                      <Col xs={12} md={6} key={course.id}>
                        <CourseCard
                          key={course.id}
                          title={course.title}
                          hours={course.hours_required}
                          languages={[course.primary_language].map(languageCodeToLabel)}
                          skills={[course.difficulty_level]}
                          bgKey={course.id % 10}
                          onClick={() => setActiveCourse(course.id)}
                        />
                      </Col>
                    ))}
                  </Row>
                </TransitionReplace>
                {catalogPageCount > 1 && (
                  <Row>
                    <Col className="d-flex justify-content-center mt-4">
                      <Pagination
                        paginationLabel={`Page ${activeCatalogPage} of ${catalogPageCount}`}
                        pageCount={catalogPageCount}
                        currentPage={activeCatalogPage}
                        onPageSelect={(pageNumber) => setActiveCatalogPage(pageNumber)}
                      />
                    </Col>
                  </Row>
                )}
              </div>
            </Col>
            <Col lg={4}>
              <Filter filter={filter} />
            </Col>
          </Row>
        </DashboardPanel>
        <DashboardDrawer open={activeCourse !== null} onClose={onDrawerClose}>
          { activeCourse && (
            <CourseDetails
              title={activeCourse.title}
              description={activeCourse.full_description}
              details={[
                {
                  key: 'Time investment',
                  value: activeCourse.hours_required && `${activeCourse.hours_required} hours`,
                  icon: <Alarm />,
                },
                {
                  key: 'Certificate',
                  value: activeCourse.has_certificate ? 'Avaliable' : 'Not avaliable',
                  icon: <Certificate />,
                },
                {
                  key: 'Difficulty level',
                  value: activeCourse.difficulty_level,
                  icon: <Dash />,
                },
                {
                  key: 'Primary language',
                  value: languageCodeToLabel(activeCourse.primary_language),
                  icon: <World />,
                },
                {
                  key: 'Subtitles',
                  value: activeCourse.subtitles_available ? 'Available' : 'Not avaliable',
                  icon: <Baseline />,
                },
                {
                  key: 'Prerequisites',
                  value: activeCourse.prerequisites,
                  icon: <Checklist />,
                },
              ].filter(item => !!item.value)}
              buttons={[
                {
                  type: 'outline-primary',
                  text: 'Close',
                  onClick: onDrawerClose,
                },
                getCourseCTAButton(),
              ].filter(Boolean)}
            />
          )}
        </DashboardDrawer>
      </Container>
      <Toast
        onClose={() => setToastBody(null)}
        show={!!toastBody}
      >
        {toastBody || ''}
      </Toast>
    </>
  );
}
