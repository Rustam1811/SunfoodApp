/**
 * WorkoutSession - Page Wrapper for Workout Session
 *
 * Route: /app/workout?plan={planId}&date={date}
 *
 * This page wraps WorkoutSessionScreen and handles routing params.
 *
 * @module pages/WorkoutSession
 */

import React, { useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { WorkoutSessionScreen } from '../ui/workout';

const WorkoutSession: React.FC = () => {
  const history = useHistory();
  const location = useLocation();

  // Parse query params
  const params = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return {
      planId: searchParams.get('plan') || '',
      date: searchParams.get('date') || new Date().toISOString().split('T')[0],
    };
  }, [location.search]);

  const handleComplete = () => {
    history.replace('/main');
  };

  const handleExit = () => {
    history.replace('/main');
  };

  // Validate params
  if (!params.planId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-neutral-950 to-zinc-950 flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-white/60 mb-4">No workout plan specified</p>
          <button
            onClick={handleExit}
            className="px-6 py-3 rounded-xl bg-white/10 text-white font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <WorkoutSessionScreen
      planId={params.planId}
      planDate={params.date}
      onComplete={handleComplete}
      onExit={handleExit}
    />
  );
};

export default WorkoutSession;
