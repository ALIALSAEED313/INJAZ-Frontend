import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import axios from "axios";
import { useSettings } from "../context/SettingsContext";

function ChatPage() {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const { t, language } = useSettings();
  const longPressTimer = useRef(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editDraft, setEditDraft] = useState("");
  const [actionMenuId, setActionMenuId] = useState(null);
  const [chatMenuOpen, setChatMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchConversations() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:3000/chat/conversations",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const items = res.data.conversations || [];
        setConversations(items);

        if (conversationId) {
          const matched = items.find(
            (conversation) => conversation._id === conversationId,
          );

          if (matched) {
            setSelectedConversation(matched);
          }
        } else if (items[0]) {
          setSelectedConversation(items[0]);
        }
      } catch (err) {
        console.error(err);
        setError(t("failedToLoadConversations"));
      } finally {
        setLoading(false);
      }
    }

    fetchConversations();
  }, [conversationId]);

  useEffect(() => {
    if (!selectedConversation?._id) {
      setMessages([]);
      return;
    }

    async function fetchMessages() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:3000/chat/conversations/${selectedConversation._id}/messages`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error(err);
        setError(t("failedToLoadMessages"));
      }
    }

    fetchMessages();
  }, [selectedConversation]);

  async function handleSendMessage(event) {
    event.preventDefault();
    if (!draft.trim() || !selectedConversation?._id) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:3000/chat/messages",
        {
          conversationId: selectedConversation._id,
          content: draft,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setMessages((prev) => [...prev, res.data.data]);
      setDraft("");
    } catch (err) {
      console.error(err);
      setError(t("failedToSendMessage"));
    }
  }

  async function handleDeleteConversation(conversationId) {
    if (!conversationId) return;

    const confirmed = window.confirm(t("deleteThisChat"));
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:3000/chat/conversations/${conversationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const nextConversations = conversations.filter(
        (conversation) => conversation._id !== conversationId,
      );
      setConversations(nextConversations);

      if (selectedConversation?._id === conversationId) {
        const fallback = nextConversations[0] || null;
        setSelectedConversation(fallback);
        navigate(fallback ? `/chat/${fallback._id}` : "/chat");
      }
    } catch (err) {
      console.error(err);
      setError(t("failedToDeleteConversation"));
    }
  }

  async function handleDeleteMessage(messageId) {
    if (!messageId) return;

    const confirmed = window.confirm(t("deleteThisMessage"));
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/chat/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessages((prev) =>
        prev.filter((message) => message._id !== messageId),
      );
    } catch (err) {
      console.error(err);
      setError(t("failedToDeleteMessage"));
    }
  }

  async function handleSaveEdit(messageId) {
    if (!messageId || !editDraft.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:3000/chat/messages/${messageId}`,
        { content: editDraft },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setMessages((prev) =>
        prev.map((message) =>
          message._id === messageId
            ? { ...message, content: res.data.data.content }
            : message,
        ),
      );
      setEditingMessageId(null);
      setEditDraft("");
    } catch (err) {
      console.error(err);
      setError(t("failedToUpdateMessage"));
    }
  }

  function startLongPress(messageId, content) {
    clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      setActionMenuId(messageId);
      setEditingMessageId(null);
      setEditDraft(content);
    }, 500);
  }

  function stopLongPress() {
    clearTimeout(longPressTimer.current);
  }

  function handleClearChat() {
    if (!selectedConversation?._id) return;

    const confirmed = window.confirm(t("clearChatConfirm"));
    if (!confirmed) return;

    setMessages([]);
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation._id === selectedConversation._id
          ? { ...conversation, lastMessage: null }
          : conversation,
      ),
    );
    setChatMenuOpen(false);
  }

  function handleBlockUser() {
    if (!selectedConversation?.participant?._id) return;

    const confirmed = window.confirm(t("blockUserConfirm"));
    if (!confirmed) return;

    const blockedUsers = JSON.parse(
      localStorage.getItem("blockedUsers") || "[]",
    );
    const nextBlockedUsers = [
      ...new Set([...blockedUsers, selectedConversation.participant._id]),
    ];
    localStorage.setItem("blockedUsers", JSON.stringify(nextBlockedUsers));

    const nextConversations = conversations.filter(
      (conversation) => conversation._id !== selectedConversation._id,
    );
    setConversations(nextConversations);
    const fallback = nextConversations[0] || null;
    setSelectedConversation(fallback);
    navigate(fallback ? `/chat/${fallback._id}` : "/chat");
    setChatMenuOpen(false);
  }

  const currentUserId = localStorage.getItem("userId");

  if (loading) {
    return <div className="workspace-loading">{t("loadingChats")}</div>;
  }

  return (
    <main className="chat-list-page">
      <div className="chat-list-shell">
        <aside className="chat-sidebar">
          <div className="chat-sidebar-header">
            <h2>{t("messages")}</h2>
          </div>

          {conversations.length === 0 ? (
            <div className="empty-card">{t("noMessages")}</div>
          ) : (
            conversations.map((conversation) => {
              const participant = conversation.participant;
              const participantName =
                participant?.name || participant?.username || t("user");
              const preview =
                conversation.lastMessage?.content || t("noMessages");

              return (
                <div
                  key={conversation._id}
                  className={`conversation-item ${
                    selectedConversation?._id === conversation._id
                      ? "active"
                      : ""
                  }`}
                >
                  <button
                    type="button"
                    className="conversation-select-button"
                    onClick={() => {
                      setSelectedConversation(conversation);
                      navigate(`/chat/${conversation._id}`);
                    }}
                    aria-label={`${t("openChat")} ${participantName}`}
                  >
                    <img
                      src={
                        participant?.avatarUrl ||
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWC-v0HrKYp0-av4D0eTZv5hoIHoW35GhmKG2djTVP4Q&s"
                      }
                      alt={participantName}
                      className="conversation-avatar"
                    />

                    <div className="conversation-content">
                      <strong>{participantName}</strong>
                      <span>{preview}</span>
                    </div>
                  </button>

                  <div className="conversation-actions">
                    {participant?._id && (
                      <button
                        type="button"
                        className="profile-link-button"
                        onClick={() => navigate(`/profile/${participant._id}`)}
                        aria-label={`${t("viewProfile")} ${participantName}`}
                      >
                        {t("viewProfile")}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </aside>

        <section className="chat-main-panel">
          {!selectedConversation ? (
            <div className="empty-chat-state">
              <h3>{t("selectChat")}</h3>
            </div>
          ) : (
            <>
              <header className="chat-header-row">
                <button
                  type="button"
                  className="chat-user-header chat-profile-trigger"
                  onClick={() =>
                    selectedConversation?.participant?._id &&
                    navigate(`/profile/${selectedConversation.participant._id}`)
                  }
                  aria-label={`${t("viewProfile")} ${selectedConversation.participant?.name || selectedConversation.participant?.username || t("user")}`}
                >
                  <img
                    src={
                      selectedConversation.participant?.avatarUrl ||
                      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWC-v0HrKYp0-av4D0eTZv5hoIHoW35GhmKG2djTVP4Q&s"
                    }
                    alt={
                      selectedConversation.participant?.username || t("user")
                    }
                    className="chat-avatar-small"
                  />
                  <div>
                    <h3>
                      {selectedConversation.participant?.name ||
                        selectedConversation.participant?.username ||
                        t("user")}
                    </h3>
                    <span>{t("directMessage")}</span>
                  </div>
                </button>

                <div className="chat-header-actions">
                  <Link to="/dashboard" className="text-link">
                    {t("backToDashboard")}
                  </Link>

                  <div className="chat-more-menu-wrap">
                    <button
                      type="button"
                      className="chat-more-button"
                      onClick={() => setChatMenuOpen((open) => !open)}
                      aria-label="Open chat actions"
                    >
                      ⋯
                    </button>

                    {chatMenuOpen && (
                      <div className="chat-more-menu">
                        <button type="button" onClick={handleClearChat}>
                          {t("clearChat")}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteConversation(selectedConversation._id)
                          }
                        >
                          {t("deleteChat")}
                        </button>
                        <button type="button" onClick={handleBlockUser}>
                          {t("blockUser")}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </header>

              <div className="chat-history-panel">
                {messages.length === 0 ? (
                  <p className="no-messages">{t("noMessages")}</p>
                ) : (
                  messages.map((message) => {
                    const myMessage =
                      String(message.sender?._id || message.sender) ===
                      String(currentUserId);
                    return (
                      <div
                        key={message._id}
                        className={`chat-message ${myMessage ? "mine" : ""}`}
                        onPointerDown={() =>
                          myMessage &&
                          startLongPress(message._id, message.content)
                        }
                        onPointerUp={stopLongPress}
                        onPointerLeave={stopLongPress}
                      >
                        <div className="chat-message-bubble">
                          {editingMessageId === message._id ? (
                            <div className="chat-edit-box">
                              <input
                                type="text"
                                value={editDraft}
                                onChange={(event) =>
                                  setEditDraft(event.target.value)
                                }
                                dir={language === "ar" ? "rtl" : "ltr"}
                              />
                              <div className="chat-edit-actions">
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(message._id)}
                                >
                                  {t("save")}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingMessageId(null);
                                    setEditDraft("");
                                    setActionMenuId(null);
                                  }}
                                >
                                  {t("cancel")}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p>{message.content}</p>
                              <small>
                                {new Date(message.createdAt).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </small>
                            </>
                          )}

                          {myMessage && editingMessageId !== message._id && (
                            <div
                              className={`chat-message-actions ${
                                actionMenuId === message._id ? "visible" : ""
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingMessageId(message._id);
                                  setEditDraft(message.content);
                                  setActionMenuId(null);
                                }}
                              >
                                {t("editMessage")}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActionMenuId(null);
                                  handleDeleteMessage(message._id);
                                }}
                              >
                                {t("deleteMessage")}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form onSubmit={handleSendMessage} className="chat-input-form">
                <input
                  type="text"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={t("typeMessageHere")}
                  className="chat-input"
                  dir={language === "ar" ? "rtl" : "ltr"}
                />
                <button type="submit" className="primary-btn">
                  {t("send")}
                </button>
              </form>
            </>
          )}

          {error && <div className="error-state">{error}</div>}
        </section>
      </div>
    </main>
  );
}

export default ChatPage;
