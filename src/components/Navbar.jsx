import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import AuthModal from "./AuthModal";
import Icon from "./Icon";
import { getNotifications, markAsRead, markAllAsRead } from "../services/notificationService";
function Navbar() {
  const {
    logout,
    user
  } = useAuth();
  const {
    theme,
    setTheme,
    language,
    setLanguage
  } = useSettings();
  const {
    t
  } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const navClass = path => location.pathname === path || path !== "/" && location.pathname.startsWith(path) ? "nav-active" : "";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const dropdownRef = useRef(null);
  const chatDropdownRef = useRef(null);
  const accountRef = useRef(null);
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
            Authorization: `Bearer ${token}`
          }
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
      if (chatDropdownRef.current && !chatDropdownRef.current.contains(event.target)) {
        setChatOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target)) setAccountOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  async function handleNotificationClick(notif) {
    if (!notif.isRead) {
      try {
        await markAsRead(notif._id);
        // Move from unread to read history
        setUnreadNotifications(prev => prev.filter(item => item._id !== notif._id));
        setReadNotifications(prev => [{
          ...notif,
          isRead: true
        }, ...prev]);
        setUnreadCount(prev => Math.max(0, prev - 1));
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
      setReadNotifications(prev => [...unreadNotifications.map(n => ({
        ...n,
        isRead: true
      })), ...prev]);
      setUnreadNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  }
  async function handleChatOpen(conversation) {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:3000/chat/conversations/${conversation._id}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error("Error marking chat as read:", err);
    }
    setChatOpen(false);
    navigate(`/chat/${conversation._id}`);
  }
  return <>
      <nav className="navbar" aria-label={t("navbar.primaryNavigation")}>
        <Link to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>

          <div className="Injaz-brand">
            <img src="/src/assets/INJAZ-LOGO-tran.svg" className="injaz-logo" alt={t("navbar.injazLogo")} />

          </div>
        </Link>

        <button type="button" className="mobile-menu-toggle" onClick={() => setMenuOpen(value => !value)} aria-expanded={menuOpen} aria-controls="primary-menu" aria-label={menuOpen ? t("navbar.closeMenu") : t("navbar.openMenu")}>
          <Icon name={menuOpen ? "close" : "menu"} size={24} />
        </button>

        <div id="primary-menu" className={`navbar-links ${menuOpen ? "mobile-open" : ""}`} onClick={event => {
        if (event.target.closest("a")) setMenuOpen(false);
      }}>
          <Link to="/" className={navClass("/")} aria-current={location.pathname === "/" ? "page" : undefined}>{t("common.home")}</Link>
          <Link to="/services" className={navClass("/services")} aria-current={location.pathname.startsWith("/services") ? "page" : undefined}>{t("common.services")}</Link>

          <div className="settings-controls">
            <button type="button" className="theme-toggle" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label={t("common.switchToDarkMode")} title={theme === "dark" ? t("common.switchToLightMode") : t("common.switchToDarkMode")}>

              <Icon name={theme === "dark" ? "sun" : "moon"} />
            </button>

            <div className="language-switcher" aria-label={t("language.selector")}>
              <button type="button" onClick={() => setLanguage("en")} aria-pressed={language === "en"}>{t("language.english")}</button>
              <span aria-hidden="true">|</span>
              <button type="button" onClick={() => setLanguage("ar")} aria-pressed={language === "ar"}>{t("language.arabic")}</button>
            </div>
          </div>

          {user ? <>
              {user?.role === "admin" && <Link to="/admin" className={navClass("/admin")}>{t("navbar.admin")}</Link>}
              <Link to="/dashboard" className={navClass("/dashboard")}>{t("common.dashboard")}</Link>

              {/* Chat Dropdown */}
              <div ref={chatDropdownRef} className="notification-wrap">
                <button type="button" className="notification-button chat-button" onClick={() => setChatOpen(!chatOpen)} aria-label={t("common.unreadChats")}>

                  <Icon name="message" />
                  {chatCount > 0 && <span className="notification-badge">{chatCount}</span>}
                </button>

                {chatOpen && <div className="notification-dropdown">
                    <div className="notification-header">
                      <span>{t("common.unreadChats")}</span>
                    </div>

                    <div className="notification-list">
                      {chatUnread.length === 0 ? <p className="empty-notification">
                          {t("common.noUnreadChats")}
                        </p> : chatUnread.map(chat => <div key={chat._id} className="notification-item unread" onClick={() => handleChatOpen(chat)}>

                            <div className="notification-title">
                              {chat.participant?.name || chat.participant?.username}
                            </div>
                            <div className="notification-message">
                              {chat.lastMessage?.content || t("common.messages")}
                            </div>
                            <div className="notification-time">
                              {chat.unreadCount} {t("common.unread")}
                            </div>
                          </div>)}
                    </div>
                  </div>}
              </div>

              <Link to="/chat" className={`nav-chat-link ${navClass("/chat")}`}>
                {t("common.chat")}
              </Link>

              {user.isSeller && <Link to="/services/create">{t("common.createService")}</Link>}

              {/* Notifications Dropdown */}
              <div ref={dropdownRef} className="notification-wrap">
                <button type="button" onClick={() => setIsOpen(!isOpen)} className="notification-button" aria-label={t("navbar.notifications")}>

                  <Icon name="bell" />
                  {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                </button>

                {isOpen && <div className="notification-dropdown">
                    <div className="notification-header">
                      <span>{t("common.notifications")}</span>
                      {unreadNotifications.length > 0 && <button type="button" onClick={handleMarkAllRead} className="mark-read-btn">

                          {t("common.markAllRead")}
                        </button>}
                    </div>

                    <div className="notification-tabs">
                      <button type="button" onClick={() => setActiveTab("unread")} className={activeTab === "unread" ? "active" : ""}>

                        {t("common.unread")} ({unreadNotifications.length})
                      </button>
                      <button type="button" onClick={() => setActiveTab("history")} className={activeTab === "history" ? "active" : ""}>

                        {t("common.history")} ({readNotifications.length})
                      </button>
                    </div>

                    <div className="notification-list">
                      {activeTab === "unread" ? unreadNotifications.length === 0 ? <p className="empty-notification">{t("common.noUnread")}</p> : unreadNotifications.map(notif => <div key={notif._id} onClick={() => handleNotificationClick(notif)} className="notification-item unread">

                              <div className="notification-title">
                                {notif.title}
                              </div>
                              <div className="notification-message">
                                {notif.message}
                              </div>
                              <div className="notification-time">
                                {new Date(notif.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                              </div>
                            </div>) : readNotifications.length === 0 ? <p className="empty-notification">{t("common.noHistory")}</p> : readNotifications.map(notif => <div key={notif._id} onClick={() => handleNotificationClick(notif)} className="notification-item">

                            <div className="notification-title">
                              {notif.title}
                            </div>
                            <div className="notification-message">
                              {notif.message}
                            </div>
                            <div className="notification-time">
                              {new Date(notif.createdAt).toLocaleDateString()}{" "}
                              {new Date(notif.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                            </div>
                          </div>)}
                    </div>
                  </div>}
              </div>

              <div className="account-menu-wrap" ref={accountRef}>
                <button type="button" className="account-menu-trigger" onClick={() => setAccountOpen(value => !value)} aria-expanded={accountOpen} aria-controls="account-menu" aria-label={t("navbar.accountMenu")}>
                  <img src={user?.avatarUrl || "https://via.placeholder.com/40"} alt="" />
                  <span>{user?.username || t("common.user")}</span>
                </button>
                {accountOpen && <div className="account-menu" id="account-menu"><div className="account-menu-identity"><strong dir="auto">{user?.username}</strong><span dir="ltr">{user?.email}</span></div><Link to="/my-profile">{t("common.viewProfile")}</Link>{user?.isSeller && <Link to="/payment-details">{t("navbar.paymentDetails")}</Link>}<button type="button" onClick={handleSignOut}>{t("common.signOut")}</button></div>}
              </div>
            </> : <>
              <button type="button" className="auth-link-button" onClick={() => {
            setAuthMode("sign-up");
            setAuthOpen(true);
          }}>

                {t("common.signUp")}
              </button>
              <button type="button" className="auth-link-button" onClick={() => {
            setAuthMode("sign-in");
            setAuthOpen(true);
          }}>

                {t("common.signIn")}
              </button>
            </>}
        </div>
      </nav>
      {menuOpen && <button type="button" className="mobile-menu-scrim" onClick={() => setMenuOpen(false)} aria-label={t("navbar.closeMenu")} />}

      <AuthModal key={`${authMode}-${authOpen ? "open" : "closed"}`} isOpen={authOpen} initialMode={authMode} onClose={() => setAuthOpen(false)} />

    </>;
}
export default Navbar;
import { useTranslation } from "react-i18next";
