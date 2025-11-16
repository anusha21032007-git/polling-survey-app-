import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { SupabaseSessionProvider } from "./integrations/supabase/session-context";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import CreatePoll from "./pages/CreatePoll";
import PollResults from "./pages/PollResults";
import PollDetail from "./pages/PollDetail";
import EditPoll from "./pages/EditPoll";
import Profile from "./pages/Profile"; // Import the new Profile page

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SupabaseSessionProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/profile" element={<Profile />} /> {/* Add Profile Route */}
                <Route path="/create-poll" element={<CreatePoll />} />
                <Route path="/poll-results" element={<PollResults />} />
                <Route path="/polls/:id" element={<PollDetail />} />
                <Route path="/polls/:id/edit" element={<EditPoll />} />
                <Route path="/polls/:id/results" element={<PollResults />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </SupabaseSessionProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;