import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
const PaymentCallback = () => {
  const {
    t
  } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    async function verifyPayment() {
      try {
        const tapId = searchParams.get("tap_id");
        if (!tapId) {
          setStatus(t("paymentCallback.failed"));
          return;
        }
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:3000/payments/verify?tap_id=${encodeURIComponent(tapId)}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message || "Failed to verify payment");
        }
        if (data.paymentStatus === "paid") {
          setStatus(t("paymentCallback.success"));
          const orderId = typeof data.order?._id === "object" ? data.order?._id : data.order?._id?.toString();
          setTimeout(() => {
            if (orderId) {
              navigate(`/workspace/${orderId}`);
            } else {
              navigate("/");
            }
          }, 2000);
        } else {
          setStatus(t("paymentCallback.failed"));
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        setStatus(t("paymentCallback.failed"));
      }
    }
    verifyPayment();
  }, [searchParams, navigate, t]);
  if (status === "loading") {
    return <div>
        <h2>{t("paymentCallback.checkingPayment")}</h2>
      </div>;
  }
  if (status === "success") {
    return <div>
        <h1>{t("paymentCallback.paymentSuccessful")}</h1>
        <p>{t("paymentCallback.yourOrderHasBeenPaidSuccessfully")}</p>
        <p>{t("paymentCallback.redirectingToYourWorkspace")}</p>
      </div>;
  }
  return <div>
      <h1>{t("paymentCallback.paymentFailed")}</h1>
      <p>{t("paymentCallback.yourPaymentCouldNotBeCompleted")}</p>
    </div>;
};
export default PaymentCallback;
