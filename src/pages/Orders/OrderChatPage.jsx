import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import axios from "axios";
import { useTranslation } from "react-i18next";
function OrderChatPage() {
  const {
    orderId
  } = useParams();
  const {
    t
  } = useTranslation();
  const currentUserId = localStorage.getItem("userId");
  const fileInputRef = useRef(null);
  const [order, setOrder] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [presence, setPresence] = useState({
    status: "online",
    lastSeen: "online now"
  });
  const otherUser = useMemo(() => {
    if (!order) return null;
    const buyerId = order.buyer?._id || order.buyer;
    return buyerId?.toString() === currentUserId?.toString() ? order.seller : order.buyer;
  }, [currentUserId, order]);
  useEffect(() => {
    let isMounted = true;
    async function fetchConversation() {
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
        const normalizedMessages = (msgRes.data.messages || []).map((msg, index, arr) => ({
          ...msg,
          status: msg.sender?._id?.toString() === myUserId?.toString() && index === arr.length - 1 ? "seen" : msg.sender?._id?.toString() === myUserId?.toString() ? "sent" : "received"
        }));
        if (!isMounted) return;
        setMessages(normalizedMessages);
        setLoading(false);
      } catch (err) {
        console.error(err);
        if (!isMounted) return;
        setError(t("orderChat.errorLoadingChatData"));
        setLoading(false);
      }
    }
    fetchConversation();
    return () => {
      isMounted = false;
    };
  }, [orderId, t]);
  useEffect(() => {
    if (newMessage.trim().length === 0) return;
    const typingTimer = setTimeout(() => setIsTyping(true), 400);
    const stopTypingTimer = setTimeout(() => setIsTyping(false), 1800);
    return () => {
      clearTimeout(typingTimer);
      clearTimeout(stopTypingTimer);
    };
  }, [newMessage]);
  useEffect(() => {
    if (!otherUser) return;
    const isOnline = Math.random() > 0.2;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPresence({
      status: isOnline ? "online" : "offline",
      lastSeen: isOnline ? "online now" : "last seen 8 min ago"
    });
  }, [otherUser]);
  async function handleSendMessage(event) {
    event.preventDefault();
    if (!newMessage.trim() && !attachment || !conversation || !order?.service?._id) return;
    const localMessage = {
      _id: `local-${Date.now()}`,
      content: newMessage.trim(),
      attachment: attachment ? {
        name: attachment.name,
        type: attachment.type,
        preview: attachment.type.startsWith("image/") ? URL.createObjectURL(attachment) : null
      } : null,
      sender: {
        _id: currentUserId,
        username: "You"
      },
      createdAt: new Date().toISOString(),
      status: "sent"
    };
    setMessages(prev => [...prev, localMessage]);
    setNewMessage("");
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    try {
      const token = localStorage.getItem("token");
      if (newMessage.trim()) {
        await axios.post("http://localhost:3000/chat/messages", {
          conversationId: conversation._id,
          content: newMessage,
          serviceId: order.service._id
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    } catch (err) {
      console.error(err);
      alert(t("orderChat.failedToSendMessage"));
    }
    setTimeout(() => {
      setMessages(prev => prev.map(msg => msg._id === localMessage._id ? {
        ...msg,
        status: "seen"
      } : msg));
    }, 1200);
  }
  function handleAttachmentChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setAttachment(file);
  }
  if (loading) return <div className="workspace-loading">{t("orderChat.loadingChat")}</div>;
  if (error) return <div className="workspace-error">{error}</div>;
  return <main className="workspace-page">
      <div className="workspace-shell chat-page-shell">
        <header className="workspace-header chat-header">
          <div className="chat-user-header">
            <div className="chat-avatar-small">
              {(otherUser?.username || t("orderChat.u")).charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="section-label">{t("common.chat")}</span>
              <h1>
                {otherUser?.username || order?.service?.title || t("orderChat.orderChat")}
              </h1>
            </div>
          </div>

          <div className="chat-meta">
            <div className="chat-presence">
              <span className={`presence-dot ${presence.status}`} />
              {isTyping ? t("common.typing") : presence.status === "online" ? t("common.onlineNow") : `${t("common.lastSeen")}: ${presence.lastSeen}`}
            </div>
            <Link to={`/workspace/${orderId}`} className="secondary-btn">
              {t("common.backToWorkspace")}
            </Link>
          </div>
        </header>

        <section className="workspace-panel chat-panel">
          <div className="chat-history">
            {messages.length === 0 ? <p className="no-messages">{t("common.noMessages")}</p> : messages.map(msg => {
            const isMine = msg.sender?._id?.toString() === currentUserId?.toString();
            return <div key={msg._id} className={`chat-message ${isMine ? "mine" : ""}`}>
                    {!isMine && <strong>{msg.sender?.username || t("orderChat.user")}</strong>}

                    {msg.attachment && <div className="chat-attachment-box">
                        {msg.attachment.preview ? <img src={msg.attachment.preview} alt={msg.attachment.name} className="chat-attachment-preview" /> : <span className="chat-file-pill">
                            📎 {msg.attachment.name}
                          </span>}
                      </div>}

                    {msg.content && <span>{msg.content}</span>}

                    <div className="chat-message-meta">
                      <time>
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  }) : ""}
                      </time>

                      {isMine && <span className={`msg-status ${msg.status || "sent"}`}>
                          {msg.status === "seen" ? "✓✓" : "✓✓"}
                        </span>}
                    </div>
                  </div>;
          })}

            {isTyping && <div className="typing-indicator" aria-live="polite">
                <span />
                <span />
                <span />
              </div>}
          </div>

          <form className="chat-input-form" onSubmit={handleSendMessage}>
            <label className="attachment-button" htmlFor="chat-file-upload">
              <input ref={fileInputRef} id="chat-file-upload" type="file" accept="image/*,.pdf,.doc,.docx" onChange={handleAttachmentChange} />
              <span>📎</span>
            </label>

            {attachment && <div className="chat-attachment-name">{attachment.name}</div>}

            <input type="text" className="chat-input" placeholder={t("common.typeMessage")} value={newMessage} onChange={event => setNewMessage(event.target.value)} dir="auto" />
            <button type="submit" className="send-btn">
              {t("common.send")}
            </button>
          </form>
        </section>
      </div>
    </main>;
}
export default OrderChatPage;
