import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import axios from "axios";
import {
  createReview,
  deleteReview,
  getReviewByOrder,
  updateReview,
} from "../../services/review.Service";
import RatingStars from "../../components/RatingStars";
import Icon from "../../components/Icon";
import PageLoader from "../../components/loading-ui/Loading";
import ConfirmDialog from "../../components/ConfirmDialog";
import Toast from "../../components/Toast";

const API_URL = "http://localhost:3000";
const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg", "image/png", "image/gif", "image/webp",
  "application/pdf", "application/zip", "application/x-zip-compressed",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain", "text/csv",
]);

const entityId = value => String(value?._id || value || "");
const formatFileSize = size => {
  if (!Number(size)) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};
const formatDate = value => value
  ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
  : "";

function OrderWorkspace() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [deliveryFiles, setDeliveryFiles] = useState([]);
  const [deliveryError, setDeliveryError] = useState("");
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [submittingDelivery, setSubmittingDelivery] = useState(false);
  const [actionPending, setActionPending] = useState("");
  const [revisionMessage, setRevisionMessage] = useState("");
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [existingReview, setExistingReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  const headers = useMemo(() => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  }), []);

  useEffect(() => {
    let active = true;
    async function loadWorkspace() {
      try {
        const orderResponse = await axios.get(`${API_URL}/orders/${orderId}`, { headers });
        if (!active) return;
        setOrder(orderResponse.data);
        const reviewData = await getReviewByOrder(orderId);
        if (!active) return;
        setExistingReview(reviewData.review || null);
      } catch (requestError) {
        if (!active) return;
        setError(requestError.response?.data?.message || t("orderWorkspace.errorLoadingWorkspaceData"));
      } finally {
        if (active) setLoading(false);
      }
    }
    loadWorkspace();
    return () => {
      active = false;
    };
  }, [headers, orderId, t]);

  const currentUserId = String(localStorage.getItem("userId") || "");
  const isSeller = entityId(order?.seller) === currentUserId;
  const isBuyer = entityId(order?.buyer) === currentUserId;
  const canDeliver = isSeller && ["Pending", "In Progress"].includes(order?.status);
  const delivery = order?.delivery;
  const hasDeliveryPanel = Boolean(delivery?.deliveredAt);
  const hasReviewPanel = isBuyer && order?.status === "Completed";
  const timeline = [
    { label: t("orderWorkspace.orderRequested", { defaultValue: "Order requested" }), date: order?.createdAt },
    { label: t("orderWorkspace.paymentConfirmed", { defaultValue: "Payment confirmed" }), date: order?.paidAt },
    { label: t("orderWorkspace.orderAcceptedStep", { defaultValue: "Order accepted" }), date: order?.acceptedAt },
    { label: t("orderWorkspace.workStarted", { defaultValue: "Work in progress" }), date: order?.startedAt },
    { label: t("orderWorkspace.revisionRequested", { defaultValue: "Revision requested" }), date: order?.revision?.requestedAt },
    { label: t("orderWorkspace.workDelivered", { defaultValue: "Work delivered" }), date: delivery?.deliveredAt },
    { label: t("orderWorkspace.orderCompleted", { defaultValue: "Order completed" }), date: order?.completedAt },
  ].filter(step => step.date);

  let statusPanel = null;
  if (order?.status === "Requested") {
    statusPanel = isSeller
      ? {
          kicker: t("orderWorkspace.newOrderRequest", { defaultValue: "New order request" }),
          title: t("orderWorkspace.orderRequest", { defaultValue: "Order request" }),
          message: t("orderWorkspace.sellerRequestMessage", { defaultValue: "This buyer has requested your service. Review the request and accept it when you are ready to begin." }),
          counterpartLabel: t("orderWorkspace.buyer"),
          counterpart: order?.buyer?.username,
          action: "accept",
        }
      : {
          kicker: t("orderWorkspace.requestSent", { defaultValue: "Request sent" }),
          title: t("orderWorkspace.waitingForSeller", { defaultValue: "Waiting for seller" }),
          message: t("orderWorkspace.buyerRequestMessage", { defaultValue: "Your order request has been sent. The seller has not accepted it yet." }),
          counterpartLabel: t("orderWorkspace.seller"),
          counterpart: order?.seller?.username,
        };
  } else if (isBuyer && order?.status === "Pending") {
    statusPanel = {
      kicker: t("orderWorkspace.orderAcceptedStep", { defaultValue: "Order accepted" }),
      title: t("orderWorkspace.waitingForWorkToStart", { defaultValue: "Waiting for work to start" }),
      message: t("orderWorkspace.pendingBuyerMessage", { defaultValue: "The seller accepted your order and can now start the work." }),
    };
  } else if (isBuyer && order?.status === "In Progress") {
    statusPanel = {
      kicker: t("orderWorkspace.inProgress"),
      title: t("orderWorkspace.workUnderway", { defaultValue: "Work is underway" }),
      message: t("orderWorkspace.inProgressBuyerMessage", { defaultValue: "The seller is working on your order. Delivered files will appear here when they are ready." }),
    };
  } else if (order?.status === "Cancelled") {
    statusPanel = {
      kicker: t("orderWorkspace.cancelled"),
      title: t("orderWorkspace.orderCancelled", { defaultValue: "Order cancelled" }),
      message: t("orderWorkspace.cancelledMessage", { defaultValue: "This order was cancelled. No further workspace actions are available." }),
    };
  } else if (!hasDeliveryPanel && order?.status === "Delivered") {
    statusPanel = {
      kicker: t("orderWorkspace.delivered"),
      title: t("orderWorkspace.deliveryProcessing", { defaultValue: "Delivery is being prepared" }),
      message: t("orderWorkspace.deliveryUnavailableMessage", { defaultValue: "This order is marked as delivered, but its delivery details are not available yet." }),
    };
  } else if (!hasDeliveryPanel && !hasReviewPanel && order?.status === "Completed") {
    statusPanel = {
      kicker: t("orderWorkspace.orderCompleted", { defaultValue: "Order completed" }),
      title: t("orderWorkspace.completedSummary", { defaultValue: "Order complete" }),
      message: t("orderWorkspace.completedMessage", { defaultValue: "This order has been completed. You can still use the order chat to review the conversation." }),
    };
  } else if (!hasDeliveryPanel && !canDeliver && !hasReviewPanel && order?.status) {
    statusPanel = {
      kicker: order.status,
      title: t("orderWorkspace.currentOrderStatus", { defaultValue: "Current order status" }),
      message: t("orderWorkspace.noActionMessage", { defaultValue: "There are no actions available for you at this stage." }),
    };
  }

  function setSuccess(message) {
    setFeedback({
      id: Date.now(),
      type: "success",
      message,
      closeLabel: t("common.close"),
    });
  }

  function setFailure(requestError, fallback) {
    setFeedback({
      id: Date.now(),
      type: "error",
      message: requestError.response?.data?.message || fallback,
      closeLabel: t("common.close"),
    });
  }

  const dismissFeedback = useCallback(() => setFeedback(null), []);

  async function changeStatus(status) {
    try {
      setActionPending(status);
      const response = await axios.put(
        `${API_URL}/orders/${orderId}/status`,
        { status },
        { headers },
      );
      setOrder(previous => ({ ...previous, ...response.data.order }));
      setSuccess(
        status === "Pending"
          ? t("orderWorkspace.orderAcceptedToast", { defaultValue: "Order accepted." })
          : t("orderWorkspace.orderStartedToast", { defaultValue: "Order started." }),
      );
    } catch (requestError) {
      setFailure(requestError, t("orderWorkspace.failedToUpdateStatus"));
    } finally {
      setActionPending("");
    }
  }

  function addDeliveryFiles(incomingFiles) {
    const incoming = Array.from(incomingFiles || []);
    const combined = [...deliveryFiles, ...incoming];
    if (combined.length > MAX_FILES) {
      setDeliveryError(t("orderWorkspace.maxFiles", { defaultValue: "Choose up to 5 files." }));
      return;
    }
    const invalid = incoming.find(file => !ALLOWED_TYPES.has(file.type) || file.size > MAX_FILE_SIZE);
    if (invalid) {
      setDeliveryError(
        invalid.size > MAX_FILE_SIZE
          ? t("orderWorkspace.fileTooLarge", { defaultValue: "{{name}} is larger than 10 MB.", name: invalid.name })
          : t("orderWorkspace.unsupportedFile", { defaultValue: "{{name}} is not a supported file type.", name: invalid.name }),
      );
      return;
    }
    setDeliveryError("");
    setDeliveryFiles(combined);
  }

  function handleFiles(event) {
    addDeliveryFiles(event.target.files);
    event.target.value = "";
  }

  function handleFileDrop(event) {
    event.preventDefault();
    setIsDraggingFiles(false);
    if (!submittingDelivery) addDeliveryFiles(event.dataTransfer.files);
  }

  function requestDeliveryConfirmation(event) {
    event.preventDefault();
    if (!deliveryFiles.length) {
      setDeliveryError(t("orderWorkspace.fileRequired", { defaultValue: "Add at least one delivery file." }));
      fileInputRef.current?.focus();
      return;
    }
    setConfirmation("delivery");
  }

  async function submitDelivery() {
    const body = new FormData();
    deliveryFiles.forEach(file => body.append("files", file));
    body.append("message", deliveryMessage);

    try {
      setSubmittingDelivery(true);
      setFeedback(null);
      const response = await axios.post(
        `${API_URL}/orders/${orderId}/deliver`,
        body,
        { headers },
      );
      setOrder(previous => ({ ...previous, ...response.data.order }));
      setDeliveryFiles([]);
      setDeliveryMessage("");
      setConfirmation(null);
      setSuccess(t("orderWorkspace.deliverySucceeded", { defaultValue: "Work delivered successfully." }));
    } catch (requestError) {
      setFailure(requestError, t("orderWorkspace.deliveryFailed", { defaultValue: "Unable to deliver work." }));
    } finally {
      setSubmittingDelivery(false);
    }
  }

  async function acceptDelivery() {
    try {
      setActionPending("accept");
      const response = await axios.post(
        `${API_URL}/orders/${orderId}/accept-delivery`,
        {},
        { headers },
      );
      setOrder(previous => ({ ...previous, ...response.data.order }));
      setSuccess(t("orderWorkspace.deliveryAccepted", { defaultValue: "Delivery accepted. The order is complete." }));
    } catch (requestError) {
      setFailure(requestError, t("orderWorkspace.acceptFailed", { defaultValue: "Unable to accept delivery." }));
    } finally {
      setActionPending("");
    }
  }

  async function requestRevision(event) {
    event.preventDefault();
    try {
      setActionPending("revision");
      const response = await axios.post(
        `${API_URL}/orders/${orderId}/request-revision`,
        { message: revisionMessage },
        { headers },
      );
      setOrder(previous => ({ ...previous, ...response.data.order }));
      setRevisionMessage("");
      setShowRevisionForm(false);
      setSuccess(t("orderWorkspace.revisionSent", { defaultValue: "Revision request sent to the seller." }));
    } catch (requestError) {
      setFailure(requestError, t("orderWorkspace.revisionFailed", { defaultValue: "Unable to request a revision." }));
    } finally {
      setActionPending("");
    }
  }

  async function submitReview(event) {
    event.preventDefault();
    try {
      setActionPending("review");
      const review = existingReview
        ? await updateReview(existingReview._id, reviewForm)
        : await createReview(orderId, reviewForm);
      setExistingReview(review);
      setShowReviewForm(false);
      setSuccess(existingReview
        ? t("orderWorkspace.reviewUpdated", { defaultValue: "Review updated." })
        : t("orderWorkspace.reviewSubmitted", { defaultValue: "Review submitted." }));
    } catch (requestError) {
      setFailure(requestError, t("orderWorkspace.reviewFailed", { defaultValue: "Unable to save your review." }));
    } finally {
      setActionPending("");
    }
  }

  async function removeReview() {
    try {
      setActionPending("delete-review");
      await deleteReview(existingReview._id);
      setExistingReview(null);
      setShowReviewForm(false);
      setReviewForm({ rating: 5, comment: "" });
      setConfirmation(null);
      setSuccess(t("orderWorkspace.reviewDeleted", { defaultValue: "Review deleted." }));
    } catch (requestError) {
      setFailure(requestError, t("orderWorkspace.reviewDeleteFailed", { defaultValue: "Unable to delete review." }));
    } finally {
      setActionPending("");
    }
  }

  if (loading) return <PageLoader message={t("orderWorkspace.loadingWorkspace")} />;
  if (error) return <div className="workspace-error" role="alert">{error}</div>;

  return (
    <main className="workspace-page">
      <div className="workspace-shell">
        <header className="workspace-header">
          <div>
            <span className="section-label">{t("orderWorkspace.workspace")}</span>
            <h1>{order?.service?.title || t("orderWorkspace.orderWorkspace")}</h1>
            <span className="status-badge">{order?.status}</span>
          </div>
          <div className="workspace-header-actions action-group">
            <button type="button" className="secondary-btn" onClick={() => navigate(`/workspace/${orderId}/chat`)}>
              {t("orderWorkspace.chat")}
            </button>
            {isSeller && order?.status === "Pending" && (
              <button type="button" className="primary-btn" disabled={Boolean(actionPending)} onClick={() => changeStatus("In Progress")}>
                {t("orderWorkspace.startWork", { defaultValue: "Start work" })}
              </button>
            )}
          </div>
        </header>

        <Toast toast={feedback} onDismiss={dismissFeedback} />

        <div className="workspace-content-grid">
          <div className="workspace-main-column">
            {statusPanel && (
              <section className="workspace-panel workspace-status-panel" aria-labelledby="workspace-status-title">
                <div className="panel-header">
                  <div>
                    <span className="workspace-kicker">{statusPanel.kicker}</span>
                    <h2 id="workspace-status-title">{statusPanel.title}</h2>
                  </div>
                </div>
                <p className="workspace-status-message">{statusPanel.message}</p>
                {order?.status === "Requested" && (
                  <dl className="workspace-status-facts">
                    <div>
                      <dt>{statusPanel.counterpartLabel}</dt>
                      <dd>{statusPanel.counterpart}</dd>
                    </div>
                    <div>
                      <dt>{t("orderWorkspace.price")}</dt>
                      <dd>{order?.price} {t("orderWorkspace.bhd")}</dd>
                    </div>
                    {order?.createdAt && (
                      <div>
                        <dt>{t("orderWorkspace.requestedOn", { defaultValue: "Requested on" })}</dt>
                        <dd><time dateTime={order.createdAt}>{formatDate(order.createdAt)}</time></dd>
                      </div>
                    )}
                  </dl>
                )}
                {statusPanel.action === "accept" && (
                  <div className="workspace-status-actions action-group">
                    <button type="button" className="primary-btn" disabled={Boolean(actionPending)} onClick={() => changeStatus("Pending")}>
                      {actionPending === "Pending" ? t("common.loading") : t("orderWorkspace.acceptOrder", { defaultValue: "Accept order" })}
                    </button>
                  </div>
                )}
              </section>
            )}
            {delivery?.deliveredAt && (
              <section className="workspace-panel delivery-view" aria-labelledby="delivered-work-title">
                <div className="panel-header">
                  <div>
                    <span className="workspace-kicker">{t("orderWorkspace.delivered", { defaultValue: "Delivered" })}</span>
                    <h2 id="delivered-work-title">{t("orderWorkspace.deliveredWork", { defaultValue: "Delivered work" })}</h2>
                  </div>
                  <time dateTime={delivery.deliveredAt}>{formatDate(delivery.deliveredAt)}</time>
                </div>
                {delivery.message && <p className="delivery-note">{delivery.message}</p>}
                <div className="delivery-file-list">
                  {(delivery.files || []).map(file => (
                    <div className="delivery-file-row" key={file.fileId || file.url}>
                      {file.mimeType?.startsWith("image/")
                        ? <img className="delivery-file-thumbnail" src={file.url} alt="" />
                        : <Icon name="file" size={20} />}
                      <span>
                        <strong>{file.name}</strong>
                        <small>{formatFileSize(file.size)}</small>
                      </span>
                      <a href={file.url} target="_blank" rel="noreferrer" className="secondary-btn">
                        {t("orderWorkspace.openFile", { defaultValue: "Open" })}
                      </a>
                    </div>
                  ))}
                </div>

                {isBuyer && order.status === "Delivered" && (
                  <div className="delivery-actions action-group">
                    <button type="button" className="primary-btn" disabled={Boolean(actionPending)} onClick={acceptDelivery}>
                      {actionPending === "accept"
                        ? t("common.loading")
                        : t("orderWorkspace.acceptDelivery", { defaultValue: "Accept delivery" })}
                    </button>
                    <button type="button" className="secondary-btn" disabled={Boolean(actionPending)} onClick={() => setShowRevisionForm(value => !value)}>
                      {t("orderWorkspace.requestRevision", { defaultValue: "Request revision" })}
                    </button>
                  </div>
                )}

                {showRevisionForm && (
                  <form className="revision-form" onSubmit={requestRevision}>
                    <label htmlFor="revision-message">{t("orderWorkspace.revisionInstructions", { defaultValue: "Revision instructions" })}</label>
                    <textarea
                      id="revision-message"
                      value={revisionMessage}
                      maxLength={1000}
                      required
                      onChange={event => setRevisionMessage(event.target.value)}
                    />
                    <button type="submit" className="primary-btn" disabled={actionPending === "revision"}>
                      {actionPending === "revision"
                        ? t("common.loading")
                        : t("orderWorkspace.sendRevision", { defaultValue: "Send revision request" })}
                    </button>
                  </form>
                )}
              </section>
            )}

            {canDeliver && (
              <section className="workspace-panel delivery-form-panel" aria-labelledby="deliver-work-title">
                <div className="panel-header">
                  <div>
                    <span className="workspace-kicker">{t("orderWorkspace.sellerAction", { defaultValue: "Seller action" })}</span>
                    <h2 id="deliver-work-title">{t("orderWorkspace.deliverWork", { defaultValue: "Deliver work" })}</h2>
                  </div>
                </div>
                {order.revision?.requestedAt && (
                  <div className="revision-callout">
                    <strong>{t("orderWorkspace.latestRevision", { defaultValue: "Latest revision request" })}</strong>
                    <p>{order.revision.message}</p>
                  </div>
                )}
                <form onSubmit={requestDeliveryConfirmation} className="delivery-form">
                  <label htmlFor="delivery-message">{t("orderWorkspace.deliveryMessage", { defaultValue: "Delivery message (optional)" })}</label>
                  <textarea
                    id="delivery-message"
                    maxLength={2000}
                    value={deliveryMessage}
                    placeholder={t("orderWorkspace.deliveryMessagePlaceholder", { defaultValue: "Explain what is included in this delivery." })}
                    onChange={event => setDeliveryMessage(event.target.value)}
                  />

                  <input
                    ref={fileInputRef}
                    id="delivery-files"
                    type="file"
                    multiple
                    disabled={submittingDelivery}
                    className="delivery-file-input"
                    accept=".zip,.pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                    onChange={handleFiles}
                    aria-describedby={`delivery-file-help${deliveryError ? " delivery-file-error" : ""}`}
                  />
                  <label
                    htmlFor="delivery-files"
                    className={`delivery-dropzone${isDraggingFiles ? " is-dragging" : ""}${submittingDelivery ? " is-disabled" : ""}`}
                    onDragEnter={event => {
                      event.preventDefault();
                      if (!submittingDelivery) setIsDraggingFiles(true);
                    }}
                    onDragOver={event => event.preventDefault()}
                    onDragLeave={event => {
                      if (!event.currentTarget.contains(event.relatedTarget)) setIsDraggingFiles(false);
                    }}
                    onDrop={handleFileDrop}
                  >
                    <span className="delivery-dropzone-icon"><Icon name="paperclip" size={24} /></span>
                    <strong>{t("orderWorkspace.dropDeliveryFiles", { defaultValue: "Drop your delivery files here" })}</strong>
                    <span className="delivery-dropzone-browse">
                      {t("orderWorkspace.or", { defaultValue: "or" })} <span>{t("orderWorkspace.browseFiles", { defaultValue: "Browse files" })}</span>
                    </span>
                    <small id="delivery-file-help">
                      {t("orderWorkspace.supportedDeliveryFiles", { defaultValue: "ZIP, PDF, images and documents" })}
                      <span aria-hidden="true"> · </span>
                      {t("orderWorkspace.fileLimits", { defaultValue: "Up to 5 files · 10 MB each" })}
                    </small>
                  </label>
                  {deliveryError && <p id="delivery-file-error" className="field-error" role="alert">{deliveryError}</p>}

                  {deliveryFiles.length > 0 && (
                    <div className="selected-file-list" aria-label={t("orderWorkspace.selectedFiles", { defaultValue: "Selected files" })}>
                      <p className="delivery-file-count" aria-live="polite">
                        {t("orderWorkspace.filesSelectedCount", { defaultValue: "{{count}} of 5 files selected", count: deliveryFiles.length })}
                      </p>
                      {deliveryFiles.map((file, index) => (
                        <div className="delivery-file-row" key={`${file.name}-${file.lastModified}`}>
                          <Icon name="file" size={20} />
                          <span>
                            <strong>{file.name}</strong>
                            <small>{formatFileSize(file.size)}</small>
                          </span>
                          <button
                            type="button"
                            className="file-remove-btn"
                            disabled={submittingDelivery}
                            aria-label={t("orderWorkspace.removeFile", { defaultValue: "Remove {{name}}", name: file.name })}
                            onClick={() => setDeliveryFiles(files => files.filter((_, fileIndex) => fileIndex !== index))}
                          >
                            <Icon name="close" size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button type="submit" className="primary-btn delivery-submit" disabled={submittingDelivery}>
                    {submittingDelivery
                      ? t("orderWorkspace.delivering", { defaultValue: "Delivering…" })
                      : t("orderWorkspace.deliverWork", { defaultValue: "Deliver work" })}
                  </button>
                </form>
              </section>
            )}

            {isBuyer && order.status === "Completed" && (
              <section className="workspace-panel review-panel" aria-labelledby="workspace-review-title">
                <div className="panel-header">
                  <h2 id="workspace-review-title">{t("orderWorkspace.yourReview")}</h2>
                </div>
                {existingReview && !showReviewForm ? (
                  <>
                    <RatingStars value={existingReview.rating} readOnly />
                    <p>{existingReview.comment || t("orderWorkspace.noReviewComment", { defaultValue: "No written comment." })}</p>
                    <div className="inline-actions action-group">
                      <button type="button" className="secondary-btn" onClick={() => {
                        setReviewForm({ rating: existingReview.rating, comment: existingReview.comment || "" });
                        setShowReviewForm(true);
                      }}>{t("orderWorkspace.editReview")}</button>
                      <button type="button" className="ghost-btn review-delete-btn" onClick={() => setConfirmation("delete-review")}>{t("orderWorkspace.deleteReview")}</button>
                    </div>
                  </>
                ) : !showReviewForm ? (
                  <button type="button" className="primary-btn" onClick={() => setShowReviewForm(true)}>
                    {t("orderWorkspace.leaveAReview")}
                  </button>
                ) : (
                  <form className="review-form" onSubmit={submitReview}>
                    <RatingStars value={reviewForm.rating} onChange={rating => setReviewForm(form => ({ ...form, rating }))} />
                    <label htmlFor="review-comment">{t("orderWorkspace.comment")}</label>
                    <textarea
                      id="review-comment"
                      value={reviewForm.comment}
                      onChange={event => setReviewForm(form => ({ ...form, comment: event.target.value }))}
                    />
                    <div className="inline-actions action-group">
                      <button type="submit" className="primary-btn" disabled={actionPending === "review"}>
                        {actionPending === "review" ? t("common.loading") : t("orderWorkspace.submitReview")}
                      </button>
                      <button type="button" className="ghost-btn" onClick={() => setShowReviewForm(false)}>{t("orderWorkspace.cancel")}</button>
                    </div>
                  </form>
                )}
              </section>
            )}
          </div>

          <aside className="workspace-side-column">
            <section className="workspace-panel workspace-summary-panel">
              <div className="panel-header"><h2>{t("orderWorkspace.orderDetails")}</h2></div>
              <dl className="workspace-summary-list">
                <div><dt>{t("orderWorkspace.service")}</dt><dd>{order?.service?.title}</dd></div>
                <div><dt>{t("orderWorkspace.price")}</dt><dd>{order?.price} {t("orderWorkspace.bhd")}</dd></div>
                <div><dt>{t("orderWorkspace.buyer")}</dt><dd>{order?.buyer?.username}</dd></div>
                <div><dt>{t("orderWorkspace.seller")}</dt><dd>{order?.seller?.username}</dd></div>
              </dl>
            </section>

            <section className="workspace-panel order-timeline" aria-labelledby="timeline-title">
              <div className="panel-header"><h2 id="timeline-title">{t("orderWorkspace.timeline", { defaultValue: "Order timeline" })}</h2></div>
              <ol>
                {timeline.map(step => (
                  <li key={`${step.label}-${step.date}`}>
                    <span aria-hidden="true" />
                    <div>
                      <strong>{step.label}</strong>
                      <time dateTime={step.date}>{formatDate(step.date)}</time>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </aside>
        </div>
      </div>
      <ConfirmDialog
        open={confirmation === "delivery"}
        title={t("orderWorkspace.deliverWorkQuestion", { defaultValue: "Deliver work?" })}
        description={t("orderWorkspace.deliverWorkDescription", { defaultValue: "Are you sure you want to send this delivery to the buyer? The order will be marked as delivered." })}
        cancelLabel={t("orderWorkspace.cancel")}
        confirmLabel={submittingDelivery
          ? t("orderWorkspace.delivering", { defaultValue: "Delivering…" })
          : t("orderWorkspace.deliverWork", { defaultValue: "Deliver work" })}
        busy={submittingDelivery}
        onCancel={() => setConfirmation(null)}
        onConfirm={submitDelivery}
      />
      <ConfirmDialog
        open={confirmation === "delete-review"}
        title={t("orderWorkspace.deleteReviewQuestion", { defaultValue: "Delete review?" })}
        description={t("orderWorkspace.confirmDeleteReview", { defaultValue: "Delete this review? This action cannot be undone." })}
        cancelLabel={t("orderWorkspace.cancel")}
        confirmLabel={actionPending === "delete-review"
          ? t("common.loading")
          : t("orderWorkspace.deleteReview")}
        busy={actionPending === "delete-review"}
        variant="danger"
        onCancel={() => setConfirmation(null)}
        onConfirm={removeReview}
      />
    </main>
  );
}

export default OrderWorkspace;
