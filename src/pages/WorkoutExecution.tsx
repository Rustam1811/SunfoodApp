/**
 * WorkoutExecution - Premium Workout Execution Page
 *
 * Route: /workout/:sessionId
 *
 * This is the page-level wrapper that integrates the premium
 * WorkoutExecutionScreen component with React Router.
 *
 * Features:
 * - Exercise list with progress indicators
 * - Full-screen detail modal on tap
 * - Coach demo video
 * - Client video upload section
 * - Rest timer between sets
 * - Weight/reps logging per set
 *
 * @module pages/WorkoutExecution
 */

import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { WorkoutExecutionScreenV2 } from '../ui/workout';

const WorkoutExecution: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const history = useHistory();

  const handleExit = () => {
    history.replace('/main');
  };

  return (
    <WorkoutExecutionScreenV2
      sessionId={sessionId}
      onExit={handleExit}
    />
  );
};

export default WorkoutExecution;
