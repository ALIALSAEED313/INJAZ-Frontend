import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { createReview, getReviewByOrder, updateReview, deleteReview } from "../../services/review.Service";
import axios from "axios";
import RatingStars from "../../components/RatingStars";
import PageLoader from "../../components/loading-ui/Loading";
function OrderWorkspace() {
  const {
    orderId
  } = useParams();
  const {
    t
  } = useTranslation();
  const [order, setOrder] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ""
  });
  const [hasReviewed, setHasReviewed] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let isMounted = true;
    async function fetchOrderAndChat() {
      try {
        const token = localStorage.getItem("token");
        const headers = {
          Authorization: `Bearer ${token}`
        };
        const orderRes = await axios.get(`http://localhost:3000/orders/${orderId}`, {
          headers
        });
        const currentOrder = orderRes.data;
        if (!isMounted) return;
        setOrder(currentOrder);
        const reviewData = await getReviewByOrder(orderId);
        if (!isMounted) return;
        setHasReviewed(reviewData.hasReviewed);
        setExistingReview(reviewData.review);
        const myUserId = localStorage.getItem("userId");
        const buyerId = currentOrder.buyer?._id || currentOrder.buyer;
        const sellerId = currentOrder.seller?._id || currentOrder.seller;
        const participantId = buyerId?.toString() === myUserId?.toString() ? sellerId : buyerId;
        const convRes = await axios.post("http://localhost:3000/chat/conversations", {
          participantId
        }, {
          headers
        });
        const currentConv = convRes.data.conversation;
        if (!isMounted) return;
        setConversation(currentConv);
        const msgRes = await axios.get(`http://localhost:3000/chat/conversations/${currentConv._id}/messages`, {
          headers
        });
        if (!isMounted) return;
        setMessages(msgRes.data.messages || []);
        setLoading(false);
      } catch (err) {
        console.error(err);
        if (!isMounted) return;
        setError(t("orderWorkspace.errorLoadingWorkspaceData"));
        setLoading(false);
      }
    }
    fetchOrderAndChat();
    return () => {
      isMounted = false;
    };
  }, [orderId, t]);
  async function handleAcceptOrder() {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:3000/orders/${orderId}/status`, {
        status: "Pending"
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setOrder({
        ...order,
        status: "Pending"
      });
      alert(t("orderWorkspace.orderAccepted"));
    } catch (err) {
      console.error(err);
      alert(t("orderWorkspace.failedToAcceptOrder"));
    }
  }
  async function handleStatusChange(event) {
    const newStatus = event.target.value;
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:3000/orders/${orderId}/status`, {
        status: newStatus
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setOrder({
        ...order,
        status: newStatus
      });
      alert(t("orderWorkspace.statusUpdated"));
    } catch (err) {
      console.error(err);
      alert(t("orderWorkspace.failedToUpdateStatus"));
    }
  }
  async function handleSendMessage(event) {
    event.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:3000/chat/messages", {
        conversationId: conversation._id,
        content: newMessage,
        serviceId: order.service._id
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMessages([...messages, res.data.data]);
      setNewMessage("");
    } catch (err) {
      console.error(err);
      alert(t("orderWorkspace.failedToSendMessage"));
    }
  }

  // Retain the existing inline-chat handler for the legacy workspace chat UI.
  void handleSendMessage;
  async function handleCreateReview(event) {
    event.preventDefault();
    try {
      const createdReview = await createReview(orderId, reviewForm);
      setExistingReview(createdReview);
      setHasReviewed(true);
      setShowReviewForm(false);
      setReviewForm({
        rating: 5,
        comment: ""
      });
    } catch (err) {
      console.error("Error creating review:", err);
    }
  }
  function handleStartEditReview() {
    setReviewForm({
      rating: existingReview.rating,
      comment: existingReview.comment || ""
    });
    setShowReviewForm(true);
  }
  async function handleUpdateReview(event) {
    event.preventDefault();
    try {
      const updatedReview = await updateReview(existingReview._id, reviewForm);
      setExistingReview({
        ...existingReview,
        rating: updatedReview.rating,
        comment: updatedReview.comment
      });
      setShowReviewForm(false);
    } catch (err) {
      console.error("Error updating review:", err);
    }
  }
  async function handleDeleteReview() {
    try {
      await deleteReview(existingReview._id);
      setExistingReview(null);
      setHasReviewed(false);
      setReviewForm({
        rating: 5,
        comment: ""
      });
      setShowReviewForm(false);
    } catch (err) {
      console.error("Error deleting review:", err);
    }
  }
  const myUserId = localStorage.getItem("userId");
  const sellerId = order?.seller?._id || order?.seller;
  const isSellerUser = Boolean(sellerId && myUserId && sellerId.toString() === myUserId.toString());
  if (loading) return <PageLoader message={t("orderWorkspace.loadingWorkspace")} />;
  if (error) return <div className="workspace-error">{error}</div>;
  return <main className="workspace-page">
      <div className="workspace-shell">
        <header className="workspace-header">
          <div>
            <span className="section-label">{t("orderWorkspace.workspace")}</span>
            <h1>{t("orderWorkspace.orderWorkspace")}{order?.service?.title}</h1>
          </div>

          <div className="workspace-header-actions">
            <button type="button" className="secondary-btn" onClick={() => window.location.assign(`/workspace/${orderId}/chat`)}>{t("orderWorkspace.chat")}</button>

            <div className="status-updater">
              <label>{t("common.orderStatus")}:</label>
              {isSellerUser ? <>
                  {order?.status === "Requested" && <button type="button" className="accept-order-btn" onClick={handleAcceptOrder}>{t("orderWorkspace.cceptOrder")}</button>}
                  <select value={order?.status} onChange={handleStatusChange} className="status-select">
                    <option value="Requested">{t("orderWorkspace.requestedAwaitingAcceptance")}</option>
                    <option value="Pending">{t("orderWorkspace.pendingAccepted")}</option>
                    <option value="In Progress">{t("orderWorkspace.inProgress")}</option>
                    <option value="Delivered">{t("orderWorkspace.delivered")}</option>
                    <option value="Cancelled">{t("orderWorkspace.cancelled")}</option>
                  </select>
                </> : <span className="status-badge">{order?.status}</span>}
            </div>
          </div>
        </header>

        {!isSellerUser && order?.status === "Delivered" && <section className="workspace-panel review-panel">
            {hasReviewed && existingReview ? <>
                {!showReviewForm ? <div>
                    <h3>{t("orderWorkspace.yourReview")}</h3>
                    <RatingStars value={existingReview.rating} readOnly />
                    <p>{existingReview.comment}</p>
                    <div className="inline-actions">
                      <button type="button" className="secondary-btn" onClick={handleStartEditReview}>{t("orderWorkspace.editReview")}</button>
                      <button type="button" className="ghost-btn review-delete-btn" onClick={handleDeleteReview}>{t("orderWorkspace.deleteReview")}</button>
                    </div>
                  </div> : <form onSubmit={handleUpdateReview} className="review-form">
                    <h3>{t("orderWorkspace.editReview")}</h3>

                    <RatingStars value={reviewForm.rating} onChange={rating => setReviewForm({
              ...reviewForm,
              rating
            })} />

                    <label htmlFor="comment">{t("orderWorkspace.comment")}</label>
                    <textarea id="comment" value={reviewForm.comment} onChange={event => setReviewForm({
              ...reviewForm,
              comment: event.target.value
            })} />

                    <div className="inline-actions">
                      <button type="submit" className="primary-btn">{t("orderWorkspace.saveChanges")}</button>
                      <button type="button" className="ghost-btn" onClick={() => setShowReviewForm(false)}>{t("orderWorkspace.cancel")}</button>
                    </div>
                  </form>}
              </> : <>
                {!showReviewForm ? <button type="button" className="primary-btn" onClick={() => setShowReviewForm(true)}>{t("orderWorkspace.leaveAReview")}</button> : <form onSubmit={handleCreateReview} className="review-form">
                    <h3>{t("orderWorkspace.leaveAReview")}</h3>

                    <RatingStars value={reviewForm.rating} onChange={rating => setReviewForm({
              ...reviewForm,
              rating
            })} />

                    <label htmlFor="comment">{t("orderWorkspace.comment")}</label>
                    <textarea id="comment" value={reviewForm.comment} onChange={event => setReviewForm({
              ...reviewForm,
              comment: event.target.value
            })} placeholder={t("orderWorkspace.shareYourExperience")} />

                    <div className="inline-actions">
                      <button type="submit" className="primary-btn">{t("orderWorkspace.submitReview")}</button>
                      <button type="button" className="ghost-btn" onClick={() => setShowReviewForm(false)}>{t("orderWorkspace.cancel")}</button>
                    </div>
                  </form>}
              </>}
          </section>}

        <section className="workspace-layout">
          <div className="workspace-panel workspace-summary-panel">
            <div className="panel-header">
              <h3>{t("orderWorkspace.orderDetails")}</h3>
            </div>
            <div className="workspace-summary-grid">
              <div>
                <span className="summary-label">{t("orderWorkspace.service")}</span>
                <strong>{order?.service?.title || t("orderWorkspace.unknownService")}</strong>
              </div>
              <div>
                <span className="summary-label">{t("orderWorkspace.price")}</span>
                <strong>{order?.price || 0}{t("orderWorkspace.bhd")}</strong>
              </div>
              <div>
                <span className="summary-label">{t("orderWorkspace.buyer")}</span>
                <strong>{order?.buyer?.username || t("orderWorkspace.unknownBuyer")}</strong>
              </div>
              <div>
                <span className="summary-label">{t("orderWorkspace.seller")}</span>
                <strong>{order?.seller?.username || t("orderWorkspace.unknownSeller")}</strong>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>;
}
export default OrderWorkspace;
import { useTranslation } from "react-i18next";
