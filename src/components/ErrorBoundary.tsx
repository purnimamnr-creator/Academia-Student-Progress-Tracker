import * as React from 'react';
import { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Error is handled by state and displayed in UI
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong. Please try again later.";
      let isFirestoreError = false;

      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.operationType) {
            isFirestoreError = true;
            errorMessage = `Database Error: ${parsed.error} (${parsed.operationType} on ${parsed.path})`;
          }
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="max-w-md w-full bg-white rounded-[32px] p-8 shadow-xl border border-slate-100 text-center">
            <div className="bg-rose-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-rose-500" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Oops! An error occurred</h2>
            <p className="text-slate-500 mb-8 text-sm leading-relaxed">
              {errorMessage}
            </p>
            <Button 
              onClick={this.handleReset}
              className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reload Application
            </Button>
            {isFirestoreError && (
              <p className="mt-4 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                Firestore Permission Error
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
