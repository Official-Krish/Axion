import { Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { RequireAuth } from "./components/RequireAuth";
import Landing from "./pages/Landing";
import { Dashboard } from "./pages/Dashboard";
import { RentVM } from "./pages/RentVm";
import { VMDetails } from "./pages/vmDetail";
import { Hosting } from "./pages/Hosting";
import { SignUp } from "./pages/Signup";
import "@solana/wallet-adapter-react-ui/styles.css";
import { SignIn } from "./pages/Signin";
import SSHTerminal from "./pages/Terminal";
import { AdminPage } from "./pages/Admin";
import { ComingSoon } from "./components/ComingSoon";
import { HostRegister } from "./pages/HostMachine";
import { DepinDeployment } from "./pages/DepinDeployment";
import { HostDashboard } from "./pages/HostDashboard";
import { DeployApp } from "./pages/deployImage";
import { HostMachineDetails } from "./pages/HostMachineDetails";
import Docs from "./pages/Docs";
import ApiReference from "./pages/ApiReference";
import Tutorials from "./pages/Tutorials";
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

function App() {
  return (
    <ErrorBoundary>
      <Routes>
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
        <Route path="*" element={<ComingSoon isDepin={false} />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
