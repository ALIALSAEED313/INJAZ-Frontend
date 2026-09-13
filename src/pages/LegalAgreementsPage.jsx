import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getAgreementById, getAgreementHistory, getAgreementStatus } from "../services/agreementService";
import { useAuth } from "../context/AuthContext";
import AgreementDocument from "../components/AgreementDocument";

export default function LegalAgreementsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [snapshot, setSnapshot] = useState(null);
  const [snapshotError, setSnapshotError] = useState("");
  useEffect(() => {
    let active = true;
    getAgreementStatus().then(value => { if (active) setData(value); }).catch(() => { if (active) setData({ error: "unavailable" }); });
    if (user) {
      getAgreementHistory().then(setHistory).catch(() => { if (active) setHistory([]); });
    } else {
      setHistory([]);
    }
    return () => { active = false; };
  }, [user]);
  const viewSnapshot = async id => {
    if (!id) return;
    setSnapshotError("");
    try { setSnapshot(await getAgreementById(id)); }
    catch { setSnapshot(null); setSnapshotError("That historical version is unavailable."); }
  };
  if (!data) return <main className="legal-page">Loading agreement…</main>;
  if (data.error || !data.agreement) return <main className="legal-page">{data.error || "No current agreement is published."}</main>;
  const { agreement, acceptance } = data;
  return <main className="legal-page"><p className="section-label">Settings · Legal & Agreements</p><h1>{agreement.title}</h1>
    <div className="legal-status">{acceptance ? <>Accepted version {acceptance.version} on {new Date(acceptance.acceptedAt).toLocaleString()}</> : "Acceptance is required before marketplace activity."}</div>
    <AgreementDocument agreement={agreement} />
    <section className="legal-history"><h2>My acceptance history</h2>{history.length === 0 ? <p>No acceptances recorded yet.</p> : <table className="admin-table"><thead><tr><th>Version</th><th>Accepted</th><th>Method</th><th>Actions</th></tr></thead><tbody>{history.map(h => <tr key={h._id}><td>{h.version}</td><td>{h.acceptedAt ? new Date(h.acceptedAt).toLocaleString() : ""}</td><td>{h.acceptanceMethod}</td><td><button type="button" onClick={() => viewSnapshot(h.agreement?._id || h.agreement)}>View version</button></td></tr>)}</tbody></table>}</section>
    {snapshotError && <p className="error">{snapshotError}</p>}
    {snapshot && <section className="agreement-preview"><button type="button" onClick={() => setSnapshot(null)}>Close version</button><AgreementDocument agreement={snapshot} /></section>}
  </main>;
}
