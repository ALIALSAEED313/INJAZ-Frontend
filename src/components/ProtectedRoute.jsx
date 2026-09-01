import { useTranslation } from "react-i18next";
import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import PageLoader from "./loading-ui/Loading";
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
  if (loading) return <PageLoader message={t("protectedRoute.loading")} />;
  if (!user) {
    return <Navigate to="/sign-in" />;
  }
  return children;
}
export default ProtectedRoute;
