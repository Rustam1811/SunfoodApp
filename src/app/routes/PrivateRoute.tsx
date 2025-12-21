import React, { Suspense } from 'react';
import { Route, Redirect, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '../../auth/AuthContextV2';
import { HomeSkeleton } from '../../components/Skeleton';
import { pageVariants } from '../../ui/motion';

interface PrivateRouteProps {
  component: React.ComponentType<any>;
  exact?: boolean;
  path: string;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  component: Component, 
  ...rest 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const prefersReduced = useReducedMotion();

  return (
    <Route
      {...rest}
      render={(props) => {
        if (loading) {
          return <HomeSkeleton />;
        }

        if (!user) {
          return (
            <Redirect 
              to={{ 
                pathname: '/login', 
                state: { redirect: location.pathname } 
              }} 
            />
          );
        }

        return (
          <Suspense fallback={<HomeSkeleton />}>
            <motion.div
              key={location.pathname}
              variants={pageVariants(!!prefersReduced)}
              initial="initial"
              animate="enter"
              exit="exit"
              className="w-full min-h-screen"
            >
              <Component {...props} />
            </motion.div>
          </Suspense>
        );
      }}
    />
  );
};
