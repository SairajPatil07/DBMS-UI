import { useState, useEffect } from 'react';
import { CreditCard, IndianRupee, Printer, Plus, X } from 'lucide-react';
import { getPayments, addPayment, getMembersList } from '../services';

const Payments = () => {
  const [payments, setPayments]       = useState([]);
  const [members, setMembers]         = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading]         = useState(true);
  const [isAddOpen, setIsAddOpen]     = useState(false);
  const [form, setForm] = useState({ member_id: '', amount: '', payment_mode: 'Cash' });

  const key = (obj, k) => obj[k] || obj[k.toUpperCase()] || '';

  const fetchPayments = async () => {
    setLoading(true);
    const data = await getPayments(filterStatus);
    setPayments(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchPayments(); }, [filterStatus]);

  useEffect(() => {
    getMembersList().then(d => setMembers(Array.isArray(d) ? d : []));
  }, []);

  const handleAddPayment = async (e) => {
    e.preventDefault();
    await addPayment(form.member_id, form.amount, form.payment_mode);
    alert('✅ Payment recorded! Member status auto-updated to Active (DB Transaction).');
    setIsAddOpen(false);
    fetchPayments();
  };

  return (
    <div className="payments-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payments &amp; Billing</h1>
          <p className="text-secondary" style={{ marginTop:'6px' }}>JOIN: Payments + Members + Plans — Transaction updates Members.status</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAddOpen(true)}>
          <IndianRupee size={20}/> Record Payment
        </button>
      </div>

      <div className="members-controls card mb-6">
        <div className="filter-box">
          <CreditCard size={20} color="var(--text-secondary)"/>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="All">All Transactions</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      <div className="table-container card">
        {loading ? (
          <p className="text-center text-secondary py-6">Loading from Oracle DB...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice ID</th><th>Member</th><th>Plan</th>
                <th>Date</th><th>Amount</th><th>Mode</th><th>Status</th><th>Print</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((pay, idx) => (
                <tr key={key(pay,'payment_id')} className="table-row">
                  <td>INV-{1000 + parseInt(key(pay,'payment_id') || idx)}</td>
                  <td className="font-medium">{key(pay,'member_name')}</td>
                  <td>{key(pay,'plan_name') || '—'}</td>
                  <td>{key(pay,'payment_date')?.toString().split('T')[0]}</td>
                  <td className="font-bold">₹{key(pay,'amount')}</td>
                  <td>{key(pay,'payment_mode')}</td>
                  <td>
                    <span className={`status-badge ${key(pay,'status').toLowerCase() === 'paid' ? 'status-active' : 'status-expiring-soon'}`}>
                      {key(pay,'status')}
                    </span>
                  </td>
                  <td>
                    <button className="icon-btn text-secondary"><Printer size={18}/></button>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan="8" className="text-center py-6 text-secondary">No payments found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Payment Modal */}
      {isAddOpen && (
        <div className="modal-overlay" onClick={() => setIsAddOpen(false)}>
          <div className="modal-content" style={{ maxWidth:'440px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Record New Payment</h2>
              <button className="close-btn" onClick={() => setIsAddOpen(false)}><X size={22}/></button>
            </div>
            <div className="card mb-4" style={{ backgroundColor:'rgba(255,179,0,0.08)', borderColor:'var(--status-warning)', padding:'12px' }}>
              <p style={{ fontSize:'0.85rem', color:'var(--status-warning)' }}>
                💡 This will INSERT into Payments table AND run an UPDATE on Members.status → Active
              </p>
            </div>
            <form onSubmit={handleAddPayment} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              <select required value={form.member_id} onChange={e => setForm({...form, member_id: e.target.value})}>
                <option value="">Select Member</option>
                {members.map(m => (
                  <option key={key(m,'member_id')} value={key(m,'member_id')}>
                    {key(m,'name')} — {key(m,'status')}
                  </option>
                ))}
              </select>
              <input required type="number" placeholder="Amount (₹)" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})}/>
              <select value={form.payment_mode} onChange={e => setForm({...form, payment_mode: e.target.value})}>
                <option>Cash</option><option>UPI</option><option>Card</option><option>Net Banking</option>
              </select>
              <button type="submit" className="btn btn-primary w-full">Save &amp; Update Member Status</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
