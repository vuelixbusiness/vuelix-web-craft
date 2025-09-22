import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Wallet from "./pages/Wallet";
import Campaigns from "./pages/Campaigns";
import Leaderboard from "./pages/Leaderboard";
import CreatorCampaigns from "./pages/CreatorCampaigns";
import CreatorFlow from "./pages/CreatorFlow";
import ArtistCampaignFlow from "./pages/ArtistCampaignFlow";
import VuelixPlus from "./pages/VuelixPlus";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Terms from "./pages/Terms";
import CreatorDashboard from "./pages/CreatorDashboard";
import ArtistDashboard from "./pages/ArtistDashboard";
import Chat from "./pages/Chat";
import Notifications from "./pages/Notifications";
import Support from "./pages/Support";
import Friends from "./pages/Friends";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              
              {/* Main Dashboard System */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/wallet" element={
                <ProtectedRoute>
                  <Wallet />
                </ProtectedRoute>
              } />
              <Route path="/campaigns" element={
                <ProtectedRoute>
                  <Campaigns />
                </ProtectedRoute>
              } />
              <Route path="/leaderboard" element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              } />
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } />
              <Route path="/support" element={
                <ProtectedRoute>
                  <Support />
                </ProtectedRoute>
              } />
              <Route path="/friends" element={
                <ProtectedRoute>
                  <Friends />
                </ProtectedRoute>
              } />
              
              {/* Legacy/Specialized Routes */}
              <Route path="/artist" element={
                <ProtectedRoute>
                  <ArtistDashboard />
                </ProtectedRoute>
              } />
              <Route path="/creator" element={
                <ProtectedRoute>
                  <CreatorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/artist-dashboard" element={
                <ProtectedRoute>
                  <ArtistDashboard />
                </ProtectedRoute>
              } />
              <Route path="/home" element={
                <ProtectedRoute>
                  <CreatorDashboard />
                </ProtectedRoute>
              } />
              
              {/* Other Routes */}
              <Route path="/creator-campaigns" element={<CreatorCampaigns />} />
              <Route path="/creator-flow" element={<CreatorFlow />} />
              <Route path="/artist-campaign" element={
                <ProtectedRoute>
                  <ArtistCampaignFlow />
                </ProtectedRoute>
              } />
              <Route path="/vuelix-plus" element={<VuelixPlus />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/chat" element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
