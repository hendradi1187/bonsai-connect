import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { PublicLayout } from "@/layouts/PublicLayout";
import { AdminLayout } from "@/layouts/AdminLayout";

import HomePage from "@/pages/HomePage";
import GalleryPage from "@/pages/GalleryPage";
import BonsaiPassportPage from "@/pages/BonsaiPassportPage";
import VerifyCertificatePage from "@/pages/VerifyCertificatePage";
import EventListPage from "@/pages/EventListPage";
import PassportLookupPage from "@/pages/PassportLookupPage";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminEventsPage from "@/pages/admin/AdminEventsPage";
import AdminParticipantsPage from "@/pages/admin/AdminParticipantsPage";
import AdminBonsaiPage from "@/pages/admin/AdminBonsaiPage";
import AdminJudgingPage from "@/pages/admin/AdminJudgingPage";
import AdminRankingPage from "@/pages/admin/AdminRankingPage";
import AdminCertificatesPage from "@/pages/admin/AdminCertificatesPage";
import AdminReportsPage from "@/pages/admin/AdminReportsPage";
import AdminPassportsPage from "@/pages/admin/AdminPassportsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventListPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/verify-certificate" element={<VerifyCertificatePage />} />
            <Route path="/passport-lookup" element={<PassportLookupPage />} />
            <Route path="/bonsai-passport/:passportId" element={<BonsaiPassportPage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="events" element={<AdminEventsPage />} />
            <Route path="participants" element={<AdminParticipantsPage />} />
            <Route path="bonsai" element={<AdminBonsaiPage />} />
            <Route path="judging" element={<AdminJudgingPage />} />
            <Route path="ranking" element={<AdminRankingPage />} />
            <Route path="certificates" element={<AdminCertificatesPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="passports" element={<AdminPassportsPage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
