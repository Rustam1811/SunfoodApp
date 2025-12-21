/**
 * Error Boundary - Graceful Error Handling
 * 
 * Catches React errors and shows a recovery UI.
 * 
 * @module components/ErrorBoundary
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/today';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-tr-base flex flex-col items-center justify-center px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-tr-error/15 flex items-center justify-center mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-tr-error" />
          </div>
          
          <h1 className="text-xl font-semibold text-tr-text mb-2">
            Что-то пошло не так
          </h1>
          <p className="text-tr-text-secondary text-sm max-w-xs mb-6">
            Произошла непредвиденная ошибка. Попробуйте обновить страницу.
          </p>
          
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-tr-accent text-white font-medium"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Обновить
          </button>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre className="mt-8 p-4 bg-tr-elevated rounded-xl text-left text-xs text-tr-text-muted overflow-auto max-w-full max-h-40">
              {this.state.error.message}
              {'\n\n'}
              {this.state.error.stack}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
