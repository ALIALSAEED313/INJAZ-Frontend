import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Icon from "./Icon";
import { askAiSupport } from "../services/supportService";

const TOPICS = [
  ["orders", "Orders & payments", "Track paid orders from Dashboard. Open an order workspace to review its status and timeline."],
  ["delivery", "Delivering work", "Sellers can attach delivery files from an active order workspace. Buyers can accept delivery or request a revision."],
  ["profile", "Account & profile", "Use the account menu to open your profile and update your public information."],
  ["reporting", "Reporting a problem", "Use the subtle Report action on a profile, service, or review. Reports are reviewed by marketplace admins."],
];
const SUGGESTIONS = ["deliver", "order", "payments", "report"];

export default function SupportWidget() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("quick");
  const [query, setQuery] = useState("");
  const [activeTopic, setActiveTopic] = useState(null);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const widgetRef = useRef(null);
  const conversationRef = useRef(null);
  const composerRef = useRef(null);

  useEffect(() => {
    function closeWidget(event) {
      if (event.key === "Escape") setOpen(false);
      if (event.type === "mousedown" && widgetRef.current && !widgetRef.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener("keydown", closeWidget);
    document.addEventListener("mousedown", closeWidget);
    return () => {
      document.removeEventListener("keydown", closeWidget);
      document.removeEventListener("mousedown", closeWidget);
    };
  }, []);

  useEffect(() => {
    if (mode === "ai") conversationRef.current?.scrollTo({ top: conversationRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, mode]);

  const matches = TOPICS.filter(([, label, answer]) => `${label} ${answer}`.toLowerCase().includes(query.toLowerCase()));

  async function sendQuestion(event, suggestedQuestion = "") {
    event?.preventDefault();
    const question = (suggestedQuestion || draft).trim();
    if (!question || loading) return;
    const previousMessages = messages.slice(-10);
    setMessages(current => [...current, { role: "user", content: question }]);
    setDraft("");
    if (composerRef.current) composerRef.current.style.height = "46px";
    setAiError("");
    setLoading(true);
    try {
      const data = await askAiSupport({ message: question, conversation: previousMessages, page: window.location.pathname });
      if (!data?.reply) throw new Error("Invalid AI response");
      setMessages(current => [...current, { role: "assistant", content: data.reply }]);
    } catch {
      setAiError(t("support.aiUnavailable", { defaultValue: "AI support is temporarily unavailable. You can still use Quick Help or contact support@injaz.com." }));
    } finally {
      setLoading(false);
    }
  }

  return <div className="support-widget" ref={widgetRef}>
    {open && <section className={`support-panel${mode === "ai" ? " support-panel--ai" : ""}`} id="injaz-support-panel" aria-labelledby="support-title">
      <header><div><span className="workspace-kicker">INJAZ</span><h2 id="support-title">{t("support.title", { defaultValue: "INJAZ Support" })}</h2></div><button type="button" onClick={() => setOpen(false)} aria-label={t("common.close")}><Icon name="close" /></button></header>
      <p>{t("support.prompt", { defaultValue: "How can we help?" })}</p>
      <div className="support-mode-tabs" role="tablist" aria-label={t("support.modes", { defaultValue: "Support options" })}>
        <button type="button" role="tab" aria-selected={mode === "quick"} className={mode === "quick" ? "active" : ""} onClick={() => setMode("quick")}>{t("support.quickHelp", { defaultValue: "Quick Help" })}</button>
        <button type="button" role="tab" aria-selected={mode === "ai"} className={mode === "ai" ? "active" : ""} onClick={() => setMode("ai")}><Icon name="sparkle" size={16} />{t("support.aiAssistant", { defaultValue: "AI Assistant" })}</button>
      </div>
      {mode === "quick" ? <div role="tabpanel">
        <label className="support-search"><span className="sr-only">{t("support.search", { defaultValue: "Search help" })}</span><Icon name="search" /><input type="search" value={query} onChange={event => { setQuery(event.target.value); setActiveTopic(null); }} placeholder={t("support.searchPlaceholder", { defaultValue: "Search help topics" })} /></label>
        <div className="support-topics">
          {matches.map(([key, label, answer]) => <button type="button" key={key} className={activeTopic === key ? "active" : ""} onClick={() => setActiveTopic(activeTopic === key ? null : key)}><span>{t(`support.topics.${key}`, { defaultValue: label })}</span><Icon name="chevronDown" size={17} />{activeTopic === key && <small>{t(`support.answers.${key}`, { defaultValue: answer })}</small>}</button>)}
          {!matches.length && <p className="support-empty">{t("support.noResults", { defaultValue: "No matching help topic." })}</p>}
        </div>
      </div> : <div className="support-ai" role="tabpanel">
        <div className="support-conversation" ref={conversationRef} aria-live="polite" aria-busy={loading}>
          {!messages.length && <>
            <div className="support-ai-intro"><span className="support-ai-mark"><Icon name="sparkle" size={22} /></span><strong>{t("support.injazAi", { defaultValue: "INJAZ AI" })}</strong><p>{t("support.askAiHint", { defaultValue: "Ask me anything about using INJAZ." })}</p></div>
            <div className="support-suggestions" aria-label={t("support.suggestedQuestions", { defaultValue: "Suggested questions" })}>
              <span>{t("support.suggestedQuestions", { defaultValue: "Suggested questions" })}</span>
              {SUGGESTIONS.map(key => <button type="button" key={key} disabled={loading} onClick={() => sendQuestion(null, t(`support.suggestions.${key}`))}>{t(`support.suggestions.${key}`)}</button>)}
            </div>
            <div className="support-message support-message--assistant" dir="auto"><span>{t("support.injazAi", { defaultValue: "INJAZ AI" })}</span><p>{t("support.welcome", { defaultValue: "Hi! How can I help you today?" })}</p></div>
          </>}
          {messages.map((message, index) => <div key={`${message.role}-${index}`} className={`support-message support-message--${message.role}`} dir="auto"><span>{message.role === "user" ? t("support.you", { defaultValue: "You" }) : t("support.assistant", { defaultValue: "INJAZ Support" })}</span><p>{message.content}</p></div>)}
          {loading && <div className="support-message support-message--assistant support-message--loading" role="status"><span>{t("support.injazAi", { defaultValue: "INJAZ AI" })}</span><p>{t("support.thinking", { defaultValue: "INJAZ AI is thinking…" })}<i aria-hidden="true"><b /><b /><b /></i></p></div>}
        </div>
        {aiError && <div className="support-ai-error" id="support-ai-error" role="alert"><div><strong>{t("support.aiStatusTitle", { defaultValue: "AI support is temporarily unavailable." })}</strong><span>{t("support.aiStatusHelp", { defaultValue: "Use Quick Help or contact support@injaz.com." })}</span></div><button type="button" onClick={() => setMode("quick")}>{t("support.useQuickHelp", { defaultValue: "Quick Help" })}</button></div>}
        <form className="support-composer" onSubmit={sendQuestion}>
          <label className="sr-only" htmlFor="support-ai-question">{t("support.typeQuestion", { defaultValue: "Type your support question" })}</label>
          <textarea ref={composerRef} id="support-ai-question" rows="1" maxLength="1000" value={draft} onChange={event => { setDraft(event.target.value); event.target.style.height = "46px"; event.target.style.height = `${Math.min(event.target.scrollHeight, 112)}px`; }} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendQuestion(); } }} placeholder={t("support.askPlaceholder", { defaultValue: "Ask INJAZ AI…" })} aria-describedby={aiError ? "support-ai-error" : undefined} />
          <button type="submit" disabled={loading || !draft.trim()} aria-label={t("support.send", { defaultValue: "Send question" })}><Icon name="arrow" /></button>
        </form>
      </div>}
      <a className="secondary-btn support-contact" href="mailto:support@injaz.com">{t("support.contact", { defaultValue: "Contact support" })}</a>
    </section>}
    <button type="button" className="support-trigger" aria-expanded={open} aria-controls="injaz-support-panel" aria-label={t("support.open", { defaultValue: "Open INJAZ Support" })} onClick={() => setOpen(value => !value)}><Icon name="message" size={24} /></button>
  </div>;
}
