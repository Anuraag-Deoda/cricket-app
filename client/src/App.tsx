import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
// Lazy load pages for better performance
import { lazy, Suspense } from 'react';

const Teams = lazy(() => import("@/pages/teams"));
const Players = lazy(() => import("@/pages/players"));
const NewMatch = lazy(() => import("@/pages/matches/new"));
const MatchHistory = lazy(() => import("@/pages/matches/history"));
const LiveScoring = lazy(() => import("@/pages/matches/live"));
const MatchAnalytics = lazy(() => import("@/pages/matches/analytics"));
const Leaderboard = lazy(() => import("@/pages/leaderboard"));
const Analytics = lazy(() => import("@/pages/analytics"));
import NotFound from "@/pages/not-found";

const LoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cricket-primary mx-auto mb-4"></div>
      <p className="text-cricket-gray">Loading...</p>
    </div>
  </div>
);

function Router() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/teams" component={Teams} />
        <Route path="/players" component={Players} />
        <Route path="/matches/new" component={NewMatch} />
        <Route path="/matches/history" component={MatchHistory} />
        <Route path="/matches/live/:matchId" component={LiveScoring} />
        <Route path="/matches/analytics/:matchId" component={MatchAnalytics} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route path="/analytics" component={Analytics} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
