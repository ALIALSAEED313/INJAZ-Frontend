import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useParams } from "react-router";
import axios from "axios";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { useSettings } from "../context/SettingsContext";
import Icon from "../components/Icon";
import PageLoader from "../components/loading-ui/Loading";
function mergeMessagesById(currentMessages, incomingMessages) {
  const messagesById = new Map();
  [...currentMessages, ...incomingMessages].forEach(message => {
    if (message?._id) messagesById.set(String(message._id), message);
  });
  return [...messagesById.values()].sort((first, second) => new Date(first.createdAt || 0).getTime() - new Date(second.createdAt || 0).getTime());
}
function formatFileSize(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function ChatPage() {
  const navigate = useNavigate();
  const {
    conversationId
  } = useParams();
  const {
    theme
  } = useSettings();
  const {
    t
  } = useTranslation();
  const historyRef = useRef(null);
  const composerRef = useRef(null);
  const attachmentInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const sendingRef = useRef(false);
  const messageMenuRef = useRef(null);
  const messageMenuButtonRefs = useRef(new Map());
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editDraft, setEditDraft] = useState("");
  const [actionMenuId, setActionMenuId] = useState(null);
  const [messageMenuPosition, setMessageMenuPosition] = useState(null);
  const [chatMenuOpen, setChatMenuOpen] = useState(false);
  const [conversationSearch, setConversationSearch] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const attachmentPreviewUrl = useMemo(() => attachment?.type.startsWith("image/") ? URL.createObjectURL(attachment) : "", [attachment]);
  useEffect(() => {
    async function fetchConversations() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3000/chat/conversations", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const items = res.data.conversations || [];
        setConversations(items);
        if (conversationId) {
          const matched = items.find(conversation => conversation._id === conversationId);
          if (matched) {
            setSelectedConversation(matched);
          }
        }
      } catch (err) {
        console.error(err);
        setError(t("common.failedToLoadConversations"));
      } finally {
        setLoading(false);
      }
    }
    fetchConversations();
  }, [conversationId, t]);
  const fetchMessages = useCallback(async (conversationId, signal) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:3000/chat/conversations/${conversationId}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        signal
      });
      const serverMessages = res.data.messages || [];
      setMessages(current => mergeMessagesById(current, serverMessages));
      return serverMessages;
    } catch (err) {
      if (err.code === "ERR_CANCELED") return [];
      console.error(err);
      setError(t("common.failedToLoadMessages"));
      return [];
    }
  }, [t]);
  useEffect(() => {
    if (!selectedConversation?._id) return undefined;
    const controller = new AbortController();
    async function loadMessages() {
      await fetchMessages(selectedConversation._id, controller.signal);
    }
    loadMessages();
    return () => controller.abort();
  }, [fetchMessages, selectedConversation?._id]);
  useEffect(() => {
    const history = historyRef.current;
    if (history) history.scrollTop = history.scrollHeight;
  }, [messages, selectedConversation]);
  useEffect(() => {
    if (!actionMenuId) return undefined;
    const history = historyRef.current;
    function closeMessageMenu(event) {
      if (messageMenuRef.current?.contains(event.target) || event.target.closest?.(".chat-message-menu-button")) {
        return;
      }
      setActionMenuId(null);
      setMessageMenuPosition(null);
    }
    function handleKeyDown(event) {
      if (event.key !== "Escape") return;
      const trigger = messageMenuButtonRefs.current.get(actionMenuId);
      setActionMenuId(null);
      setMessageMenuPosition(null);
      trigger?.focus();
    }
    function closeOnViewportChange() {
      setActionMenuId(null);
      setMessageMenuPosition(null);
    }
    document.addEventListener("pointerdown", closeMessageMenu);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", closeOnViewportChange);
    history?.addEventListener("scroll", closeOnViewportChange);
    return () => {
      document.removeEventListener("pointerdown", closeMessageMenu);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", closeOnViewportChange);
      history?.removeEventListener("scroll", closeOnViewportChange);
    };
  }, [actionMenuId]);
  useEffect(() => {
    if (!actionMenuId || !messageMenuRef.current) return;
    messageMenuRef.current.querySelector("[role='menuitem']")?.focus();
  }, [actionMenuId, messageMenuPosition]);
  useEffect(() => {
    if (!emojiPickerOpen) return undefined;
    function closeEmojiPicker(event) {
      if (emojiPickerRef.current?.contains(event.target) || event.target.closest?.(".chat-emoji-button")) return;
      setEmojiPickerOpen(false);
    }
    function closeOnEscape(event) {
      if (event.key === "Escape") setEmojiPickerOpen(false);
    }
    document.addEventListener("pointerdown", closeEmojiPicker);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeEmojiPicker);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [emojiPickerOpen]);
  useEffect(() => {
    return () => {
      if (attachmentPreviewUrl) URL.revokeObjectURL(attachmentPreviewUrl);
    };
  }, [attachmentPreviewUrl]);
  function resizeComposer() {
    const composer = composerRef.current;
    if (!composer) return;
    composer.style.height = "auto";
    composer.style.height = `${Math.min(composer.scrollHeight, 120)}px`;
  }
  function insertEmoji(emojiData) {
    const emoji = emojiData.emoji;
    const composer = composerRef.current;
    const start = composer?.selectionStart ?? draft.length;
    const end = composer?.selectionEnd ?? draft.length;
    const nextDraft = `${draft.slice(0, start)}${emoji}${draft.slice(end)}`;
    setDraft(nextDraft);
    requestAnimationFrame(() => {
      composer?.focus();
      composer?.setSelectionRange(start + emoji.length, start + emoji.length);
      resizeComposer();
    });
  }
  function handleAttachmentChange(event) {
    const file = event.target.files?.[0] || null;
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    if (!allowedTypes.includes(file.type)) {
      setError(t("chat.unsupportedFileType"));
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError(t("chat.filesMustBe5MBOrSmaller"));
      event.target.value = "";
      return;
    }
    setError("");
    setAttachment(file);
  }
  async function handleSendMessage(event) {
    event.preventDefault();
    const content = draft.trim();
    const conversationId = selectedConversation?._id;
    if (!content && !attachment || !conversationId || sendingRef.current) return;
    sendingRef.current = true;
    setSending(true);
    try {
      const token = localStorage.getItem("token");
      const payload = new FormData();
      payload.append("conversationId", conversationId);
      payload.append("content", content);
      if (attachment) payload.append("attachment", attachment);
      const res = await axios.post("http://localhost:3000/chat/messages", payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      let createdMessage = res.data?.data;
      if (createdMessage?._id) {
        setMessages(current => mergeMessagesById(current, [createdMessage]));
      } else {
        const serverMessages = await fetchMessages(conversationId);
        createdMessage = serverMessages.at(-1) || null;
      }
      if (createdMessage) {
        setConversations(current => current.map(conversation => conversation._id === conversationId ? {
          ...conversation,
          lastMessage: createdMessage
        } : conversation));
      }
      setDraft(current => current.trim() === content ? "" : current);
      setAttachment(null);
      if (attachmentInputRef.current) attachmentInputRef.current.value = "";
      requestAnimationFrame(() => {
        resizeComposer();
        composerRef.current?.focus();
      });
    } catch (err) {
      console.error(err);
      setError(t("common.failedToSendMessage"));
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  }
  async function handleDeleteConversation(conversationId) {
    if (!conversationId) return;
    const confirmed = window.confirm(t("common.deleteThisChat"));
    if (!confirmed) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/chat/conversations/${conversationId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const nextConversations = conversations.filter(conversation => conversation._id !== conversationId);
      setConversations(nextConversations);
      if (selectedConversation?._id === conversationId) {
        const fallback = nextConversations[0] || null;
        setMessages([]);
        setSelectedConversation(fallback);
        navigate(fallback ? `/chat/${fallback._id}` : "/chat");
      }
    } catch (err) {
      console.error(err);
      setError(t("common.failedToDeleteConversation"));
    }
  }
  async function handleDeleteMessage(messageId) {
    if (!messageId) return;
    const confirmed = window.confirm(t("common.deleteThisMessage"));
    if (!confirmed) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/chat/messages/${messageId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMessages(prev => prev.filter(message => message._id !== messageId));
    } catch (err) {
      console.error(err);
      setError(t("common.failedToDeleteMessage"));
    }
  }
  async function handleSaveEdit(messageId) {
    if (!messageId || !editDraft.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`http://localhost:3000/chat/messages/${messageId}`, {
        content: editDraft
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMessages(prev => prev.map(message => message._id === messageId ? {
        ...message,
        content: res.data.data.content
      } : message));
      setEditingMessageId(null);
      setEditDraft("");
    } catch (err) {
      console.error(err);
      setError(t("common.failedToUpdateMessage"));
    }
  }
  function toggleMessageMenu(event, messageId) {
    if (actionMenuId === messageId) {
      setActionMenuId(null);
      setMessageMenuPosition(null);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const menuWidth = 188;
    const menuHeight = 100;
    const viewportPadding = 8;
    const left = Math.min(window.innerWidth - menuWidth - viewportPadding, Math.max(viewportPadding, rect.right - menuWidth));
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow >= menuHeight + viewportPadding ? rect.bottom + 6 : Math.max(viewportPadding, rect.top - menuHeight - 6);
    setEditingMessageId(null);
    setActionMenuId(messageId);
    setMessageMenuPosition({
      left,
      top
    });
  }
  function handleMessageMenuKeyDown(event) {
    const items = [...event.currentTarget.querySelectorAll("[role='menuitem']")];
    const currentIndex = items.indexOf(document.activeElement);
    let nextIndex = null;
    if (event.key === "ArrowDown") nextIndex = (currentIndex + 1) % items.length;
    if (event.key === "ArrowUp") nextIndex = (currentIndex - 1 + items.length) % items.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = items.length - 1;
    if (nextIndex !== null) {
      event.preventDefault();
      items[nextIndex]?.focus();
    }
  }
  function handleClearChat() {
    if (!selectedConversation?._id) return;
    const confirmed = window.confirm(t("common.clearChatConfirm"));
    if (!confirmed) return;
    setMessages([]);
    setConversations(prev => prev.map(conversation => conversation._id === selectedConversation._id ? {
      ...conversation,
      lastMessage: null
    } : conversation));
    setChatMenuOpen(false);
  }
  function handleBlockUser() {
    if (!selectedConversation?.participant?._id) return;
    const confirmed = window.confirm(t("common.blockUserConfirm"));
    if (!confirmed) return;
    const blockedUsers = JSON.parse(localStorage.getItem("blockedUsers") || "[]");
    const nextBlockedUsers = [...new Set([...blockedUsers, selectedConversation.participant._id])];
    localStorage.setItem("blockedUsers", JSON.stringify(nextBlockedUsers));
    const nextConversations = conversations.filter(conversation => conversation._id !== selectedConversation._id);
    setConversations(nextConversations);
    const fallback = nextConversations[0] || null;
    setMessages([]);
    setSelectedConversation(fallback);
    navigate(fallback ? `/chat/${fallback._id}` : "/chat");
    setChatMenuOpen(false);
  }
  const currentUserId = localStorage.getItem("userId");
  const visibleConversations = conversations.filter(conversation => {
    const participant = conversation.participant;
    const haystack = `${participant?.name || ""} ${participant?.username || ""} ${conversation.lastMessage?.content || ""}`.toLowerCase();
    return haystack.includes(conversationSearch.trim().toLowerCase());
  });
  if (loading) {
    return <PageLoader message={t("common.loadingChats")} />;
  }
  return <main className="chat-list-page">
      <div className={`chat-list-shell ${selectedConversation ? "has-active-chat" : ""}`}>
        <aside className="chat-sidebar" aria-label={t("common.messages")}>
          <div className="chat-sidebar-header">
            <div><span className="chat-sidebar-kicker">{t("chat.injaz")}</span><h1>{t("common.messages")}</h1></div>
          </div>

          <label className="conversation-search"><span className="sr-only">{t("common.search")}</span><Icon name="search" size={18} /><input type="search" value={conversationSearch} onChange={event => setConversationSearch(event.target.value)} placeholder={t("chat.searchConversations")} /></label>

          {conversations.length === 0 ? <div className="empty-card">{t("common.noMessages")}</div> : visibleConversations.length === 0 ? <div className="chat-sidebar-empty">{t("common.noServicesFound")}</div> : <div className="conversation-list">{visibleConversations.map(conversation => {
            const participant = conversation.participant;
            const participantName = participant?.name || participant?.username || t("common.user");
            const preview = conversation.lastMessage?.content || conversation.lastMessage?.attachment?.name || t("common.noMessages");
            return <div key={conversation._id} className={`conversation-item ${selectedConversation?._id === conversation._id ? "active" : ""}`}>

                  <button type="button" className="conversation-select-button" onClick={() => {
                setMessages([]);
                setSelectedConversation(conversation);
                navigate(`/chat/${conversation._id}`);
              }} aria-label={`${t("common.openChat")} ${participantName}`}>

                    <img src={participant?.avatarUrl || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWC-v0HrKYp0-av4D0eTZv5hoIHoW35GhmKG2djTVP4Q&s"} alt={participantName} className="conversation-avatar" />


                    <div className="conversation-content">
                      <span className="conversation-title-row"><strong dir="auto">{participantName}</strong>{conversation.lastMessage?.createdAt && <time>{new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}</time>}</span>
                      <span dir="auto">{preview}</span>
                    </div>
                  </button>

                  {conversation.unreadCount > 0 && <span className="conversation-unread" aria-label={`${conversation.unreadCount} ${t("common.unread")}`}>{conversation.unreadCount}</span>}
                </div>;
          })}</div>}
        </aside>

        <section className="chat-main-panel">
          {!selectedConversation ? <div className="empty-chat-state">
              <div className="empty-chat-mark" aria-hidden="true"><Icon name="message" size={32} /></div><h2>{t("common.selectChat")}</h2><p>{t("chat.chooseAConversationToViewMessagesAnd")}</p>
            </div> : <>
              <header className="chat-header-row">
                <button type="button" className="chat-mobile-back" onClick={() => {
              setMessages([]);
              setSelectedConversation(null);
              navigate("/chat");
            }} aria-label={t("chat.backToConversations")}><Icon name="arrow" /></button>
                <button type="button" className="chat-user-header chat-profile-trigger" onClick={() => selectedConversation?.participant?._id && navigate(`/profile/${selectedConversation.participant._id}`)} aria-label={`${t("common.viewProfile")} ${selectedConversation.participant?.name || selectedConversation.participant?.username || t("common.user")}`}>

                  <img src={selectedConversation.participant?.avatarUrl || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWC-v0HrKYp0-av4D0eTZv5hoIHoW35GhmKG2djTVP4Q&s"} alt={selectedConversation.participant?.username || t("common.user")} className="chat-avatar-small" />

                  <div>
                    <h3>
                      {selectedConversation.participant?.name || selectedConversation.participant?.username || t("common.user")}
                    </h3>
                    <span>{t("common.directMessage")}</span>
                  </div>
                </button>

                <div className="chat-header-actions">
                  {selectedConversation.participant?._id && <Link to={`/profile/${selectedConversation.participant._id}`} className="chat-view-profile">{t("common.viewProfile")}</Link>}

                  <div className="chat-more-menu-wrap">
                    <button type="button" className="chat-more-button" onClick={() => setChatMenuOpen(open => !open)} aria-label={t("chat.openChatActions")}>

                      <span aria-hidden="true">•••</span>
                    </button>

                    {chatMenuOpen && <div className="chat-more-menu">
                        <button type="button" onClick={handleClearChat}>
                          {t("common.clearChat")}
                        </button>
                        <button type="button" onClick={() => handleDeleteConversation(selectedConversation._id)}>

                          {t("common.deleteChat")}
                        </button>
                        <button type="button" onClick={handleBlockUser}>
                          {t("common.blockUser")}
                        </button>
                      </div>}
                  </div>
                </div>
              </header>

              <div className="chat-history-panel" ref={historyRef} aria-live="polite">
                {messages.length === 0 ? <p className="no-messages">{t("common.noMessages")}</p> : messages.map(message => {
              const myMessage = String(message.sender?._id || message.sender) === String(currentUserId);
              return <div key={message._id} className={`chat-message ${myMessage ? "mine" : ""}`}>

                        <div className={`chat-message-bubble ${editingMessageId === message._id ? "is-editing" : ""} ${myMessage && editingMessageId !== message._id ? "has-message-menu" : ""}`} dir="auto">

                          {myMessage && editingMessageId !== message._id && <button ref={node => {
                    if (node) messageMenuButtonRefs.current.set(message._id, node);else messageMenuButtonRefs.current.delete(message._id);
                  }} type="button" className="chat-message-menu-button" onClick={event => toggleMessageMenu(event, message._id)} aria-label={t("chat.messageActions")} aria-haspopup="menu" aria-expanded={actionMenuId === message._id} aria-controls={actionMenuId === message._id ? "message-actions-menu" : undefined}>

                              <Icon name="moreVertical" size={17} />
                            </button>}
                          {editingMessageId === message._id ? <div className="chat-edit-box" dir={t("chat.ltr")}>
                              <label className="sr-only" htmlFor={`edit-message-${message._id}`}>
                                {t("common.editMessage")}
                              </label>
                              <textarea id={`edit-message-${message._id}`} rows="3" value={editDraft} onChange={event => setEditDraft(event.target.value)} dir="auto" />

                              <div className="chat-edit-actions">
                                <button type="button" className="chat-edit-cancel" onClick={() => {
                        setEditingMessageId(null);
                        setEditDraft("");
                        setActionMenuId(null);
                      }}>

                                  {t("common.cancel")}
                                </button>
                                <button type="button" className="chat-edit-save" onClick={() => handleSaveEdit(message._id)} disabled={!editDraft.trim()}>

                                  {t("common.save")}
                                </button>
                              </div>
                            </div> : <>
                              <div className="chat-message-content" dir="auto">
                                {message.content && <p>{message.content}</p>}
                                {message.attachment && (message.attachment.mimeType?.startsWith("image/") ? <a href={message.attachment.url} target="_blank" rel="noreferrer" className="chat-image-attachment" aria-label={`${t("chat.open")} ${message.attachment.name}`}>
                                      <img src={message.attachment.url} alt={message.attachment.name} />
                                    </a> : <a href={message.attachment.url} target="_blank" rel="noreferrer" className="chat-file-attachment" download>
                                      <Icon name="file" size={22} />
                                      <span><strong>{message.attachment.name}</strong><small>{formatFileSize(message.attachment.size)} · {t("chat.openDownload")}</small></span>
                                    </a>)}
                              </div>
                              <div className="chat-message-meta" aria-label={t("chat.messageTime")}>
                                <time className="chat-message-time" dateTime={message.createdAt}>
                                  {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                                </time>
                              </div>
                            </>}
                        </div>
                      </div>;
            })}
              </div>

              <div className="chat-composer-wrap">
                {attachment && <div className="chat-attachment-preview">{attachmentPreviewUrl ? <img src={attachmentPreviewUrl} alt="" /> : <Icon name="file" size={20} />}<span><strong>{attachment.name}</strong><small>{formatFileSize(attachment.size)}</small></span><button type="button" onClick={() => {
                setAttachment(null);
                if (attachmentInputRef.current) attachmentInputRef.current.value = "";
              }} aria-label={t("chat.removeAttachment")}><Icon name="close" size={16} /></button></div>}
                {emojiPickerOpen && <div ref={emojiPickerRef} className="chat-emoji-picker" dir={t("chat.ltr")}>
                    <EmojiPicker onEmojiClick={insertEmoji} theme={theme === "dark" ? Theme.DARK : Theme.LIGHT} width="100%" height="min(420px, calc(100dvh - 190px))" lazyLoadEmojis searchPlaceHolder={t("chat.searchEmoji")} previewConfig={{
                showPreview: false
              }} />

                  </div>}
              <form onSubmit={handleSendMessage} className="chat-input-form">
                <input ref={attachmentInputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,.doc,.docx,text/plain" onChange={handleAttachmentChange} />
                <button type="button" className="chat-composer-action" onClick={() => attachmentInputRef.current?.click()} aria-label={t("chat.attachAFile")}><Icon name="paperclip" /></button>
                <textarea ref={composerRef} rows="1" value={draft} onChange={event => {
                setDraft(event.target.value);
                requestAnimationFrame(resizeComposer);
              }} onKeyDown={event => {
                if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }} placeholder={t("common.typeMessageHere")} className="chat-input" dir="auto" />

                <button type="button" className="chat-composer-action chat-emoji-button" onClick={() => setEmojiPickerOpen(open => !open)} aria-label={t("chat.chooseEmoji")} aria-expanded={emojiPickerOpen}><Icon name="smile" /></button>
                <button type="submit" className="chat-send-button" disabled={sending || !draft.trim() && !attachment} aria-label={t("common.send")} aria-busy={sending}>
                  <Icon name="arrow" />
                </button>
              </form>
              </div>
            </>}

          {error && <div className="error-state">{error}</div>}
        </section>
      </div>
      {actionMenuId && messageMenuPosition && createPortal(<div ref={messageMenuRef} id="message-actions-menu" className="chat-message-menu" role="menu" aria-label={t("chat.messageActions")} dir={t("chat.ltr")} style={messageMenuPosition} onKeyDown={handleMessageMenuKeyDown}>

          {messages.find(item => item._id === actionMenuId)?.content && <button type="button" role="menuitem" onClick={() => {
        const message = messages.find(item => item._id === actionMenuId);
        if (!message) return;
        setEditingMessageId(message._id);
        setEditDraft(message.content);
        setActionMenuId(null);
        setMessageMenuPosition(null);
      }}>

              <Icon name="edit" size={17} />
              {t("common.editMessage")}
            </button>}
          <button type="button" role="menuitem" className="danger" onClick={() => {
        const messageId = actionMenuId;
        setActionMenuId(null);
        setMessageMenuPosition(null);
        handleDeleteMessage(messageId);
      }}>

            <Icon name="trash" size={17} />
            {t("common.deleteMessage")}
          </button>
        </div>, document.body)}
    </main>;
}
export default ChatPage;
import { useTranslation } from "react-i18next";
