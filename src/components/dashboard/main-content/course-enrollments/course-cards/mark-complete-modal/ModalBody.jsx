import React, { useContext } from 'react';

import ModalError from './ModalError';
import MarkCompleteModalContext from './MarkCompleteModalContext';

const ModalBody = () => {
  const {
    confirmError,
    courseLink,
    courseTitle,
  } = useContext(MarkCompleteModalContext);
  return (
    <>
      {confirmError && <ModalError />}
      <p className="m-0">
        Are you sure you want to archive this course
        {' '}
        <a href={courseLink}>{courseTitle}</a>?
        {' '}
        You will remain enrolled, but the course will
        no longer appear as &quot;In Progress&quot;. As long as
        your license is valid, you can resume the course
        by clicking &quot;Continue Learning&quot; under your list
        of archived courses
      </p>
    </>
  );
};

export default ModalBody;
