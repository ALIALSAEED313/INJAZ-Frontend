import { useTranslation } from "react-i18next";
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import axios from 'axios';
import PageLoader, { ButtonLoader } from "../../components/loading-ui/Loading";
const Checkout = () => {
  const {
    t
  } = useTranslation();
  const {
    serviceId
  } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [invoice, setInvoice] = useState(null);
  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/services/${serviceId}`);
        setService(response.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(t("checkout.errorLoadingServiceDetails"));
        setLoading(false);
      }
    };
    fetchService();
  }, [serviceId, t]);
  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const sellerId = service.freelancer?._id || service.seller?._id || service.freelancer || service.seller;
      const response = await axios.post('http://localhost:3000/orders', {
        serviceId: service._id,
        sellerId: sellerId,
        price: service.price
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const createdOrder = response.data.order || response.data.Order;
      const newOrderId = createdOrder._id;
      navigate(`/workspace/${newOrderId}`);
      setInvoice(createdOrder);
      setIsProcessing(false);
    } catch (err) {
      console.error(err);
      alert('Checkout failed. Please try again.');
      setIsProcessing(false);
    }
  };
  if (loading) return <PageLoader message={t("checkout.loadingCheckout")} />;
  if (error) return <div className="error-state">{error}</div>;
  if (invoice) {
    return <div className="invoice-container">
        <h2 className="success-title">{t("checkout.paymentSuccessful")}</h2>
        <div className="invoice-details">
          <h3>{t("checkout.invoiceSummary")}</h3>
          <p><strong>{t("checkout.orderId")}</strong> {invoice._id}</p>
          <p><strong>{t("checkout.service")}</strong> {service.title}</p>
          <p><strong>{t("checkout.amountPaid")}</strong> ${invoice.price}</p>
          <p><strong>{t("checkout.status")}</strong> {invoice.status}</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/dashboard')}>{t("checkout.goToMyDashboard")}</button>
      </div>;
  }
  return <div className="checkout-container">
      <h1 className="checkout-title">{t("checkout.checkout")}</h1>

      <div className="order-summary">
        <h2>{t("checkout.orderSummary")}</h2>
        <div className="summary-item">
          <span>{t("checkout.service")}</span>
          <strong>{service.title}</strong>
        </div>
        <div className="summary-item">
          <span>{t("checkout.seller")}</span>
          <strong>{service.freelancer?.username || service.seller?.username || t("checkout.unknown")}</strong>
        </div>
        <div className="summary-item total-price">
          <span>{t("checkout.totalPrice")}</span>
          <strong>${service.price}</strong>
        </div>
      </div>

      <div className="payment-section">
        <h3>{t("checkout.paymentMethod")}</h3>
        <p className="payment-note">{t("checkout.forThisMvpClickConfirmToDeductFromYourVirtualBalance")}</p>

        <button className="btn-checkout" onClick={handleCheckout} disabled={isProcessing}>
          {isProcessing ? <ButtonLoader /> : t("checkout.confirmAndPay")}
        </button>
      </div>
    </div>;
};
export default Checkout;
