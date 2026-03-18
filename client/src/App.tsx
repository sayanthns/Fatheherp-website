import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation, Router as WouterRouter } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import PricingPage from "./pages/PricingPage";
import { frappeApi } from "./lib/frappe-api";

function Router() {
  const [location] = useLocation();

  useEffect(() => {
    // Capture Ad Tracking Params
    const searchParams = new URLSearchParams(window.location.search);
    const utmSource = searchParams.get('utm_source') || searchParams.get('ref');
    const utmCampaign = searchParams.get('utm_campaign');

    if (utmSource) {
      sessionStorage.setItem('ad_source', utmSource);
      if (utmCampaign) sessionStorage.setItem('ad_campaign', utmCampaign);
    }

    frappeApi.logVisit({
      path: location,
      browser: navigator.userAgent,
      source: sessionStorage.getItem('ad_source'),
      campaign: sessionStorage.getItem('ad_campaign')
    }).catch(console.error);
  }, [location]);
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/pricing"} component={PricingPage} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Detect base path: "/fateh" when served at /fateh/*, empty when served at root via home_page
  const base = window.location.pathname.startsWith("/fateh") ? "/fateh" : "";

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <WouterRouter base={base}>
            <Router />
          </WouterRouter>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
