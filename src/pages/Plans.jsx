import { useState, useEffect } from 'react';
import { Check, Plus, Edit } from 'lucide-react';
import { getPlans, addPlan } from '../services';
import './Plans.css';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({ plan_name: '', duration_months: '', price: '', description: '' });

  const key = (obj, k) => obj[k] || obj[k.toUpperCase()] || '';

  const fetchPlans = async () => {
    setLoading(true);
    const data = await getPlans();
    setPlans(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await addPlan(form);
    setIsAddOpen(false);
    fetchPlans();
  };

  if (loading) return <div className="loading-state">Loading plans from Oracle DB...</div>;

  return (
    <div className="plans-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Membership Plans</h1>
          <p className="text-secondary" style={{ marginTop: '6px' }}>From Plans table — Referenced by Members.plan_id (FK)</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAddOpen(true)}>
          <Plus size={20}/> Create Plan
        </button>
      </div>

      <div className="plans-grid">
        {plans.map(plan => (
          <div key={key(plan,'plan_id')} className="plan-card card">
            <div className="plan-header">
              <h2>{key(plan,'plan_name')}</h2>
              <div className="plan-price">
                <span className="currency">₹</span>
                <span className="amount">{key(plan,'price')}</span>
                <span className="duration">/ {key(plan,'duration_months')} Mo.</span>
              </div>
            </div>
            <div className="plan-features">
              {key(plan,'description') ? key(plan,'description').split('.').filter(Boolean).map((f, i) => (
                <div key={i} className="feature-item">
                  <Check size={16} color="var(--status-active)"/>
                  <span>{f.trim()}</span>
                </div>
              )) : <p className="text-secondary">No description</p>}
            </div>
            <button className="btn btn-secondary w-full" style={{ marginTop: 'auto' }}>
              <Edit size={16}/> Edit Plan
            </button>
          </div>
        ))}
      </div>

      {/* Add Plan Modal */}
      {isAddOpen && (
        <div className="modal-overlay" onClick={() => setIsAddOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Plan</h2>
              <button className="close-btn" onClick={() => setIsAddOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleAdd} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              <input required placeholder="Plan Name (e.g. Gold)"    value={form.plan_name}        onChange={e => setForm({...form, plan_name: e.target.value})}/>
              <input required placeholder="Duration in Months"       value={form.duration_months}  onChange={e => setForm({...form, duration_months: e.target.value})} type="number"/>
              <input required placeholder="Price (₹)"                value={form.price}             onChange={e => setForm({...form, price: e.target.value})} type="number"/>
              <textarea placeholder="Description (features)"         value={form.description}       onChange={e => setForm({...form, description: e.target.value})} rows={3}/>
              <button type="submit" className="btn btn-primary w-full">INSERT into Plans Table</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plans;
