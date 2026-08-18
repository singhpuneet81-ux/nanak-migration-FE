import type { ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import RunwayLayout from "@/components/runway/RunwayLayout";
import LoginPage from "@/pages/LoginPage";
import ExpiryRadarPage from "@/pages/leads/ExpiryRadarPage";
import CaptureNetPage from "@/pages/leads/CaptureNetPage";
import AllLeadsPage from "@/pages/leads/AllLeadsPage";
import PathwaysPage from "@/pages/leads/PathwaysPage";
import SourcesPage from "@/pages/leads/SourcesPage";
import AllocationPage from "@/pages/leads/AllocationPage";
import ExportCentrePage from "@/pages/leads/ExportCentrePage";
import SchedulePage from "@/pages/bookings/SchedulePage";
import CommsQueuePage from "@/pages/bookings/CommsQueuePage";
import BookingWidgetPreview from "@/pages/bookings/BookingWidgetPreview";
import AssessmentFormPreview from "@/pages/bookings/AssessmentFormPreview";
import MattersPage from "@/pages/MattersPage";
import ClientsPage from "@/pages/ClientsPage";
import DocumentsPage from "@/pages/DocumentsPage";
import CompliancePage from "@/pages/CompliancePage";
import ReportsPage from "@/pages/ReportsPage";
import HeroSectionChatbotPage from "@/pages/public/HeroSectionChatbotPage";
import ImmigrationNewsletterPage from "@/pages/public/ImmigrationNewsletterPage";

const qc = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,
      gcTime: 10 * 60000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

/** Admin login + CRM only. Public WordPress iframes never enter this tree. */
function AuthedShell({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

function AdminGate() {
  return (
    <AuthedShell>
      <ProtectedRoute />
    </AuthedShell>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          {/* Public embeds — no login, no JWT, no admin chrome */}
          <Route path="/herosection_chatbot" element={<HeroSectionChatbotPage />} />
          <Route path="/herosection-chatbot" element={<HeroSectionChatbotPage />} />
          <Route path="/immigration_newsletter" element={<ImmigrationNewsletterPage />} />
          <Route path="/immigration-newsletter" element={<ImmigrationNewsletterPage />} />

          <Route
            path="/login"
            element={
              <AuthedShell>
                <LoginPage />
              </AuthedShell>
            }
          />

          <Route element={<AdminGate />}>
            <Route element={<RunwayLayout />}>
              <Route path="/" element={<Navigate to="/leads/radar" replace />} />
              <Route path="/leads/radar" element={<ExpiryRadarPage />} />
              <Route path="/leads/net" element={<CaptureNetPage />} />
              <Route path="/leads/all" element={<AllLeadsPage />} />
              <Route path="/leads/path" element={<PathwaysPage />} />
              <Route path="/leads/src" element={<SourcesPage />} />
              <Route path="/leads/team" element={<AllocationPage />} />
              <Route path="/leads/exp" element={<ExportCentrePage />} />
              <Route path="/bookings/sched" element={<SchedulePage />} />
              <Route path="/bookings/comms" element={<CommsQueuePage />} />
              <Route path="/bookings/widget" element={<BookingWidgetPreview />} />
              <Route path="/bookings/oaf" element={<AssessmentFormPreview />} />
              <Route path="/matters" element={<MattersPage />} />
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/compliance" element={<CompliancePage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
