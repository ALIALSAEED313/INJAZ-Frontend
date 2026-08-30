import { useState, useEffect } from "react";
import { useParams } from "react-router";
import {
  createReview,
  getReviewByOrder,
  updateReview,
  deleteReview,
} from "../../services/review.Service";
import axios from "axios";

function OrderWorkspace() {
  const { orderId } = useParams();
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
    <div className="order-workspace">
      {/* Top Section: Order Info & Status Updater */}
      <div className="order-details-header">
        <h2>Order Workspace: {order?.service?.title}</h2>
        <div
          className="status-updater"
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
        >
          <label>Order Status: </label>
          {isSellerUser ? (
            <>
              {order?.status === "Requested" && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAcceptOrder}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#52c41a",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "13px",
                  }}
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


        <div>
          {!isSellerUser && order?.status === "Delivered" && (
            <div>
              {hasReviewed && existingReview ? (
                <>
                  {!showReviewForm ? (
                    <div>
                      <h3>Your Review</h3>

                      <p>
                        {"★".repeat(existingReview.rating)}
                        {"☆".repeat(5 - existingReview.rating)}{" "}
                        {existingReview.rating}
                      </p>

                      <p>{existingReview.comment}</p>

                      <button className="btn btn-primary" type="button" onClick={handleStartEditReview}>
                        Edit Review
                      </button>

                      <button className="btn btn-primary" type="button" onClick={handleDeleteReview}>
                        Delete Review
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleUpdateReview}>
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

                      <button className="btn btn-primary" type="submit">Save Changes</button>

                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setShowReviewForm(false)}
                      >
                        Cancel
                      </button>
                    </form>
                  )}
                </>
              ) : (
                <>
                  {!showReviewForm ? (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setShowReviewForm(true)}
                    >
                      Leave a Review
                    </button>
                  ) : (
                    <form onSubmit={handleCreateReview}>
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

                      <button className="btn btn-primary" type="submit">Submit Review</button>

                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setShowReviewForm(false)}
                      >
                        Cancel
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>
          )}
        </div>

      <div className="chat-container">
        <h3>Messages</h3>

        <div className="chat-history">
          {messages.length === 0 ? (
            <p className="no-messages">No messages yet. Say hello!</p>
          ) : (
            messages.map((msg) => (
              <div key={msg._id} className="chat-message">
                <strong>{msg.sender?.username || "User"}: </strong>
                <span>{msg.content}</span>
              </div>
            ))
          )}
        </div>

        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            className="chat-input"
            placeholder="Type your message here..."
            value={newMessage}
            onChange={(event) => setNewMessage(event.target.value)}
          ></input>
          <button className="btn btn-primary" type="submit" className="send-btn">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default OrderWorkspace;
