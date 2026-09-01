import { useTranslation } from "react-i18next";
import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";
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
  if (loading) return <p>{t("adminProtectedRoute.loading")}</p>;
  if (!user) {
    return <Navigate to="/sign-in" />;
  }
  if (user.role !== "admin") {
    return <Navigate to="/" />;
  }
  return children;
}
export default AdminProtectedRoute;
