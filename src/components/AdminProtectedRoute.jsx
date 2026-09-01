import { useTranslation } from "react-i18next";
import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import PageLoader from "./loading-ui/Loading";
function AdminProtectedRoute({
  children
}) {
  const {
    t
  } = useTranslation();
  const {
    loading,
    user
  } = useAuth();
  if (loading) return <PageLoader message={t("adminProtectedRoute.loading")} />;
  if (!user) {
    return <Navigate to="/sign-in" />;
  }
  if (user.role !== "admin") {
    return <Navigate to="/" />;
  }
  return children;
}
export default AdminProtectedRoute;
