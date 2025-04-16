import { ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  fallbackPath?: string;
}

export function ProtectedRoute({ 
  children, 
  fallbackPath = '/auth' 
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate(fallbackPath);
    }
  }, [user, isLoading, navigate, fallbackPath]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in the useEffect
  }

  return <>{children}</>;
}