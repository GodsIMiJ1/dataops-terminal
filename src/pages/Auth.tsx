
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
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already signed in
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/');
      }
    };
    
    checkUser();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
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
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: window.location.origin,
        },
      });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error signing in with GitHub:', error);
      toast.error('Failed to sign in with GitHub');
      setLoading(false);
    }
  };

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
