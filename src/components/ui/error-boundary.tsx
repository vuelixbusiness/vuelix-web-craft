import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 OAuth/Auth Error Boundary caught an error:', error, errorInfo);
    
    // Log OAuth-specific errors with more context
    if (error.message?.includes('OAuth') || error.message?.includes('auth')) {
      console.error('🔐 Authentication Error Details:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href
      });
    }
  }

  render() {
    if (this.state.hasError) {
      const isAuthError = this.state.error?.message?.includes('OAuth') || 
                         this.state.error?.message?.includes('auth') ||
                         this.state.error?.message?.includes('malformed');

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <CardTitle>
                {isAuthError ? 'Authentication Error' : 'Something went wrong'}
              </CardTitle>
              <CardDescription>
                {isAuthError 
                  ? 'There was a problem with the sign-in process. This might be due to OAuth configuration issues.'
                  : 'An unexpected error occurred. Please try again.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAuthError && (
                <div className="p-3 bg-destructive/10 rounded-lg text-sm">
                  <p className="font-medium text-destructive mb-1">Common causes:</p>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• OAuth provider not properly configured</li>
                    <li>• Redirect URLs don't match</li>
                    <li>• Missing or invalid client credentials</li>
                  </ul>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => window.location.reload()} 
                  className="flex-1"
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button 
                  onClick={() => window.location.href = '/'} 
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground">
                    Developer Details
                  </summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}