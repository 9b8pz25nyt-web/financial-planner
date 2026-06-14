import Head from 'next/head';
import { useState, useEffect } from 'react';

// Pastel theme constants
const colors = {
  bg: '#FFF0F5',
  card: '#FFFFFF',
  border: '#FADADD',
  darkBorder: '#E6A8B2',
  primary: '#FFB7C5',
  text: '#E6A8B2' 
};

const fontStyle = { fontFamily: '"Mali", cursive', color: colors.text };
const inputStyle = { 
  ...fontStyle, 
  padding: '8px', 
  borderRadius: '10px', 
  border: `1px solid ${colors.border}`,
  color: colors.text 
};

const MonthRow = ({ month, incomes, onAdd, onDelete, selectedYear }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [displayAmount, setDisplayAmount] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState(''); // Added link state
  const monthData = incomes.filter(i => i.month === month && i.year === selectedYear);

  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/,/g, '');
    if (!isNaN(Number(rawValue))) {
      setDisplayAmount(rawValue ? Number(rawValue).toLocaleString() : '');
    }
  };

  return (
    <div style={{ margin: '5px 0', border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '10px', backgroundColor: colors.card, ...fontStyle }}>
      <div onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer', color: colors.primary, fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
        <span>{month}</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </div>
      {isOpen && (
        <div style={{ marginTop: '8px' }}>
          {monthData.map(i => (
            <div key={i.id} style={{ border: `1px solid ${colors.darkBorder}`, borderRadius: '8px', padding: '8px', marginBottom: '5px', backgroundColor: '#FFFDFD' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span>{i.notes} (₱{Number(i.amount).toLocaleString()}) {i.link && <a href={i.link} target="_blank" style={{color: colors.darkBorder}}>🔗</a>}</span>
                <div>
                  <button onClick={() => { setDescription(i.notes); setDisplayAmount(i.amount.toLocaleString()); setLink(i.link || ''); onDelete(i.id); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', marginRight: '5px' }}>✏️</button>
                  <button onClick={() => onDelete(i.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <input placeholder="Amt" onChange={handleAmountChange} value={displayAmount} style={inputStyle} />
            <input placeholder="Description" onChange={(e) => setDescription(e.target.value)} value={description} style={inputStyle} />
            <input placeholder="Paste link" onChange={(e) => setLink(e.target.value)} value={link} style={inputStyle} />
            <button onClick={() => { onAdd(month, Number(displayAmount.replace(/,/g, '')), description, link); setDisplayAmount(''); setDescription(''); setLink(''); }} style={{ background: colors.primary, color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', ...fontStyle }}>Add/Save</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Home() {
  const [selectedYear, setSelectedYear] = useState(2026);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [target, setTarget] = useState(1000000);
  const [isEditing, setIsEditing] = useState(false);
  const [birLink, setBirLink] = useState('');

  useEffect(() => { const saved = localStorage.getItem('pinkWhaleData'); if (saved) setIncomes(JSON.parse(saved)); }, []);
  useEffect(() => { localStorage.setItem('pinkWhaleData', JSON.stringify(incomes)); }, [incomes]);

  const addIncome = (month, amount, notes, link) => setIncomes([...incomes, { id: Date.now(), month, amount, notes, link, year: selectedYear }]);
  const deleteIncome = (id) => setIncomes(incomes.filter(i => i.id !== id));
  
  const yearIncomes = incomes.filter(i => i.year === selectedYear);
  const total = yearIncomes.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const progress = Math.min((total / target) * 100, 100);

  const calcTax = (m1, m2, m3) => {
    const totalQ = yearIncomes.filter(i => [m1, m2, m3].includes(i.month)).reduce((s, i) => s + (Number(i.amount) || 0), 0);
    return Math.max(0, (totalQ - 250000) * 0.08);
  };

  const quarters = [
    { n: 'Q1', m: ['January', 'February', 'March'], tax: calcTax('January', 'February', 'March') },
    { n: 'Q2', m: ['April', 'May', 'June'], tax: calcTax('April', 'May', 'June') },
    { n: 'Q3', m: ['July', 'August', 'September'], tax: calcTax('July', 'August', 'September') },
    { n: 'Q4', m: ['October', 'November', 'December'], tax: calcTax('October', 'November', 'December') }
  ];

  return (
    <div style={{ padding: '20px', ...fontStyle, backgroundColor: colors.bg, maxWidth: '400px', margin: 'auto', minHeight: '100vh' }}>
      <Head><link href="https://fonts.googleapis.com/css2?family=Mali:wght@400;600;700&display=swap" rel="stylesheet" /></Head>
      
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: colors.border, padding: '10px', borderRadius: '15px', marginBottom: '10px' }}>
            <img src="/icon.svg" alt="Planner Icon" style={{ width: '60px', display: 'block' }} />
        </div>
        <h1 style={{ color: colors.primary, marginTop: '0' }}>My Financial Planner</h1>
      </div>
      
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} style={{ padding: '5px', borderRadius: '10px', border: `1px solid ${colors.border}`, ...inputStyle }}>
          {[2026, 2027, 2028].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div style={{ background: colors.card, padding: '15px', borderRadius: '20px', border: `2px solid ${colors.border}` }}>
        <p><strong>Total Income:</strong> ₱{total.toLocaleString()}</p>
        <div onClick={() => setIsEditing(true)}>
          {isEditing ? <input type="number" value={target} onChange={(e) => setTarget(Number(e.target.value))} onBlur={() => setIsEditing(false)} style={inputStyle} /> 
          : <p style={{ cursor: 'pointer', color: colors.primary }}><strong>Expected Income:</strong> ₱{target.toLocaleString()}</p>}
        </div>
        <div style={{ background: colors.border, height: '12px', borderRadius: '6px', overflow: 'hidden' }}><div style={{ width: `${progress}%`, height: '100%', background: colors.primary }} /></div>
        <input placeholder="Paste BIR COR Link here" onChange={(e) => setBirLink(e.target.value)} style={{ ...inputStyle, marginTop: '10px', width: '90%' }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
        <div style={{ background: colors.border, padding: '5px', borderRadius: '10px', marginRight: '10px' }}><img src="/tax.svg" alt="Tax" style={{ width: '30px', display: 'block' }} /></div>
        <h2 style={{ color: colors.primary, margin: 0 }}>Quarterly Tax Due</h2>
      </div>
      {quarters.map(q => (
        <div key={q.n} style={{ background: colors.card, padding: '10px', marginBottom: '5px', borderRadius: '15px', border: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between' }}>
          <strong>{q.n}: ₱{q.tax.toLocaleString()}</strong>
          <input placeholder="paste link" style={{ ...inputStyle, fontSize: '0.7rem', width: '70px', border: 'none', textAlign: 'right' }} />
        </div>
      ))}

      <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
        <div style={{ background: colors.border, padding: '5px', borderRadius: '10px', marginRight: '10px' }}><img src="/income.svg" alt="Income" style={{ width: '30px', display: 'block' }} /></div>
        <h2 style={{ color: colors.primary, margin: 0 }}>Monthly Income</h2>
      </div>
      {quarters.map(q => (
        <div key={q.n} style={{ background: colors.card, padding: '10px', borderRadius: '15px', marginBottom: '10px', border: `1px solid ${colors.border}` }}>
          <div style={{ color: colors.primary, fontWeight: 'bold' }}>{q.n} Total: ₱{yearIncomes.filter(i => q.m.includes(i.month)).reduce((s, i) => s + (Number(i.amount) || 0), 0).toLocaleString()}</div>
          {q.m.map(m => <MonthRow key={m} month={m} incomes={incomes} onAdd={addIncome} onDelete={deleteIncome} selectedYear={selectedYear} />)}
        </div>
      ))}
    </div>
  );
}