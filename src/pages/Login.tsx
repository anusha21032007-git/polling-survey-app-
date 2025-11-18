import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseSession } from '@/integrations/supabase/session-context';
import { Navigate } from 'react-router-dom';

const Login = () => {
  const { session, isLoading } = useSupabaseSession();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Redirect authenticated users to the home page
  if (session) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Sign in to Polling App
        </h2>
        <Auth
          supabaseClient={supabase}
          providers={[]}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  // Using light theme colors
                  brand: 'hsl(221 83% 53%)', // Primary Blue
                  brandAccent: 'hsl(221 83% 53%)', // Primary Blue
                  inputBackground: 'hsl(210 40% 96.1%)', // Secondary/Muted
                  inputBorder: 'hsl(214.3 31.8% 91.4%)', // Border
                  inputFocus: 'hsl(221 83% 53%)', // Primary Blue
                  inputText: 'hsl(222.2 47.4% 11.2%)', // Foreground Dark
                },
              },
            },
          }}
          theme="light"
          redirectTo={window.location.origin + '/'}
        />
      </div>
    </div>
  );
};

export default Login;