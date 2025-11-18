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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-card shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-center text-foreground">
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
                  brand: 'hsl(0 100% 71%)', // Vibrant Coral
                  brandAccent: 'hsl(0 100% 71%)',
                  inputBackground: 'hsl(36 27% 91%)', // Light Beige
                  inputBorder: 'hsl(36 27% 85%)',
                  inputFocus: 'hsl(0 100% 71%)',
                  inputText: 'hsl(0 0% 20%)', // Dark Charcoal
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