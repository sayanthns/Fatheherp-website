import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import PricingPage from "./pages/PricingPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

function Router() {
  const [location] = useLocation();

  useEffect(() => {
    // Phase 7: Capture Ad Tracking Params
    const searchParams = new URLSearchParams(window.location.search);
    const utmSource = searchParams.get('utm_source') || searchParams.get('ref');
    const utmCampaign = searchParams.get('utm_campaign');

    if (utmSource) {
      sessionStorage.setItem('ad_source', utmSource);
      if (utmCampaign) sessionStorage.setItem('ad_campaign', utmCampaign);
    }

    // Only track public facing routes
    if (!location.startsWith("/admin")) {
      fetch("/api/analytics/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: location,
          browser: navigator.userAgent,
          source: sessionStorage.getItem('ad_source'),
          campaign: sessionStorage.getItem('ad_campaign')
        })
      }).catch(console.error);
    }
  }, [location]);
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/pricing"} component={PricingPage} />
      <Route path={"/admin"} component={AdminLogin} />
      <Route path={"/admin/dashboard"} component={AdminDashboard} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
