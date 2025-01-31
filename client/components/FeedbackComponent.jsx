import React, { useContext } from 'react';
import { Alert } from 'react-bootstrap';
import FeedbackContext from '../contexts/FeedbackContext.mjs';

const FeedbackComponent = () => {
  const { feedback } = useContext(FeedbackContext);

  if (!feedback) return null;

  return (
    <Alert variant="info" className="mt-3">
      {feedback}
    </Alert>
  );
};

export default FeedbackComponent;
