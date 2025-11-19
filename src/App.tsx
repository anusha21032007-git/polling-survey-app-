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
import EditPoll from "./pages/EditPoll";
import SetupProfile from "./pages/SetupProfile";
import PollSetDetail from "./pages/PollSetDetail";
import SavedPollsPage from "./pages/SavedPolls";

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
            <Route path="/sets/:id" element={<PollSetDetail />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              {/* Mandatory Onboarding Route (no layout wrapper) */}
              <Route path="/setup-profile" element={<SetupProfile />} /> 
              
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/create-poll" element={<CreatePoll />} />
                <Route path="/poll-results" element={<PollResults />} />
                <Route path="/saved-polls" element={<SavedPollsPage />} />
                <Route path="/polls/:id/edit" element={<EditPoll />} />
                <Route path="/polls/:id/results" element={<PollResults />} />
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