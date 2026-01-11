import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BloodProvider } from "@/context/BloodContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Welcome from "./pages/Welcome";
import Index from "./pages/Index";
import RegisterDonor from "./pages/RegisterDonor";
import RequestBlood from "./pages/RequestBlood";
import Dashboard from "./pages/Dashboard";
import Compatibility from "./pages/Compatibility";
import AdminLogin from "./pages/AdminLogin";
import Auth from "./pages/Auth";
import DonationHistory from "./pages/DonationHistory";
import DonorProfile from "./pages/DonorProfile";
import BloodAvailability from "./pages/BloodAvailability";
import TrackRequest from "./pages/TrackRequest";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <BloodProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/home" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/compatibility" element={<Compatibility />} />
              <Route path="/blood-availability" element={<BloodAvailability />} />
              <Route path="/track-request" element={<TrackRequest />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              
              {/* Protected routes - require login */}
              <Route 
                path="/register" 
                element={
                  <ProtectedRoute>
                    <RegisterDonor />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/request" 
                element={
                  <ProtectedRoute>
                    <RequestBlood />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <DonorProfile />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute requireAdmin>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/donation-history" 
                element={
                  <ProtectedRoute requireAdmin>
                    <DonationHistory />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </BloodProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
