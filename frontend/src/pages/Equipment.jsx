import { useState, useEffect } from 'react';
import { Plus, Settings, CheckCircle2 } from 'lucide-react';
import { getEquipment, updateEquipmentStatus } from '../services';

const Equipment = () => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);

  const key = (obj, k) => obj[k] || obj[k.toUpperCase()] || '';

  const fetchEquipment = async () => {
    setLoading(true);
    const data = await getEquipment();
    setEquipmentList(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchEquipment(); }, []);

  const toggleStatus = async (eq) => {
    const id       = key(eq,'equipment_id');
    const current  = key(eq,'status');
    const newStatus = current === 'Working' ? 'Maintenance' : 'Working';
    await updateEquipmentStatus(id, newStatus);
    fetchEquipment();
  };

  if (loading) return <div className="loading-state">Loading from Oracle DB...</div>;

  return (
    <div className="equipment-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Equipment Inventory</h1>
          <p className="text-secondary" style={{ marginTop:'6px' }}>UPDATE Equipment SET status — real Oracle DB write</p>
        </div>
        <button className="btn btn-primary"><Plus size={20}/> Add Equipment</button>
      </div>

      <div className="grid-cols-3" style={{ display:'grid', gap:'var(--spacing-6)' }}>
        {equipmentList.map(eq => (
          <div key={key(eq,'equipment_id')} className="card" style={{ minHeight:'180px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
            <div>
              <div className="flex-center" style={{ justifyContent:'space-between', marginBottom:'12px' }}>
                <span className="badge-outline text-secondary">{key(eq,'category')}</span>
                <span className={`status-badge ${key(eq,'status') === 'Working' ? 'status-active' : 'status-expiring-soon'}`}>
                  {key(eq,'status')}
                </span>
              </div>
              <h3>{key(eq,'name')}</h3>
              <p className="text-secondary mt-2" style={{ fontSize:'0.85rem' }}>ID: EQ-{1000 + parseInt(key(eq,'equipment_id'))}</p>
            </div>
            <button
              className={`btn mt-4 w-full ${key(eq,'status') === 'Working' ? 'btn-secondary' : 'btn-primary'}`}
              onClick={() => toggleStatus(eq)}
            >
              {key(eq,'status') === 'Working'
                ? <><Settings size={16}/> Send to Maintenance</>
                : <><CheckCircle2 size={16}/> Mark as Working</>
              }
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Equipment;
