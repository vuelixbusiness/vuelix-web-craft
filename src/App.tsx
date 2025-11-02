import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ArtistNotificationProvider } from "@/contexts/ArtistNotificationContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import UnifiedDashboard from "./pages/UnifiedDashboard";
import Profile from "./pages/Profile";
import Wallet from "./pages/Wallet";
import Campaigns from "./pages/Campaigns";
import Discover from "./pages/Discover";
import Leaderboard from "./pages/Leaderboard";
import CreatorCampaigns from "./pages/CreatorCampaigns";
import CreatorFlow from "./pages/CreatorFlow";
import ArtistCampaignFlow from "./pages/ArtistCampaignFlow";
import ArtistCampaignHub from "./pages/ArtistCampaignHub";
import VuelixPlus from "./pages/VuelixPlus";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Terms from "./pages/Terms";
import Policy from "./pages/Policy";
import CreatorDashboard from "./pages/CreatorDashboard";
import ArtistDashboard from "./pages/ArtistDashboard";
import CampaignDetails from "@/pages/CampaignDetails";
import CampaignManagement from "@/pages/CampaignManagement";
import CampaignJoin from "@/pages/CampaignJoin";
import CampaignNew from "@/pages/CampaignNew";
import CampaignEdit from "@/pages/CampaignEdit";
import CampaignDetailRestored from "@/pages/CampaignDetailRestored";
import Chat from "./pages/Chat";
import Messages from "./pages/Messages";
import PaymentMethods from "./pages/PaymentMethods";
import StripeCallback from "./pages/StripeCallback";
import PaypalCallback from "./pages/PaypalCallback";
import Notifications from "./pages/Notifications";
import Support from "./pages/Support";
import Friends from "./pages/Friends";
import PublicProfile from "./pages/PublicProfile";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <ErrorBoundary>
        <AuthProvider>
          <ArtistNotificationProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              
              {/* Unified Dashboard System */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <UnifiedDashboard />
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
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/campaigns/new" element={
                <ProtectedRoute>
                  <CampaignNew />
                </ProtectedRoute>
              } />
              <Route path="/campaigns/edit/:id" element={
                <ProtectedRoute>
                  <CampaignEdit />
                </ProtectedRoute>
              } />
              <Route path="/campaign/:id" element={<CampaignDetailRestored />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/campaign-old/:id" element={
                <ProtectedRoute>
                  <CampaignDetails />
                </ProtectedRoute>
              } />
              <Route path="/campaign/:id/manage" element={
                <ProtectedRoute>
                  <CampaignManagement />
                </ProtectedRoute>
              } />
              <Route path="/campaign/:id/join" element={
                <ProtectedRoute>
                  <CampaignJoin />
                </ProtectedRoute>
              } />
              <Route path="/leaderboard" element={<Leaderboard />} />
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
              <Route path="/user/:username" element={<PublicProfile />} />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/payment-methods" element={
                <ProtectedRoute>
                  <PaymentMethods />
                </ProtectedRoute>
              } />
              <Route path="/stripe-callback" element={<StripeCallback />} />
              <Route path="/paypal-callback" element={<PaypalCallback />} />
              
              {/* Legacy Routes - Redirect to Unified Dashboard */}
              <Route path="/artist" element={
                <ProtectedRoute>
                  <UnifiedDashboard />
                </ProtectedRoute>
              } />
              <Route path="/creator" element={
                <ProtectedRoute>
                  <UnifiedDashboard />
                </ProtectedRoute>
              } />
              <Route path="/artist-dashboard" element={
                <ProtectedRoute>
                  <UnifiedDashboard />
                </ProtectedRoute>
              } />
              <Route path="/home" element={
                <ProtectedRoute>
                  <UnifiedDashboard />
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
              <Route path="/artist/campaign/:id" element={
                <ProtectedRoute>
                  <ArtistCampaignHub />
                </ProtectedRoute>
              } />
              <Route path="/vuelix-plus" element={<VuelixPlus />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Policy />} />
              <Route path="/chat" element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              } />
              <Route path="/messages" element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ArtistNotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
