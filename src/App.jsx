import { useEffect, useState } from "react";
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
import OrderChatPage from "./pages/Orders/OrderChatPage";
import Checkout from "./pages/Orders/Checkout";
import ProfilePage from "./pages/Profiles/Profile";
import ServicesPage from "./pages/ServicesPage";
import MyProfilePage from "./pages/Profiles/MyProfilePage";
import ChatPage from "./pages/ChatPage";
import SellerRoute from "./components/SellerRoute";
import NotFoundPage from "./pages/NotFoundPage";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import PolicyAgreementModal from "./components/PolicyAgreementModal";
import PaymentCallback from "./pages/PaymentCallback";
import PaymentDetailsPage from "./pages/PaymentDetailsPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { useAuth } from "./context/AuthContext";
import { useSettings } from "./context/SettingsContext";

function PolicyAgreementGate() {
  const { user } = useAuth();
  const { language } = useSettings();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsOpen(false);
      return;
    }

    const policyKey = "injaz-policy-agreement";
    const saved = localStorage.getItem(policyKey);
    const state = saved
      ? JSON.parse(saved)
      : { accepted: false, lastReminderAt: 0 };

    if (state.accepted) {
      setIsOpen(false);
      return;
    }

    const lastReminder = Number(state.lastReminderAt || 0);
    const reminderDue =
      !lastReminder || Date.now() - lastReminder >= 24 * 60 * 60 * 1000;
    setIsOpen(reminderDue);
  }, [user, language]);

  function savePolicyState(accepted) {
    const policyKey = "injaz-policy-agreement";
    const nextState = {
      accepted,
      lastReminderAt: accepted ? 0 : Date.now(),
      updatedAt: Date.now(),
    };
    localStorage.setItem(policyKey, JSON.stringify(nextState));
  }

  function handleAgree() {
    savePolicyState(true);
    setIsOpen(false);
  }

  function handleRemindLater() {
    savePolicyState(false);
    setIsOpen(false);
  }

  return (
    <PolicyAgreementModal
      open={isOpen}
      onAgree={handleAgree}
      onRemindLater={handleRemindLater}
    />
  );
}

function App() {
  return (
    <div className="app-container">
      <PolicyAgreementGate />
      <Navbar />
      <main className="main-content">
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
            path="/workspace/:orderId/chat"
            element={
              <ProtectedRoute>
                <OrderChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:conversationId"
            element={
              <ProtectedRoute>
                <ChatPage />
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
          <Route
            path="/my-profile"
            element={
              <ProtectedRoute>
                <MyProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/services/:id" element={<ServiceDetailsPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route
            path="/services/create"
            element={
              <SellerRoute>
                <CreateServicePage />
              </SellerRoute>
            }
          />
          <Route
            path="/services/:id/edit"
            element={
              <SellerRoute>
                <EditService />
              </SellerRoute>
            }
          />
          <Route
            path="/payment-details"
            element={
              <SellerRoute>
                <PaymentDetailsPage />
              </SellerRoute>
            }
          />
          <Route path="/profile/:id" element={<ProfilePage />} />

          <Route path="/freelancer/:id" element={<ProfilePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />
          <Route path="/payment/callback" element={<PaymentCallback />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
