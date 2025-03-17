
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Github, Loader2 } from 'lucide-react';
import GlitchText from '@/components/GlitchText';
import DigitalRain from '@/components/DigitalRain';
import ActionButton from '@/components/ActionButton';
import { toast } from 'sonner';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Handle redirects from GitHub
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const errorDescription = hashParams.get('error_description');
    
    if (errorDescription) {
      console.error('Auth error from hash:', errorDescription);
      toast.error(`Authentication error: ${errorDescription}`);
      setError(errorDescription);
    }

    // Check if user is already signed in
    const checkUser = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error checking session:', error);
          toast.error('Error checking authentication status');
          setError(error.message);
        } else if (data.session) {
          console.log('User already signed in, redirecting to home');
          navigate('/');
        }
      } catch (error) {
        console.error('Exception checking session:', error);
        if (error instanceof Error) {
          setError(error.message);
        }
      } finally {
        setCheckingSession(false);
      }
    };
    
    checkUser();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session ? 'session exists' : 'no session');
        if (event === 'SIGNED_IN' && session) {
          navigate('/');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleGithubLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Initiating GitHub login');
      
      // Set redirect to current origin
      const redirectUrl = `${window.location.origin}/auth`;
      console.log('Using redirect URL:', redirectUrl);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: redirectUrl,
        },
      });
      
      if (error) {
        console.error('GitHub login error:', error);
        toast.error('Failed to sign in with GitHub');
        setError(error.message);
        setLoading(false);
      }
    } catch (error) {
      console.error('Exception during GitHub sign in:', error);
      toast.error('Failed to sign in with GitHub');
      if (error instanceof Error) {
        setError(error.message);
      }
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-cyber-black flex flex-col items-center justify-center">
        <div className="cyber-panel rounded-lg p-6 max-w-md w-full">
          <div className="cyber-scanline"></div>
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-cyber-cyan animate-spin" />
            <div className="text-sm font-mono text-cyber-cyan">
              Checking authentication status...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-black text-white relative overflow-hidden">
      {/* Matrix background */}
      <DigitalRain />
      
      {/* Digital noise overlay */}
      <div className="digital-noise"></div>
      
      <div className="container mx-auto py-8 h-screen flex items-center justify-center">
        <div className="cyber-panel p-8 max-w-md w-full rounded-lg">
          <div className="cyber-scanline"></div>
          
          <div className="flex flex-col items-center gap-6">
            <GlitchText text="R3B3L 4F" className="text-3xl font-bold text-cyber-red" intense />
            
            <div className="text-center mb-4">
              <p className="font-mono text-sm mb-6">
                AUTHENTICATION REQUIRED: Access to secure terminal
              </p>
              
              {error && (
                <div className="cyber-alert bg-red-900/50 border border-red-500 p-3 mb-4 text-sm font-mono text-red-300">
                  ERROR: {error}
                </div>
              )}
              
              <div className="cyber-alert flex items-center gap-2 text-sm mb-6">
                <div className="font-mono">
                  <span className="text-cyber-cyan">SECURE CONNECTION</span>
                  <span> - Auth endpoint active.</span>
                </div>
              </div>
            </div>
            
            <ActionButton
              onClick={handleGithubLogin}
              disabled={loading}
              variant="secondary"
              className="w-full"
              icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4" />}
            >
              {loading ? 'CONNECTING...' : 'AUTHENTICATE WITH GITHUB'}
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
