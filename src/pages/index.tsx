import Head from 'next/head';
import { useState, useEffect } from 'react';

const themes = {
  kawaii: {
    bg: 'linear-gradient(to bottom, #FFF0F5 0%, #E6E6FA 100%)',
    card: 'rgba(255, 255, 255, 0.75)',
    border: '#FADADD',
    darkBorder: '#C1667A', primary: '#FF9CB1', text: '#C1667A',
    icons: { icon: 'icon.svg', tax: 'tax.svg', income: 'income.svg', calendar: 'pink_calendar.png' }
  },
  pro: {
    bg: 'linear-gradient(to bottom, #E3F2FD 0%, #B2EBF2 100%)',
    card: 'rgba(255, 255, 255, 0.85)',
    border: '#B3E5FC',
    darkBorder: '#0288D1', primary: '#0288D1', text: '#01579B',
    icons: { icon: 'icon_blue.svg', tax: 'tax_blue.svg', income: 'income_blue.svg', calendar: 'blue_calendar.png' }
  }
};

const MonthRow = ({ month, incomes, onAdd, onDelete, onEdit, selectedYear, colors, fontStyle, inputStyle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [displayAmount, setDisplayAmount] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const monthData = incomes.filter(i => i.month === month && i.year === selectedYear);

  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/,/g, '');
    if (!isNaN(Number(raw))) {
      setDisplayAmount(raw ? Number(raw).toLocaleString() : '');
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
            <div key={i.id} style={{ border: `1px solid ${colors.darkBorder}`, borderRadius: '8px', padding: '8px', marginBottom: '5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <span>{i.notes} (₱{Number(i.amount).toLocaleString()}) {i.link && <a href={i.link} target="_blank" style={{color: colors.darkBorder}}>🔗</a>}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => { setDescription(i.notes); setDisplayAmount(i.amount.toLocaleString()); setLink(i.link || ''); onEdit(i.id); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>✏️</button>
                  <button onClick={() => onDelete(i.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <input placeholder="Amount" onChange={handleAmountChange} value={displayAmount} style={inputStyle} />
            <input placeholder="Source / Invoice #" onChange={(e) => setDescription(e.target.value)} value={description} style={inputStyle} />
            <input placeholder="Supporting Link" onChange={(e) => setLink(e.target.value)} value={link} style={inputStyle} />
            <button onClick={() => { onAdd(month, Number(displayAmount.replace(/,/g, '')), description, link); setDisplayAmount(''); setDescription(''); setLink(''); }} style={{ background: colors.primary, color: '#FFFFFF', fontWeight: 'bold', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer', ...fontStyle }}>Save Entry</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Home() {
  const [theme, setTheme] = useState('kawaii');
  const [selectedYear, setSelectedYear] = useState(2026);
  const [incomes, setIncomes] = useState<any[]>([]);
  // CHANGED: targets is now an object tracking each year
  const [targets, setTargets] = useState({ 2025: 1000000, 2026: 1000000, 2027: 1000000, 2028: 1000000 });
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [birLink, setBirLink] = useState('');
  
  const colors = themes[theme];
  const fontStyle = { fontFamily: '"Mali", cursive', color: colors.text };
  const inputStyle = { ...fontStyle, padding: '8px', borderRadius: '10px', border: `1px solid ${colors.darkBorder}`, color: colors.text, backgroundColor: '#FFF' };

  useEffect(() => { const saved = localStorage.getItem('taxPlannerData'); if (saved) setIncomes(JSON.parse(saved)); }, []);
  useEffect(() => { localStorage.setItem('taxPlannerData', JSON.stringify(incomes)); }, [incomes]);

  const addIncome = (month, amount, notes, link) => setIncomes([...incomes, { id: Date.now(), month, amount, notes, link, year: selectedYear }]);
  const deleteIncome = (id) => setIncomes(incomes.filter(i => i.id !== id));
  const editIncome = (id) => deleteIncome(id); 

  const yearIncomes = incomes.filter(i => i.year === selectedYear);
  const total = yearIncomes.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  
  // CHANGED: Determine current target based on selectedYear
  const currentTarget = targets[selectedYear] || 1000000;
  const progress = Math.min((total / currentTarget) * 100, 100);
  
  const calcTax = (m1, m2, m3) => Math.max(0, (yearIncomes.filter(i => [m1, m2, m3].includes(i.month)).reduce((s, i) => s + (Number(i.amount) || 0), 0) - 250000) * 0.08);

  const quarters = [
    { n: 'Q1', m: ['January', 'February', 'March'], tax: calcTax('January', 'February', 'March') },
    { n: 'Q2', m: ['April', 'May', 'June'], tax: calcTax('April', 'May', 'June') },
    { n: 'Q3', m: ['July', 'August', 'September'], tax: calcTax('July', 'August', 'September') },
    { n: 'Q4', m: ['October', 'November', 'December'], tax: calcTax('October', 'November', 'December') }
  ];

  const deadlines = [
    'Form 1701/1701A on or before April 15',
    'Form 1701Q on or before May 15',
    'Form 1701Q on or before August 15',
    'Form 1701Q on or before November 15',
    'Form 2551Q on or before April 25',
    'Form 2551Q on or before July 25',
    'Form 2551Q on or before October 25',
    'Form 2551Q on or before January 25'
  ];

  return (
    <div style={{ padding: '20px', ...fontStyle, background: colors.bg, backgroundAttachment: 'fixed', minHeight: '100vh', maxWidth: '400px', margin: 'auto' }}>
      <Head><link href="https://fonts.googleapis.com/css2?family=Mali:wght@400;600;700&display=swap" rel="stylesheet" /></Head>
      
      <button onClick={() => setTheme(theme === 'kawaii' ? 'pro' : 'kawaii')} style={{ ...inputStyle, width: '100%', cursor: 'pointer', marginBottom: '20px' }}>Switch Theme</button>

      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'inline-block', backgroundColor: colors.primary, padding: '10px', borderRadius: '15px' }}><img src={`/${colors.icons.icon}`} alt="Icon" style={{ width: '60px' }} /></div>
        <h1 style={{ color: colors.primary, fontSize: '1.5rem', margin: '10px 0' }}>Income Tracker for Tax Filing</h1>
        <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} style={{ ...inputStyle, textAlign: 'center', width: '100px', display: 'block', margin: 'auto' }}>
          {[2025, 2026, 2027, 2028].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div style={{ background: colors.card, padding: '15px', borderRadius: '20px', border: `2px solid ${colors.border}`, marginTop: '10px' }}>
        <p><strong>Gross Annual Income:</strong> ₱{total.toLocaleString()}</p>
        <div onClick={() => setIsEditingTarget(true)}>
          {isEditingTarget ? (
            <input type="text" value={currentTarget.toLocaleString()} onChange={(e) => { const raw = e.target.value.replace(/,/g, ''); if (!isNaN(Number(raw))) setTargets({...targets, [selectedYear]: raw ? Number(raw) : 0}); }} onBlur={() => setIsEditingTarget(false)} style={inputStyle} />
          ) : (
            <p style={{ cursor: 'pointer', color: colors.primary }}><strong>Annual Target:</strong> ₱{currentTarget.toLocaleString()}</p>
          )}
        </div>
        <div style={{ background: colors.border, height: '12px', borderRadius: '6px', marginBottom: '10px' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: colors.primary, borderRadius: '6px' }} />
        </div>
        <input placeholder="BIR Registration / COR Link" onChange={(e) => setBirLink(e.target.value)} value={birLink} style={{ ...inputStyle, width: '90%' }} />
      </div>

      <h2 style={{ color: colors.primary, marginTop: '20px', display: 'flex', alignItems: 'center' }}>
        <img src={`/${colors.icons.calendar}`} alt="Calendar" style={{ width: '30px', marginRight: '10px' }} /> BIR Filing Deadlines
      </h2>
      {deadlines.map((d, i) => (
        <div key={i} style={{ background: colors.card, padding: '8px', marginBottom: '5px', borderRadius: '15px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem' }}>
            <input type="checkbox" style={{ marginRight: '8px' }} /> {d}
          </div>
          <input placeholder="Link" style={{ ...inputStyle, fontSize: '0.7rem', width: '50px', border: 'none', textAlign: 'right' }} />
        </div>
      ))}

      <h2 style={{ color: colors.primary, marginTop: '20px' }}><img src={`/${colors.icons.tax}`} alt="Tax" style={{ width: '30px', verticalAlign: 'middle', marginRight: '10px' }} /> Quarterly Tax Summary</h2>
      {quarters.map(q => (
        <div key={q.n} style={{ background: colors.card, padding: '10px', marginBottom: '5px', borderRadius: '15px', border: `1px solid ${colors.border}` }}>
          <strong>{q.n} Tax Due: ₱{q.tax.toLocaleString()}</strong>
        </div>
      ))}

      <h2 style={{ color: colors.primary, marginTop: '20px' }}>
        <img src={`/${colors.icons.income}`} alt="Income" style={{ width: '30px', verticalAlign: 'middle', marginRight: '10px' }} /> Monthly Income
      </h2>
      {quarters.map(q => (
        <div key={q.n} style={{ background: colors.card, padding: '10px', borderRadius: '15px', marginBottom: '10px', border: `1px solid ${colors.border}` }}>
          <div style={{ color: colors.primary, fontWeight: 'bold' }}>{q.n} Total: ₱{yearIncomes.filter(i => q.m.includes(i.month)).reduce((s, i) => s + (Number(i.amount) || 0), 0).toLocaleString()}</div>
          {q.m.map(m => <MonthRow key={m} month={m} incomes={incomes} onAdd={addIncome} onDelete={deleteIncome} onEdit={editIncome} selectedYear={selectedYear} colors={colors} fontStyle={fontStyle} inputStyle={inputStyle} />)}
        </div>
      ))}
    </div>
  );
}