import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import { PublicLayout } from "@/layouts/PublicLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { JudgeLayout } from "@/layouts/JudgeLayout";

import HomePage from "@/pages/HomePage";
import GalleryPage from "@/pages/GalleryPage";
import BonsaiPassportPage from "@/pages/BonsaiPassportPage";
import VerifyCertificatePage from "@/pages/VerifyCertificatePage";
import EventListPage from "@/pages/EventListPage";
import EventDetailPage from "@/pages/EventDetailPage";
import EventRegistrationPage from "@/pages/EventRegistrationPage";
import LoginPage from "@/pages/LoginPage";
import PassportLookupPage from "@/pages/PassportLookupPage";
import LiveArenaPage from "@/pages/LiveArenaPage";
import PesertaDashboardPage from "@/pages/PesertaDashboardPage";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminEventsPage from "@/pages/admin/AdminEventsPage";
import AdminEventControl from "@/pages/admin/AdminEventControl";
import AdminParticipantsPage from "@/pages/admin/AdminParticipantsPage";
import AdminBonsaiPage from "@/pages/admin/AdminBonsaiPage";
import AdminJudgingPage from "@/pages/admin/AdminJudgingPage";
import AdminRankingPage from "@/pages/admin/AdminRankingPage";
import AdminCertificatesPage from "@/pages/admin/AdminCertificatesPage";
import AdminReportsPage from "@/pages/admin/AdminReportsPage";
import AdminPassportsPage from "@/pages/admin/AdminPassportsPage";
import SuperadminUsersPage from "@/pages/admin/SuperadminUsersPage";
import JudgeDashboardPage from "@/pages/judge/JudgeDashboardPage";
import JudgeRankingPage from "@/pages/judge/JudgeRankingPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/events" element={<EventListPage />} />
              <Route path="/events/:eventId" element={<EventDetailPage />} />
              <Route path="/events/:eventId/register" element={<EventRegistrationPage />} />
              <Route path="/live" element={<LiveArenaPage />} />
              <Route path="/peserta" element={<PesertaDashboardPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/verify-certificate" element={<VerifyCertificatePage />} />
              <Route path="/passport-lookup" element={<PassportLookupPage />} />
              <Route path="/bonsai-passport/:passportId" element={<BonsaiPassportPage />} />
            </Route>

            <Route path="/login" element={<LoginPage />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={(
                <ProtectedRoute roles={["superadmin", "admin"]}>
                  <AdminLayout />
                </ProtectedRoute>
              )}
            >
              <Route index element={<AdminDashboard />} />
              <Route path="events" element={<AdminEventsPage />} />
              <Route path="events/control" element={<AdminEventControl />} />
              <Route path="participants" element={<AdminParticipantsPage />} />
              <Route path="bonsai" element={<AdminBonsaiPage />} />
              <Route path="judging" element={<AdminJudgingPage />} />
              <Route path="ranking" element={<AdminRankingPage />} />
              <Route path="certificates" element={<AdminCertificatesPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
              <Route path="passports" element={<AdminPassportsPage />} />
              <Route
                path="users"
                element={(
                  <ProtectedRoute roles={["superadmin"]}>
                    <SuperadminUsersPage />
                  </ProtectedRoute>
                )}
              />
            </Route>

            <Route
              path="/judge"
              element={(
                <ProtectedRoute roles={["juri"]}>
                  <JudgeLayout />
                </ProtectedRoute>
              )}
            >
              <Route index element={<JudgeDashboardPage />} />
              <Route path="ranking" element={<JudgeRankingPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
