import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import AuthModal from "./AuthModal";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../services/notificationService";

function Navbar() {
  const { logout, user } = useAuth();
  const { theme, setTheme, language, setLanguage, t } = useSettings();
  const navigate = useNavigate();

  function handleSignOut() {
    logout();
    navigate("/");
  }
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [readNotifications, setReadNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatUnread, setChatUnread] = useState([]);
  const [chatCount, setChatCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("sign-in");
  const [activeTab, setActiveTab] = useState("unread"); // "unread" | "history"
  const dropdownRef = useRef(null);
  const chatDropdownRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    async function fetchNotifs() {
      try {
        const data = await getNotifications();
        if (!isMounted) return;
        setUnreadNotifications(data.unread || []);
        setReadNotifications(data.read || []);
        setUnreadCount(data.totalUnread || 0);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    }

    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    async function fetchUnreadChats() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3000/chat/unread", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) return;

        const data = await response.json();
        const chatList = data.conversations || [];
        setChatUnread(chatList);
        setChatCount(chatList.length);
      } catch (err) {
        console.error("Error fetching unread chats:", err);
      }
    }

    fetchUnreadChats();
    const interval = setInterval(fetchUnreadChats, 10000);

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }

      if (
        chatDropdownRef.current &&
        !chatDropdownRef.current.contains(event.target)
      ) {
        setChatOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleNotificationClick(notif) {
    if (!notif.isRead) {
      try {
        await markAsRead(notif._id);
        // Move from unread to read history
        setUnreadNotifications((prev) =>
          prev.filter((item) => item._id !== notif._id),
        );
        setReadNotifications((prev) => [{ ...notif, isRead: true }, ...prev]);
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Error marking notification as read:", err);
      }
    }

    setIsOpen(false);

    if (notif.order?._id || notif.order) {
      const orderId = notif.order?._id || notif.order;
      navigate(`/workspace/${orderId}`);
    } else {
      navigate("/dashboard");
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllAsRead();
      setReadNotifications((prev) => [
        ...unreadNotifications.map((n) => ({ ...n, isRead: true })),
        ...prev,
      ]);
      setUnreadNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  }

  async function handleChatOpen(conversation) {
    try {
      const token = localStorage.getItem("token");
      await fetch(
        `http://localhost:3000/chat/conversations/${conversation._id}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } catch (err) {
      console.error("Error marking chat as read:", err);
    }

    setChatOpen(false);
    navigate(`/chat/${conversation._id}`);
  }

  return (
    <>
      <nav
        className="navbar"
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 20px",
        }}
      >
        <Link
          to="/"
          className="navbar-brand"
          style={{ textDecoration: "none" }}
        >
          <div className="Injaz-brand">
            <img
              src="src/assets/image.svg"
              className="injaz-logo"
              alt="Injaz Logo"
              style={{ height: "70px", width: "auto" }}
            />
          </div>
        </Link>

        <div className="navbar-links">
          <Link to="/">{t("home")}</Link>
          <Link to="/services">{t("services")}</Link>

          <div className="settings-controls">
            <button
              type="button"
              className="theme-toggle"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={t("switchToDarkMode")}
              title={
                theme === "dark"
                  ? t("switchToLightMode")
                  : t("switchToDarkMode")
              }
            >
              <span>{theme === "dark" ? "☀️" : "🌙"}</span>
            </button>

            <button
              type="button"
              className="theme-toggle"
              onClick={() => setLanguage(language === "en" ? "ar" : "en")}
              aria-label={
                language === "ar" ? t("switchToEnglish") : t("switchToArabic")
              }
              title={
                language === "ar" ? t("switchToEnglish") : t("switchToArabic")
              }
            >
              <span>{language === "en" ? "AR" : "EN"}</span>
            </button>
          </div>

          {user ? (
            <>
              {user?.role === "admin" && <Link to="/admin">Admin</Link>}
              <Link to="/dashboard">{t("dashboard")}</Link>

              {/* Chat Dropdown */}
              <div ref={chatDropdownRef} className="notification-wrap">
                <button
                  type="button"
                  className="notification-button chat-button"
                  onClick={() => setChatOpen(!chatOpen)}
                  aria-label={t("unreadChats")}
                >
                  💬
                  {chatCount > 0 && (
                    <span className="notification-badge">{chatCount}</span>
                  )}
                </button>

                {chatOpen && (
                  <div className="notification-dropdown">
                    <div className="notification-header">
                      <span>{t("unreadChats")}</span>
                    </div>

                    <div className="notification-list">
                      {chatUnread.length === 0 ? (
                        <p className="empty-notification">
                          {t("noUnreadChats")}
                        </p>
                      ) : (
                        chatUnread.map((chat) => (
                          <div
                            key={chat._id}
                            className="notification-item unread"
                            onClick={() => handleChatOpen(chat)}
                          >
                            <div className="notification-title">
                              {chat.participant?.name ||
                                chat.participant?.username}
                            </div>
                            <div className="notification-message">
                              {chat.lastMessage?.content || t("messages")}
                            </div>
                            <div className="notification-time">
                              {chat.unreadCount} {t("unread")}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Link to="/chat" className="nav-chat-link">
                {t("chat")}
              </Link>

              {user.isSeller && (
                <Link to="/services/create">{t("createService")}</Link>
              )}

              {/* Notifications Dropdown */}
              <div ref={dropdownRef} className="notification-wrap">
                <button
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                  className="notification-button"
                  aria-label="Notifications"
                >
                  🔔
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </button>

                {isOpen && (
                  <div className="notification-dropdown">
                    <div className="notification-header">
                      <span>{t("notifications")}</span>
                      {unreadNotifications.length > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="mark-read-btn"
                        >
                          {t("markAllRead")}
                        </button>
                      )}
                    </div>

                    <div className="notification-tabs">
                      <button
                        type="button"
                        onClick={() => setActiveTab("unread")}
                        className={activeTab === "unread" ? "active" : ""}
                      >
                        {t("unread")} ({unreadNotifications.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("history")}
                        className={activeTab === "history" ? "active" : ""}
                      >
                        {t("history")} ({readNotifications.length})
                      </button>
                    </div>

                    <div className="notification-list">
                      {activeTab === "unread" ? (
                        unreadNotifications.length === 0 ? (
                          <p className="empty-notification">{t("noUnread")}</p>
                        ) : (
                          unreadNotifications.map((notif) => (
                            <div
                              key={notif._id}
                              onClick={() => handleNotificationClick(notif)}
                              className="notification-item unread"
                            >
                              <div className="notification-title">
                                {notif.title}
                              </div>
                              <div className="notification-message">
                                {notif.message}
                              </div>
                              <div className="notification-time">
                                {new Date(notif.createdAt).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </div>
                            </div>
                          ))
                        )
                      ) : readNotifications.length === 0 ? (
                        <p className="empty-notification">{t("noHistory")}</p>
                      ) : (
                        readNotifications.map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => handleNotificationClick(notif)}
                            className="notification-item"
                          >
                            <div className="notification-title">
                              {notif.title}
                            </div>
                            <div className="notification-message">
                              {notif.message}
                            </div>
                            <div className="notification-time">
                              {new Date(notif.createdAt).toLocaleDateString()}{" "}
                              {new Date(notif.createdAt).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Link to={`/my-profile`} className="profile-avatar-link">
                <img
                  src={user?.avatarUrl || "https://via.placeholder.com/40"}
                  alt="Profile"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    display: "block",
                    border: "2px solid #ccc",
                  }}
                />
              </Link>

              <button type="button" className="auth-link-button" onClick={handleSignOut}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="auth-link-button"
                onClick={() => {
                  setAuthMode("sign-up");
                  setAuthOpen(true);
                }}
              >
                {t("signUp")}
              </button>
              <button
                type="button"
                className="auth-link-button"
                onClick={() => {
                  setAuthMode("sign-in");
                  setAuthOpen(true);
                }}
              >
                {t("signIn")}
              </button>
            </>
          )}
        </div>
      </nav>

      <AuthModal
        isOpen={authOpen}
        initialMode={authMode}
        onClose={() => setAuthOpen(false)}
      />
    </>
  );
}

export default Navbar;
