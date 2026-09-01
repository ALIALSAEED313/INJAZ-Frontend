import { useTranslation } from "react-i18next";
import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";
const SellerRoute = ({
  children
}) => {
  const {
    t
  } = useTranslation();
  const {
    loading,
    user
  } = useAuth();
  if (loading) {
    return <p>{t("sellerRoute.loading")}</p>;
  }

  // 1. If the user is not logged in at all, send to sign-in
  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  // 2. If the user is logged in but is NOT a seller, send to 404
  if (!user.isSeller) {
    return <Navigate to="/404" replace />;
  }

  // 3. If they are a seller, let them see the page!
  return children;
};
export default SellerRoute;
