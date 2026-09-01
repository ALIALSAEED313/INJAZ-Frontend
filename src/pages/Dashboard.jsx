import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
function Dashboard() {
  const {
    t
  } = useTranslation();
  const {
    user
  } = useAuth();
  return <div>
        <h1>{t("dashboard.welcome")}{user.username}</h1>
    </div>;
}
export default Dashboard;
