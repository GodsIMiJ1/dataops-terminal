
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log('No user found, redirecting to auth page');
        setRedirecting(true);
        
        // Add a slight delay before redirecting to ensure state is updated
        const timeoutId = setTimeout(() => {
          navigate('/auth');
        }, 100);
        
        return () => clearTimeout(timeoutId);
      } else {
        console.log('User authenticated:', user.email);
      }
    } else if (attempts > 5) {
      // If loading is taking too long, redirect to auth page
      console.log('Authentication taking too long, redirecting to auth page');
      setRedirecting(true);
      navigate('/auth');
    }
  }, [user, loading, navigate, attempts]);

  // Increment attempts counter if still loading
  useEffect(() => {
    if (loading) {
      const intervalId = setInterval(() => {
        setAttempts(prev => prev + 1);
      }, 1000);
      
      return () => clearInterval(intervalId);
    }
  }, [loading]);

  if (loading || redirecting) {
    return (
      <div className="min-h-screen bg-cyber-black flex flex-col items-center justify-center">
        <div className="cyber-panel rounded-lg p-6 max-w-md w-full">
          <div className="cyber-scanline"></div>
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-cyber-cyan animate-spin" />
            <div className="text-sm font-mono text-cyber-cyan">
              {loading ? 'Authenticating secure connection...' : 'Redirecting to secure portal...'}
            </div>
            {attempts > 3 && (
              <div className="text-xs font-mono text-cyber-orange mt-2">
                Connection taking longer than expected...
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
