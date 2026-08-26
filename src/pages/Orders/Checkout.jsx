import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import axios from 'axios';

const Checkout = () => {
  const { serviceId } = useParams(); 
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
        setError('Error loading service details.');
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId]);

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
        headers: { Authorization: `Bearer ${token}` }
      });

      const createdOrder = response.data.order || response.data.Order;
      const newOrderId = createdOrder._id;
      navigate(`/workspace/${newOrderId}`)
      setInvoice(createdOrder);
      setIsProcessing(false);
    } catch (err) {
      console.error(err);
      alert('Checkout failed. Please try again.');
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="loading-state">Loading Checkout...</div>;
  if (error) return <div className="error-state">{error}</div>;

  if (invoice) {
    return (
      <div className="invoice-container">
        <h2 className="success-title">Payment Successful!</h2>
        <div className="invoice-details">
          <h3>Invoice Summary</h3>
          <p><strong>Order ID:</strong> {invoice._id}</p>
          <p><strong>Service:</strong> {service.title}</p>
          <p><strong>Amount Paid:</strong> ${invoice.price}</p>
          <p><strong>Status:</strong> {invoice.status}</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => navigate('/dashboard')}
        >
          Go to My Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h1 className="checkout-title">Checkout</h1>
      
      <div className="order-summary">
        <h2>Order Summary</h2>
        <div className="summary-item">
          <span>Service: </span>
          <strong>{service.title}</strong>
        </div>
        <div className="summary-item">
          <span>Seller: </span>
          <strong>{service.freelancer?.username || service.seller?.username || 'Unknown'}</strong>
        </div>
        <div className="summary-item total-price">
          <span>Total Price: </span>
          <strong>${service.price}</strong>
        </div>
      </div>

      <div className="payment-section">
        <h3>Payment Method</h3>
        <p className="payment-note">For this MVP, click confirm to deduct from your virtual balance.</p>
        
        <button 
          className="btn-checkout" 
          onClick={handleCheckout} 
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Confirm & Pay'}
        </button>
      </div>
    </div>
  );
};

export default Checkout;