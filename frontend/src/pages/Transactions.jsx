import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import RoleRoute from '../components/RoleRoute';
import { getCampaignsAPI, getTransactionsAPI } from '../api/services';
import './FeaturePages.css';

/* ── Helpers ──────────────────────────────────────────────────── */
const fmtDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const inr = (n) => Number(n ?? 0).toLocaleString('en-IN');

const exportCSV = (transactions, campaignName) => {
  const header = ['Milestone Name', 'Amount Released (₹)', 'Released At', 'Released By'];
  const rows = transactions.map((t) => [
    `"${t.milestoneName ?? t.milestone?.name ?? ''}"`,
    t.amountReleased ?? t.amount ?? 0,
    `"${fmtDate(t.releasedAt)}"`,
    `"${t.releasedBy ?? ''}"`,
  ]);
  const total = transactions.reduce((s, t) => s + Number(t.amountReleased ?? t.amount ?? 0), 0);
  rows.push(['"TOTAL"', total, '""', '""']);

  const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `transactions-${campaignName ?? 'export'}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

/* ── Component ────────────────────────────────────────────────── */
const Transactions = () => {
  const [campaigns, setCampaigns]       = useState([]);
  const [campaignId, setCampaignId]     = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [loadingTx, setLoadingTx]       = useState(false);

  /* Load campaign list once */
  useEffect(() => {
    getCampaignsAPI()
      .then((res) => {
        const list = res?.data?.data;
        setCampaigns(Array.isArray(list) ? list : []);
      })
      .catch(() => toast.error('Failed to load campaigns'))
      .finally(() => setLoadingCampaigns(false));
  }, []);

  const loadTransactions = useCallback(async (id) => {
    setLoadingTx(true);
    setTransactions([]);
    try {
      const res = await getTransactionsAPI(id);
      const list = res?.data?.data;
      setTransactions(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Failed to load transactions');
    } finally {
      setLoadingTx(false);
    }
  }, []);

  const handleCampaignChange = (e) => {
    const id = e.target.value;
    setCampaignId(id);
    if (id) loadTransactions(id);
    else setTransactions([]);
  };

  const selectedCampaign = Array.isArray(campaigns)
    ? campaigns.find((c) => String(c.id) === String(campaignId))
    : undefined;
  const total = Array.isArray(transactions)
    ? transactions.reduce((s, t) => s + Number(t.amountReleased ?? t.amount ?? 0), 0)
    : 0;

  return (
    <RoleRoute roles={['ADMIN']}>
      <div className="page">

        <div className="page-header">
          <div>
            <h1 className="page-title">Transactions</h1>
            <p className="page-sub">Complete fund release history per campaign.</p>
          </div>
          {transactions.length > 0 && (
            <button
              id="export-csv-btn"
              className="fp-btn fp-btn-outline"
              onClick={() => exportCSV(transactions, selectedCampaign?.title ?? selectedCampaign?.name)}
            >
              ↓ Export CSV
            </button>
          )}
        </div>

        {/* Campaign Selector */}
        <div className="fp-selector-row">
          <label htmlFor="tx-campaign-select">Select Campaign</label>
          <select
            id="tx-campaign-select"
            value={campaignId}
            onChange={handleCampaignChange}
            disabled={loadingCampaigns}
          >
            <option value="">— Choose a campaign —</option>
            {(Array.isArray(campaigns) ? campaigns : []).map((c) => (
              <option key={c.id} value={c.id}>{c.title ?? c.name}</option>
            ))}
          </select>
        </div>

        {/* States */}
        {!campaignId && !loadingTx && (
          <div className="fp-empty">Select a campaign to view its transaction history.</div>
        )}
        {loadingTx && <div className="fp-loading">Loading transactions…</div>}
        {!loadingTx && campaignId && transactions.length === 0 && (
          <div className="fp-empty">No transactions recorded for this campaign yet.</div>
        )}

        {/* Table */}
        {transactions.length > 0 && (
          <div className="fp-table-wrapper">
            <table className="fp-table">
              <thead>
                <tr>
                  <th>Milestone Name</th>
                  <th>Amount Released</th>
                  <th>Released At</th>
                  <th>Released By</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t, i) => (
                  <tr key={t.id ?? i}>
                    <td>{t.milestoneName ?? t.milestone?.name ?? '—'}</td>
                    <td>₹{inr(t.amountReleased ?? t.amount)}</td>
                    <td>{fmtDate(t.releasedAt)}</td>
                    <td>{t.releasedBy ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="fp-table-total">
                  <td><strong>Total</strong></td>
                  <td><strong>₹{inr(total)}</strong></td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </RoleRoute>
  );
};

export default Transactions;
