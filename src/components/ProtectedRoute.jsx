import { useTranslation } from "react-i18next";
import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";
function ProtectedRoute({
  children
}) {
  const {
    t
  } = useTranslation();
  const {
    loading,
    user
  } = useAuth();
  if (loading) return <p>{t("protectedRoute.loading")}</p>;
  if (!user) {
    return <Navigate to="/sign-in" />;
  }
  return children;
}
export default ProtectedRoute;
