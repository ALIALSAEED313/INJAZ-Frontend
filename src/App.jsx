import { Route, Routes } from "react-router";
import Navbar from "./components/Navbar";
import SignupPage from "./pages/SignupPage";
import Homepage from "./pages/Homepage";
import SignInPage from "./pages/SigninPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Footer from "./components/Footer";
import ServiceDetailsPage from "./pages/ServiceDetailsPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import CreateServicePage from "./pages/ServiceCreatePage";
import EditService from "./pages/ServiceEditPage";
import UserDashboard from "./pages/Orders/UserDashboard";
import OrderWorkspace from "./pages/Orders/OrderWorkspace";
import Checkout from "./pages/Orders/Checkout";
import ProfilePage from "./pages/Profiles/Profile";
import ServicesPage from "./pages/ServicesPage";

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/sign-up" element={<SignupPage />} />
        <Route path="/sign-in" element={<SignInPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/workspace/:orderId"
          element={
            <ProtectedRoute>
              <OrderWorkspace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout/:serviceId"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route path="/services/:id" element={<ServiceDetailsPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/services/create" element={<CreateServicePage />} />
        <Route path="/services/:id/edit" element={<EditService />} />
        <Route path="/profile/:id" element={<ProfilePage/>} />
        <Route path="/services" element={<ServicesPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
