export const LEGAL_NOTICE_DEFAULT = "Notice: this is a platform policy template, not legal advice. Have it reviewed by a qualified legal professional before production use.";

export function formatEffectiveDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
}

export default function AgreementDocument({ agreement, notice, scrollable, onScrolledToEnd }) {
  if (!agreement) return null;
  return (
    <article className="legal-document-wrap">
      <p className="section-label">Buyer & Seller Agreement</p>
      <h2>{agreement.title}</h2>
      <p className="legal-meta">
        Version {agreement.version}
        {agreement.effectiveDate ? ` · Effective ${formatEffectiveDate(agreement.effectiveDate)}` : ""}
        {agreement.status ? ` · ${agreement.status}` : ""}
      </p>
      <p className="legal-notice">{notice || LEGAL_NOTICE_DEFAULT}</p>
      <div
        className={scrollable ? "agreement-content" : "legal-document"}
        {...(scrollable ? { tabIndex: 0, role: "region", "aria-label": "Full agreement text", onScroll: e => { const el = e.currentTarget; if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) onScrolledToEnd?.(); } } : {})}
      >
        <pre>{agreement.content}</pre>
      </div>
    </article>
  );
}
