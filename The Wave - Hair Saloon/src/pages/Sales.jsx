import { useState, useRef, useEffect } from 'react';
import { useData } from '../context/DataContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './Sales.css';

/* ── PDF / Print Bill ──────────────────────────────────
   Uses the browser's built-in print API injected into a
   hidden iframe — no extra library needed.
   ────────────────────────────────────────────────────── */
function printBill(sale) {
  const items = sale.items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td style="text-align:center">${item.qty}</td>
      <td style="text-align:right">₹${item.price.toLocaleString('en-IN')}</td>
      <td style="text-align:right">₹${(item.price * item.qty).toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Bill — The Wave Men's Saloon</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Playfair+Display:wght@700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Inter, sans-serif; color: #111; background: #fff; padding: 0; }
    .bill { max-width: 420px; margin: 0 auto; padding: 32px 28px; }
    .header { text-align: center; border-bottom: 2px solid #d4a843; padding-bottom: 18px; margin-bottom: 18px; }
    .salon-name { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; color: #b08930; }
    .salon-sub  { font-size: 12px; color: #777; letter-spacing: 2px; text-transform: uppercase; margin-top: 3px; }
    .meta { display: flex; justify-content: space-between; margin-bottom: 18px; font-size: 12px; color: #555; }
    .meta strong { color: #111; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
    th { background: #f9f3e5; color: #b08930; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 10px; text-align: left; border-bottom: 1px solid #e8d5a0; }
    td { padding: 9px 10px; font-size: 13px; border-bottom: 1px solid #f0f0f0; vertical-align: top; }
    .total-row { border-top: 2px solid #d4a843; }
    .total-row td { font-weight: 800; font-size: 16px; color: #b08930; padding-top: 12px; }
    .note { font-size: 12px; color: #777; font-style: italic; margin-bottom: 16px; }
    .footer { text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 16px; margin-top: 8px; }
    .footer strong { color: #b08930; display: block; font-size: 14px; margin-bottom: 4px; }
    @media print {
      body { padding: 0; }
      .bill { padding: 16px; }
    }
  </style>
</head>
<body>
  <div class="bill">
    <div class="header">
      <div class="salon-name">✂️ The Wave</div>
      <div class="salon-sub">Men's Saloon</div>
    </div>
    <div class="meta">
      <div>
        <div>Bill No: <strong>${sale.id}</strong></div>
        <div>Customer: <strong>${sale.customer || 'Walk-in'}</strong></div>
      </div>
      <div style="text-align:right">
        <div>Date: <strong>${new Date(sale.date).toLocaleDateString('en-IN')}</strong></div>
        <div>Time: <strong>${new Date(sale.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</strong></div>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Service / Item</th>
          <th style="text-align:center">Qty</th>
          <th style="text-align:right">Rate</th>
          <th style="text-align:right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${items}
      </tbody>
      <tfoot>
        <tr class="total-row">
          <td colspan="3">Total</td>
          <td style="text-align:right">₹${sale.total.toLocaleString('en-IN')}</td>
        </tr>
      </tfoot>
    </table>
    ${sale.note ? `<div class="note">Note: ${sale.note}</div>` : ''}
    <div class="footer">
      <strong>Thank you for visiting The Wave!</strong>
      Please visit again. Have a great day! 🙏
    </div>
  </div>
</body>
</html>`;

  const w = window.open('', '_blank', 'width=500,height=700,scrollbars=yes');
  if (!w) return alert('Please allow popups to print the bill.');
  w.document.write(html);
  w.document.close();
  w.onload = () => { w.print(); };
}

/* ── Helpers ──────────────────────────────────────────── */
const SALE_ITEMS_SUGGESTIONS = [
  'Hair Cut','Beard Cut','Facial','Detan','Clean Up',
  'Hair Massage','Hair Wash','Hair Color','Highlight Hair Color',
  'Hair Spa','Manicure','Pedicure','Shampoo','Conditioning',
  'Waxing','Threading','Bleach',
];

const EMPTY_ROW = { name: '', qty: 1, price: '' };

function groupByDay(sales) {
  const map = {};
  sales.forEach(s => {
    const day = new Date(s.date).toDateString();
    if (!map[day]) map[day] = [];
    map[day].push(s);
  });
  return Object.entries(map).sort((a, b) => new Date(b[0]) - new Date(a[0]));
}

export default function Sales() {
  const { sales, addSale, deleteSale } = useData();
  const [showModal,  setShowModal]  = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [dateFilter, setDateFilter] = useState('');
  const [searchQ,    setSearchQ]    = useState('');
  const [form, setForm] = useState({
    customer: '',
    date: new Date().toISOString().slice(0, 16),
    note: '',
    paymentMethod: 'Cash',
    rows: [{ ...EMPTY_ROW }],
  });

  /* ── Auto Download Report at 11:59 PM ──────────────── */
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 23 && now.getMinutes() === 59 && now.getSeconds() === 0) {
        downloadReportForDay();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [sales]);

  function downloadReportForDay(dateStr = new Date().toDateString(), prefilteredSales = null, manualTotal = null) {
    const doc = new jsPDF();
    const formattedDate = new Date(dateStr).toDateString();
    doc.setFontSize(20);
    doc.text(`The Wave - Men's Saloon`, 14, 22);
    doc.setFontSize(14);
    doc.text(`Daily Sales Report - ${formattedDate}`, 14, 32);

    const targetSales = prefilteredSales || sales.filter(s => new Date(s.date).toDateString() === formattedDate);

    const tableData = targetSales.map(s => [
      new Date(s.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      s.customer || 'Walk-in',
      s.items.map(i => i.name).join(', '),
      s.paymentMethod || 'Cash',
      `Rs. ${s.total}`
    ]);

    doc.autoTable({
      startY: 40,
      head: [['Time', 'Customer', 'Services', 'Payment', 'Amount']],
      body: tableData,
    });

    const totalRevenue = manualTotal !== null ? manualTotal : targetSales.reduce((sum, s) => sum + s.total, 0);
    doc.text(`Total Daily Revenue: Rs. ${totalRevenue.toLocaleString('en-IN')}`, 14, doc.autoTable.previous.finalY + 10);

    doc.save(`Daily_Sales_Report_${new Date(dateStr).toISOString().split('T')[0]}.pdf`);
  }

  /* ── filter & sort ──────────────────────────────── */
  const filtered = sales.filter(s => {
    const matchDate   = !dateFilter || s.date.startsWith(dateFilter);
    const matchSearch = !searchQ || s.customer?.toLowerCase().includes(searchQ.toLowerCase()) ||
                        s.items.some(i => i.name.toLowerCase().includes(searchQ.toLowerCase()));
    return matchDate && matchSearch;
  });

  const grouped = groupByDay([...filtered].sort((a, b) => new Date(b.date) - new Date(a.date)));

  /* ── totals ─────────────────────────────────────── */
  const grandTotal     = sales.reduce((sum, s) => sum + s.total, 0);
  const today          = new Date().toDateString();
  const todayTotal     = sales.filter(s => new Date(s.date).toDateString() === today).reduce((sum, s) => sum + s.total, 0);
  const filteredTotal  = filtered.reduce((sum, s) => sum + s.total, 0);

  /* ── new sale form ──────────────────────────────── */
  function addRow() {
    setForm(f => ({ ...f, rows: [...f.rows, { ...EMPTY_ROW }] }));
  }
  function removeRow(i) {
    if (form.rows.length === 1) return;
    setForm(f => ({ ...f, rows: f.rows.filter((_, idx) => idx !== i) }));
  }
  function updateRow(i, field, val) {
    setForm(f => {
      const rows = [...f.rows];
      rows[i] = { ...rows[i], [field]: val };
      return { ...f, rows };
    });
  }

  const rowTotal = form.rows.reduce((sum, r) => sum + (Number(r.price) * Number(r.qty) || 0), 0);

  function openModal() {
    setForm({
      customer: '',
      date: new Date().toISOString().slice(0, 16),
      note: '',
      paymentMethod: 'Cash',
      rows: [{ ...EMPTY_ROW }],
    });
    setShowModal(true);
  }

  function handleSave() {
    const validRows = form.rows.filter(r => r.name.trim() && r.price !== '');
    if (validRows.length === 0) return;
    const newSale = addSale({
      customer: form.customer.trim() || 'Walk-in',
      date: form.date || new Date().toISOString(),
      note: form.note.trim(),
      paymentMethod: form.paymentMethod,
      items: validRows.map(r => ({ name: r.name.trim(), qty: Number(r.qty) || 1, price: Number(r.price) || 0 })),
      total: validRows.reduce((sum, r) => sum + (Number(r.price) * Number(r.qty) || 0), 0),
    });
    setShowModal(false);
    // offer to print immediately
    setTimeout(() => printBill(newSale), 200);
  }

  return (
    <div className="sales-page animate-fade-in">
      {/* ── Header ────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">💰 Sales</h1>
          <p className="page-sub">Track revenue and generate bills</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => downloadReportForDay()}>📥 Download Today's PDF</button>
          <button className="btn btn-primary" onClick={openModal}>+ New Sale</button>
        </div>
      </div>

      {/* ── Summary ───────────────────────────────── */}
      <div className="sales-summary">
        <div className="sales-sum-card sales-sum-card--gold">
          <div className="ssl-icon">💰</div>
          <div>
            <div className="ssl-value">₹{grandTotal.toLocaleString('en-IN')}</div>
            <div className="ssl-label">Total Revenue</div>
          </div>
        </div>
        <div className="sales-sum-card sales-sum-card--green">
          <div className="ssl-icon">📅</div>
          <div>
            <div className="ssl-value">₹{todayTotal.toLocaleString('en-IN')}</div>
            <div className="ssl-label">Today's Revenue</div>
          </div>
        </div>
        <div className="sales-sum-card sales-sum-card--blue">
          <div className="ssl-icon">🛒</div>
          <div>
            <div className="ssl-value">{sales.length}</div>
            <div className="ssl-label">Total Transactions</div>
          </div>
        </div>
        <div className="sales-sum-card sales-sum-card--purple">
          <div className="ssl-icon">📊</div>
          <div>
            <div className="ssl-value">
              ₹{sales.length ? Math.round(grandTotal / sales.length).toLocaleString('en-IN') : 0}
            </div>
            <div className="ssl-label">Avg. Per Sale</div>
          </div>
        </div>
      </div>

      {/* ── Filters ───────────────────────────────── */}
      <div className="sales-filters">
        <input
          type="text"
          placeholder="🔍  Search customer or service..."
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
          className="sales-search"
        />
        <input
          type="date"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          className="sales-date-filter"
          title="Filter by date"
        />
        {(searchQ || dateFilter) && (
          <button className="btn btn-sm btn-secondary" onClick={() => { setSearchQ(''); setDateFilter(''); }}>✕ Clear</button>
        )}
        {(searchQ || dateFilter) && (
          <span className="filter-total">Showing: ₹{filteredTotal.toLocaleString('en-IN')} across {filtered.length} sale{filtered.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* ── Sales by date ─────────────────────────── */}
      <div className="sales-timeline">
        {filtered.length === 0 && (
          <div className="sales-empty">
            No sales found. <span onClick={openModal} style={{ color: 'var(--accent-gold)', cursor: 'pointer' }}>Add a sale →</span>
          </div>
        )}
        {grouped.map(([day, daySales]) => {
          const dayTotal = daySales.reduce((s, x) => s + x.total, 0);
          const isToday  = new Date(day).toDateString() === today;
          return (
            <div key={day} className="day-group">
              <div className="day-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`day-badge${isToday ? ' day-badge--today' : ''}`}>
                  {isToday ? 'Today' : new Date(day).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span className="day-total">₹{dayTotal.toLocaleString('en-IN')} — {daySales.length} sale{daySales.length !== 1 ? 's' : ''}</span>
                  <button className="btn btn-sm btn-secondary" onClick={() => downloadReportForDay(day, daySales, dayTotal)} title="Download this day's report">📥 PDF</button>
                </div>
              </div>
              <div className="day-sales">
                {daySales.map(sale => (
                  <div key={sale.id} className="sale-card">
                    <div className="sale-card-top">
                      <div>
                        <div className="sale-customer">{sale.customer || 'Walk-in'}</div>
                        <div className="sale-time">🕐 {new Date(sale.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} · {sale.id}</div>
                      </div>
                      <div className="sale-amount" style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
                        <span>₹{sale.total.toLocaleString('en-IN')}</span>
                        <span className={`badge badge-${sale.paymentMethod==='Cash'?'green':'gold'}`} style={{fontSize: '11px', marginTop: '4px'}}>
                          {sale.paymentMethod || 'Cash'}
                        </span>
                      </div>
                    </div>

                    {/* items */}
                    <div className="sale-items">
                      {sale.items.map((item, idx) => (
                        <div key={idx} className="sale-item-row">
                          <span>{item.name}</span>
                          <span>{item.qty > 1 ? `×${item.qty}` : ''}</span>
                          <span>₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>

                    {sale.note && <div className="sale-note">📝 {sale.note}</div>}

                    <div className="sale-actions">
                      <button className="btn btn-sm btn-primary" onClick={() => printBill(sale)}>🖨️ Print Bill</button>
                      <button className="btn btn-sm btn-danger"  onClick={() => setConfirmDel(sale)}>🗑️ Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ═════════════════════════════════════════════
          New Sale Modal
          ═════════════════════════════════════════════ */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
            <h2>🛒 New Sale</h2>
            <div className="modal-form">
              <div className="modal-row">
                <label style={{ flex: 2 }}>
                  Customer Name
                  <input
                    value={form.customer}
                    onChange={e => setForm(f => ({ ...f, customer: e.target.value }))}
                    placeholder="Walk-in / Name"
                  />
                </label>
                <label style={{ flex: 1 }}>
                  Date & Time
                  <input
                    type="datetime-local"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  />
                </label>
                <label style={{ flex: 1 }}>
                  Payment Method
                  <select value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}>
                    <option value="Cash">💵 Cash</option>
                    <option value="Card">💳 Card</option>
                    <option value="UPI">📱 UPI</option>
                  </select>
                </label>
              </div>

              {/* Items rows */}
              <div className="sale-items-section">
                <div className="sale-items-header">
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: 13 }}>Items / Services</span>
                  <button type="button" className="btn btn-sm btn-secondary" onClick={addRow}>+ Add Row</button>
                </div>

                <div className="sale-rows-head">
                  <span style={{ flex: 3 }}>Service / Item</span>
                  <span style={{ flex: 1, textAlign: 'center' }}>Qty</span>
                  <span style={{ flex: 1, textAlign: 'right' }}>Price (₹)</span>
                  <span style={{ flex: 1, textAlign: 'right' }}>Total</span>
                  <span style={{ width: 30 }}></span>
                </div>

                {form.rows.map((row, i) => (
                  <div key={i} className="sale-row-inputs">
                    <div style={{ flex: 3, position: 'relative' }}>
                      <input
                        list={`svc-list-${i}`}
                        value={row.name}
                        onChange={e => updateRow(i, 'name', e.target.value)}
                        placeholder="e.g. Hair Cut"
                        style={{ width: '100%' }}
                      />
                      <datalist id={`svc-list-${i}`}>
                        {SALE_ITEMS_SUGGESTIONS.map(s => <option key={s} value={s} />)}
                      </datalist>
                    </div>
                    <input
                      type="number" min="1" value={row.qty}
                      onChange={e => updateRow(i, 'qty', e.target.value)}
                      style={{ flex: 1, textAlign: 'center' }}
                    />
                    <input
                      type="number" min="0" value={row.price}
                      onChange={e => updateRow(i, 'price', e.target.value)}
                      placeholder="0"
                      style={{ flex: 1, textAlign: 'right' }}
                    />
                    <span style={{ flex: 1, textAlign: 'right', fontWeight: 600, color: 'var(--accent-gold)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      ₹{(Number(row.price) * Number(row.qty) || 0).toLocaleString('en-IN')}
                    </span>
                    <button
                      type="button"
                      className="qty-btn"
                      style={{ width: 30, flexShrink: 0, color: 'var(--accent-red)' }}
                      onClick={() => removeRow(i)}
                      title="Remove row"
                    >×</button>
                  </div>
                ))}

                <div className="sale-modal-total">
                  <span>Total</span>
                  <span>₹{rowTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <label>
                Note (optional)
                <input
                  value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="e.g. Regular customer, paid by UPI..."
                />
              </label>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary"   onClick={handleSave}>💾 Save & Print Bill</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Delete ─────────────────────── */}
      {confirmDel && (
        <div className="modal-overlay" onClick={() => setConfirmDel(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: 'var(--accent-red)' }}>🗑️ Delete Sale</h2>
            <p style={{ color: 'var(--text-secondary)', margin: '12px 0 24px' }}>
              Delete sale <strong style={{ color: 'var(--text-primary)' }}>{confirmDel.id}</strong> for <strong style={{ color: 'var(--text-primary)' }}>₹{confirmDel.total.toLocaleString('en-IN')}</strong>?
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmDel(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => { deleteSale(confirmDel.id); setConfirmDel(null); }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
