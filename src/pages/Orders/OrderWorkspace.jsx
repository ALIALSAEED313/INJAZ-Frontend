import { useState, useEffect } from "react";
import { useParams } from "react-router";
import {
  createReview,
  getReviewByOrder,
  updateReview,
  deleteReview,
} from "../../services/review.Service";
import axios from "axios";
import { useSettings } from "../../context/SettingsContext";

function OrderWorkspace() {
  const { orderId } = useParams();
  const { t, language } = useSettings();
  const [order, setOrder] = useState(null);

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
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
        const headers = { Authorization: `Bearer ${token}` };

        const orderRes = await axios.get(
          `http://localhost:3000/orders/${orderId}`,
          { headers },
        );
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

        const participantId =
          buyerId?.toString() === myUserId?.toString() ? sellerId : buyerId;

        const convRes = await axios.post(
          "http://localhost:3000/chat/conversations",
          { participantId },
          { headers },
        );

        const currentConv = convRes.data.conversation;
        if (!isMounted) return;
        setConversation(currentConv);

        const msgRes = await axios.get(
          `http://localhost:3000/chat/conversations/${currentConv._id}/messages`,
          { headers },
        );
        if (!isMounted) return;
        setMessages(msgRes.data.messages || []);
        setLoading(false);
      } catch (err) {
        console.error(err);
        if (!isMounted) return;
        setError("Error loading workspace data.");
        setLoading(false);
      }
    }

    fetchOrderAndChat();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  async function handleAcceptOrder() {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3000/orders/${orderId}/status`,
        { status: "Pending" },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setOrder({ ...order, status: "Pending" });
      alert("Order accepted! Status updated to Pending.");
    } catch (err) {
      console.error(err);
      alert("Failed to accept order. Are you authorized?");
    }
  }

  async function handleStatusChange(event) {
    const newStatus = event.target.value;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3000/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setOrder({ ...order, status: newStatus });
      alert("Order status updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update status. Are you authorized?");
    }
  }

  async function handleSendMessage(event) {
    event.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:3000/chat/messages",
        {
          conversationId: conversation._id,
          content: newMessage,
          serviceId: order.service._id,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setMessages([...messages, res.data.data]);
      setNewMessage("");
    } catch (err) {
      console.error(err);
      alert("Failed to send message.");
    }
  }

  async function handleCreateReview(event) {
    event.preventDefault();

    try {
      const createdReview = await createReview(orderId, reviewForm);

      setExistingReview(createdReview);
      setHasReviewed(true);
      setShowReviewForm(false);

      setReviewForm({
        rating: 5,
        comment: "",
      });
    } catch (err) {
      console.error("Error creating review:", err);
    }
  }

  function handleStartEditReview() {
    setReviewForm({
      rating: existingReview.rating,
      comment: existingReview.comment || "",
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
        comment: updatedReview.comment,
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
        comment: "",
      });

      setShowReviewForm(false);
    } catch (err) {
      console.error("Error deleting review:", err);
    }
  }

  const myUserId = localStorage.getItem("userId");
  const sellerId = order?.seller?._id || order?.seller;
  const isSellerUser = Boolean(
    sellerId && myUserId && sellerId.toString() === myUserId.toString(),
  );

  if (loading)
    return <div className="workspace-loading">Loading Workspace ...</div>;
  if (error) return <div className="workspace-error">{error}</div>;

  return (
    <main className="workspace-page">
      <div className="workspace-shell">
        <header className="workspace-header">
          <div>
            <span className="section-label">Workspace</span>
            <h1>Order Workspace: {order?.service?.title}</h1>
          </div>

          <div className="workspace-header-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={() =>
                window.location.assign(`/workspace/${orderId}/chat`)
              }
            >
              Chat
            </button>

            <div className="status-updater">
              <label>{t("orderStatus")}:</label>
              {isSellerUser ? (
                <>
                  {order?.status === "Requested" && (
                    <button
                      type="button"
                      className="accept-order-btn"
                      onClick={handleAcceptOrder}
                    >
                      ✓ Accept Order
                    </button>
                  )}
                  <select
                    value={order?.status}
                    onChange={handleStatusChange}
                    className="status-select"
                  >
                    <option value="Requested">
                      Requested (Awaiting Acceptance)
                    </option>
                    <option value="Pending">Pending (Accepted)</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </>
              ) : (
                <span className="status-badge">{order?.status}</span>
              )}
            </div>
          </div>
        </header>

        {!isSellerUser && order?.status === "Delivered" && (
          <section className="workspace-panel review-panel">
            {hasReviewed && existingReview ? (
              <>
                {!showReviewForm ? (
                  <div>
                    <h3>Your Review</h3>
                    <p className="review-stars">
                      {"★".repeat(existingReview.rating)}
                      {"☆".repeat(5 - existingReview.rating)}{" "}
                      {existingReview.rating}
                    </p>
                    <p>{existingReview.comment}</p>
                    <div className="inline-actions">
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={handleStartEditReview}
                      >
                        Edit Review
                      </button>
                      <button
                        type="button"
                        className="ghost-btn"
                        onClick={handleDeleteReview}
                      >
                        Delete Review
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateReview} className="review-form">
                    <h3>Edit Review</h3>

                    <label htmlFor="rating">Rating</label>
                    <select
                      id="rating"
                      value={reviewForm.rating}
                      onChange={(event) =>
                        setReviewForm({
                          ...reviewForm,
                          rating: Number(event.target.value),
                        })
                      }
                    >
                      <option value={5}>5 Stars</option>
                      <option value={4}>4 Stars</option>
                      <option value={3}>3 Stars</option>
                      <option value={2}>2 Stars</option>
                      <option value={1}>1 Star</option>
                    </select>

                    <label htmlFor="comment">Comment</label>
                    <textarea
                      id="comment"
                      value={reviewForm.comment}
                      onChange={(event) =>
                        setReviewForm({
                          ...reviewForm,
                          comment: event.target.value,
                        })
                      }
                    />

                    <div className="inline-actions">
                      <button type="submit" className="primary-btn">
                        Save Changes
                      </button>
                      <button
                        type="button"
                        className="ghost-btn"
                        onClick={() => setShowReviewForm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </>
            ) : (
              <>
                {!showReviewForm ? (
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={() => setShowReviewForm(true)}
                  >
                    Leave a Review
                  </button>
                ) : (
                  <form onSubmit={handleCreateReview} className="review-form">
                    <h3>Leave a Review</h3>

                    <label htmlFor="rating">Rating</label>
                    <select
                      id="rating"
                      value={reviewForm.rating}
                      onChange={(event) =>
                        setReviewForm({
                          ...reviewForm,
                          rating: Number(event.target.value),
                        })
                      }
                    >
                      <option value={5}>5 Stars</option>
                      <option value={4}>4 Stars</option>
                      <option value={3}>3 Stars</option>
                      <option value={2}>2 Stars</option>
                      <option value={1}>1 Star</option>
                    </select>

                    <label htmlFor="comment">Comment</label>
                    <textarea
                      id="comment"
                      value={reviewForm.comment}
                      onChange={(event) =>
                        setReviewForm({
                          ...reviewForm,
                          comment: event.target.value,
                        })
                      }
                      placeholder="Share your experience..."
                    />

                    <div className="inline-actions">
                      <button type="submit" className="primary-btn">
                        Submit Review
                      </button>
                      <button
                        type="button"
                        className="ghost-btn"
                        onClick={() => setShowReviewForm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </section>
        )}

        <section className="workspace-layout">
          <div className="workspace-panel workspace-summary-panel">
            <div className="panel-header">
              <h3>Order Details</h3>
            </div>
            <div className="workspace-summary-grid">
              <div>
                <span className="summary-label">Service</span>
                <strong>{order?.service?.title || "Unknown Service"}</strong>
              </div>
              <div>
                <span className="summary-label">Price</span>
                <strong>{order?.price || 0} BHD</strong>
              </div>
              <div>
                <span className="summary-label">Buyer</span>
                <strong>{order?.buyer?.username || "Unknown buyer"}</strong>
              </div>
              <div>
                <span className="summary-label">Seller</span>
                <strong>{order?.seller?.username || "Unknown seller"}</strong>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default OrderWorkspace;
