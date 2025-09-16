import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AuthenticatedHome from "./pages/AuthenticatedHome";
import Home from "./pages/Home";
import CreatorCampaigns from "./pages/CreatorCampaigns";
import CreatorFlow from "./pages/CreatorFlow";
import ArtistCampaignFlow from "./pages/ArtistCampaignFlow";
import VuelixPlus from "./pages/VuelixPlus";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Terms from "./pages/Terms";
import CreatorDashboard from "./pages/CreatorDashboard";
import ArtistDashboard from "./pages/ArtistDashboard";
import ArtistLanding from "./pages/ArtistLanding";
import Chat from "./pages/Chat";
import Leaderboard from "./pages/Leaderboard";
import Campaigns from "./pages/Campaigns";
import MyProfile from "./pages/MyProfile";
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
            <Route path="/profile" element={<MyProfile />} />
            <Route path="/home" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/creator-campaigns" element={<CreatorCampaigns />} />
              <Route path="/creator-flow" element={<CreatorFlow />} />
              <Route path="/artist-campaign" element={<ArtistCampaignFlow />} />
              <Route path="/artist-landing" element={<ArtistLanding />} />
              <Route path="/vuelix-plus" element={<VuelixPlus />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/creator-dashboard" element={<CreatorDashboard />} />
            <Route path="/artist-dashboard" element={<ArtistDashboard />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/campaigns" element={<Campaigns />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
