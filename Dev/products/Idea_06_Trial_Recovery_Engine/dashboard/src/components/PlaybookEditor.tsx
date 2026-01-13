import { useState } from 'react';

interface Playbook {
  id: string;
  name: string;
  subject: string;
  body: string;
  offerType: 'discount' | 'extension' | 'consultation' | 'none';
}

const mockPlaybooks: Playbook[] = [
  {
    id: '1',
    name: 'Price Sensitive Recovery',
    subject: 'A little something to help with your decision',
    body: 'Hi {{name}}, I noticed you checked our pricing page...',
    offerType: 'discount'
  },
  {
    id: '2',
    name: 'Need More Time',
    subject: 'Need a few more days?',
    body: 'Hi {{name}}, building great things takes time...',
    offerType: 'extension'
  }
];

export const PlaybookEditor = () => {
  const [playbooks, setPlaybooks] = useState<Playbook[]>(mockPlaybooks);
  const [selectedId, setSelectedId] = useState<string | null>(mockPlaybooks[0].id);
  const [editForm, setEditForm] = useState<Playbook>(mockPlaybooks[0]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    const pb = playbooks.find(p => p.id === id);
    if (pb) setEditForm(pb);
  };

  const handleChange = (field: keyof Playbook, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setPlaybooks(prev => prev.map(p => p.id === editForm.id ? editForm : p));
    alert('Playbook saved!');
  };

  return (
    <section className="playbook-editor-section">
      <h2>Custom Playbook Editor 🎨</h2>
      <div className="editor-container">
        <div className="sidebar">
          <h3>Templates</h3>
          <ul>
            {playbooks.map(pb => (
              <li 
                key={pb.id} 
                className={selectedId === pb.id ? 'active' : ''}
                onClick={() => handleSelect(pb.id)}
              >
                {pb.name}
              </li>
            ))}
            <li className="add-new">+ New Template</li>
          </ul>
        </div>
        
        <div className="editor-main">
          <div className="form-group">
            <label>Playbook Name</label>
            <input 
              type="text" 
              value={editForm.name} 
              onChange={(e) => handleChange('name', e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label>Email Subject</label>
            <input 
              type="text" 
              value={editForm.subject}
              onChange={(e) => handleChange('subject', e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label>Offer Type</label>
            <select 
              value={editForm.offerType}
              onChange={(e) => handleChange('offerType', e.target.value as any)}
            >
              <option value="none">None</option>
              <option value="discount">Discount Coupon</option>
              <option value="extension">Trial Extension</option>
              <option value="consultation">Founder Call</option>
            </select>
          </div>

          <div className="form-group">
            <label>Email Body (Markdown)</label>
            <textarea 
              value={editForm.body}
              rows={10}
              onChange={(e) => handleChange('body', e.target.value)}
            />
            <small>Supports {'{{variables}}'} like name, trial_days, etc.</small>
          </div>

          <div className="actions">
            <button className="save-btn" onClick={handleSave}>Save Changes</button>
            <button className="preview-btn">Send Test Email</button>
          </div>
        </div>
      </div>
    </section>
  );
};
