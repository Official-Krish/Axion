import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, LayoutGroup } from "motion/react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { PageSkeleton } from "./components/PageSkeleton";
import { RequireAuth } from "./components/RequireAuth";
import { Dashboard } from "./pages/Dashboard";
import { VMDetails } from "./pages/vmDetail";
import { Hosting } from "./pages/Hosting";
import { SignUp } from "./pages/Signup";
import "@solana/wallet-adapter-react-ui/styles.css";
import { SignIn } from "./pages/Signin";
import { NotFound } from "./pages/NotFound";
import { DepinDeployment } from "./pages/DepinDeployment";
import { HostDashboard } from "./pages/HostDashboard";
import { HostMachineDetails } from "./pages/HostMachineDetails";
import ApiReference from "./pages/ApiReference";
import Tutorials from "./pages/Tutorials";
import TutorialPost from "./pages/TutorialPost";
import Status from "./pages/Status";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Careers from "./pages/Careers";
import Contact from "./pages/Contact";
import { Privacy, Terms, Cookies, GDPR } from "./pages/Legal";
import Profile from "./pages/Profile";
import Billing from "./pages/Billing";
import Notifications from "./pages/Notifications";
import FAQ from "./pages/FAQ";
import Roadmap from "./pages/Roadmap";
import ClaimRewards from "./pages/ClaimRewards";
import Host from "./pages/Host";

const Landing = lazy(() => import("./pages/Landing"));
const RentVM = lazy(() =>
  import("./pages/RentVm").then((m) => ({ default: m.RentVM })),
);
const AdminPage = lazy(() =>
  import("./pages/Admin").then((m) => ({ default: m.AdminPage })),
);
const SSHTerminal = lazy(() => import("./pages/Terminal"));
const HostRegister = lazy(() =>
  import("./pages/HostMachine").then((m) => ({ default: m.HostRegister })),
);
const Docs = lazy(() => import("./pages/Docs"));
const DeployApp = lazy(() =>
  import("./pages/deployImage").then((m) => ({ default: m.DeployApp })),
);

const TITLE_MAP: Record<string, string> = {
  "/": "Axion — Decentralized Cloud Computing",
  "/dashboard": "Dashboard — Axion",
  "/rent": "Rent Compute — Axion",
  "/host": "Host — Axion",
  "/hosting": "DePIN Hosting — Axion",
  "/signup": "Sign Up — Axion",
  "/signin": "Sign In — Axion",
  "/admin": "Admin — Axion",
  "/docs": "Documentation — Axion",
  "/api": "API Reference — Axion",
  "/tutorials": "Tutorials — Axion",
  "/status": "System Status — Axion",
  "/about": "About — Axion",
  "/blog": "Blog — Axion",
  "/careers": "Careers — Axion",
  "/contact": "Contact — Axion",
  "/privacy": "Privacy Policy — Axion",
  "/terms": "Terms of Service — Axion",
  "/cookies": "Cookie Policy — Axion",
  "/gdpr": "GDPR — Axion",
  "/profile": "Profile — Axion",
  "/billing": "Billing — Axion",
  "/notifications": "Notifications — Axion",
  "/faq": "FAQ — Axion",
  "/roadmap": "Roadmap — Axion",
  "/depin/register": "Register Host — Axion",
  "/depin/host/dashboard": "Host Dashboard — Axion",
  "/depin/rewards": "Claim Rewards — Axion",
  "/docker/deploy": "Deploy App — Axion",
  "/ssh": "Terminal — Axion",
};

function titleForPath(path: string): string {
  if (path.startsWith("/vm/")) return "VM Details — Axion";
  if (path.startsWith("/ssh/")) return "Terminal — Axion";
  if (path.startsWith("/tutorials/")) return "Tutorial — Axion";
  if (path.startsWith("/depin/machine/")) return "Host Machine — Axion";
  if (path.startsWith("/depin/deployment/")) return "Deployment — Axion";
  return TITLE_MAP[path] || "Axion";
}

function App() {
  const location = useLocation();

  useEffect(() => {
    document.title = titleForPath(location.pathname);
  }, [location.pathname]);

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageSkeleton />}>
        <LayoutGroup>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Landing />} />
              <Route
                path="/dashboard"
                element={
                  <RequireAuth>
                    <Dashboard />
                  </RequireAuth>
                }
              />
              <Route
                path="/rent"
                element={
                  <RequireAuth>
                    <RentVM />
                  </RequireAuth>
                }
              />
              <Route
                path="/vm/:id"
                element={
                  <RequireAuth>
                    <VMDetails />
                  </RequireAuth>
                }
              />
              <Route
                path="/hosting"
                element={
                  <RequireAuth>
                    <Hosting />
                  </RequireAuth>
                }
              />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/signin" element={<SignIn />} />
              <Route
                path="/ssh/:id"
                element={
                  <RequireAuth>
                    <SSHTerminal />
                  </RequireAuth>
                }
              />
              <Route
                path="/admin"
                element={
                  <RequireAuth>
                    <AdminPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/depin/register"
                element={
                  <RequireAuth>
                    <HostRegister />
                  </RequireAuth>
                }
              />
              <Route
                path="/depin/host/dashboard"
                element={
                  <RequireAuth>
                    <HostDashboard />
                  </RequireAuth>
                }
              />
              <Route
                path="/docker/deploy"
                element={
                  <RequireAuth>
                    <DeployApp />
                  </RequireAuth>
                }
              />
              <Route
                path="/depin/machine/:id"
                element={
                  <RequireAuth>
                    <HostMachineDetails />
                  </RequireAuth>
                }
              />
              <Route
                path="/depin/deployment/:id"
                element={
                  <RequireAuth>
                    <DepinDeployment />
                  </RequireAuth>
                }
              />
              <Route
                path="/depin/rewards"
                element={
                  <RequireAuth>
                    <ClaimRewards />
                  </RequireAuth>
                }
              />
              <Route
                path="/host"
                element={
                  <RequireAuth>
                    <Host />
                  </RequireAuth>
                }
              />

              <Route path="/docs" element={<Docs />} />
              <Route path="/api" element={<ApiReference />} />
              <Route path="/tutorials" element={<Tutorials />} />
              <Route path="/tutorials/:slug" element={<TutorialPost />} />
              <Route path="/status" element={<Status />} />
              <Route path="/about" element={<About />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/gdpr" element={<GDPR />} />
              <Route
                path="/profile"
                element={
                  <RequireAuth message="Sign in to access your profile.">
                    <Profile />
                  </RequireAuth>
                }
              />
              <Route
                path="/billing"
                element={
                  <RequireAuth message="Sign in to view billing.">
                    <Billing />
                  </RequireAuth>
                }
              />
              <Route
                path="/notifications"
                element={
                  <RequireAuth message="Sign in to view notifications.">
                    <Notifications />
                  </RequireAuth>
                }
              />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/roadmap" element={<Roadmap />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </LayoutGroup>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
