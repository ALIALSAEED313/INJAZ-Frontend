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

function App() {
  return (
    <div className="app-shell">
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
              {" "}
              <CreateServicePage />{" "}
            </SellerRoute>
          }
        />
        <Route
          path="/services/:id/edit"
          element={
            <SellerRoute>
              {" "}
              <EditService />{" "}
            </SellerRoute>
          }
        />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/freelancer/:id" element={<ProfilePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
