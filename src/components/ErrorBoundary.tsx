import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'An unexpected error occurred.';
      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error) errorMessage = parsed.error;
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-[32px] shadow-xl p-8 text-center border border-slate-100">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-10 w-10 text-rose-500" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Something went wrong</h1>
            <p className="text-slate-500 mb-8 text-sm">
              {errorMessage}
            </p>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => window.location.reload()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 rounded-xl flex items-center justify-center gap-2 font-bold"
              >
                <RefreshCcw className="h-4 w-4" />
                Reload Application
              </Button>
              <Button 
                variant="ghost"
                onClick={() => this.setState({ hasError: false })}
                className="text-slate-500 font-bold hover:text-slate-900"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
