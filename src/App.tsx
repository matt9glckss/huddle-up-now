import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { Suspense, lazy } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load pages for better performance
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Auth = lazy(() => import("@/pages/Auth"));
const Groups = lazy(() => import("@/pages/Groups"));
const GroupsNew = lazy(() => import("@/pages/GroupsNew"));
const GroupDetail = lazy(() => import("@/pages/GroupDetail"));
const Events = lazy(() => import("@/pages/Events"));
const EventsNew = lazy(() => import("@/pages/EventsNew"));
const Messages = lazy(() => import("@/pages/Messages"));
const Friends = lazy(() => import("@/pages/Friends"));
const Settings = lazy(() => import("@/pages/Settings"));
const Profile = lazy(() => import("@/pages/Profile"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// Public route wrapper
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Suspense wrapper for lazy loading
const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense
    fallback={
      <div className="flex items-center justify-center h-screen">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    }
  >
    {children}
  </Suspense>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <Toaster />
      <Sonner position="top-right" />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route
            path="/auth"
            element={
              <SuspenseWrapper>
                <PublicRoute>
                  <Auth />
                </PublicRoute>
              </SuspenseWrapper>
            }
          />

          {/* Protected routes */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route
              path="/dashboard"
              element={
                <SuspenseWrapper>
                  <Dashboard />
                </SuspenseWrapper>
              }
            />
            <Route
              path="/groups"
              element={
                <SuspenseWrapper>
                  <Groups />
                </SuspenseWrapper>
              }
            />
            <Route
              path="/groups/new"
              element={
                <SuspenseWrapper>
                  <GroupsNew />
                </SuspenseWrapper>
              }
            />
            <Route
              path="/groups/:id"
              element={
                <SuspenseWrapper>
                  <GroupDetail />
                </SuspenseWrapper>
              }
            />
            <Route
              path="/events"
              element={
                <SuspenseWrapper>
                  <Events />
                </SuspenseWrapper>
              }
            />
            <Route
              path="/events/new"
              element={
                <SuspenseWrapper>
                  <EventsNew />
                </SuspenseWrapper>
              }
            />
            <Route
              path="/messages"
              element={
                <SuspenseWrapper>
                  <Messages />
                </SuspenseWrapper>
              }
            />
            <Route
              path="/friends"
              element={
                <SuspenseWrapper>
                  <Friends />
                </SuspenseWrapper>
              }
            />
            <Route
              path="/settings"
              element={
                <SuspenseWrapper>
                  <Settings />
                </SuspenseWrapper>
              }
            />
            <Route
              path="/profile"
              element={
                <SuspenseWrapper>
                  <Profile />
                </SuspenseWrapper>
              }
            />
          </Route>

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404 */}
          <Route
            path="*"
            element={
              <SuspenseWrapper>
                <NotFound />
              </SuspenseWrapper>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
