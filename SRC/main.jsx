import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Search, Plus, Download, BarChart3, FileText, Trash2, Edit, ExternalLink, X } from "lucide-react";
import "./style.css";

const initialRFQs = [{
  id: 1, rfqNo: "RFQ-2026-001", eventNo: "EVT-10045", smartGroup: "Pumps / Rotating Equipment",
  materialCategory: "Mechanical", client: "Brunei Shell Petroleum", buyer: "Ahmad Salleh",
  buyerEmail: "buyer@example.com", assignedSales: "Michael Yong", receivedDate: "2026-05-01",
  dueDate: "2026-05-07", closingTime: "16:00", priority: "Urgent", status: "Quoted",
  quoteRef: "Q-2026-001", supplier: "ABC Industrial Supply", manufacturer: "Grundfos", brand: "Grundfos",
  currency: "BND", estimatedValue: "12500", deliveryLeadTime: "6-8 weeks", clarificationStatus: "Closed",
  outcome: "Pending", poNo: "", poDate: "", rfqFileLink: "https://example.com/rfq-file.pdf",
  quotationFileLink: "https://example.com/quotation-file.pdf", unquoteReason: "", remarks: "Waiting client feedback"
}];

const blankForm = {
  rfqNo: "", eventNo: "", smartGroup: "", materialCategory: "", client: "", buyer: "", buyerEmail: "",
  assignedSales: "", receivedDate: "", dueDate: "", closingTime: "", priority: "Normal", status: "Quoted",
  quoteRef: "", supplier: "", manufacturer: "", brand: "", currency: "BND", estimatedValue: "",
  deliveryLeadTime: "", clarificationStatus: "Not Required", outcome: "Pending", poNo: "", poDate: "",
  rfqFileLink: "", quotationFileLink: "", unquoteReason: "", remarks: ""
};

const categories = ["Mechanical", "Electrical", "Instrumentation", "Piping", "Safety", "Tools", "Consumables", "Services", "Others"];
const outcomes = ["Pending", "Received PO", "Rejected", "Cancelled", "No Response", "Submitted Awaiting Result"];
const priorities = ["Low", "Normal", "Urgent", "Critical"];
const clarificationStatuses = ["Not Required", "Pending Client Clarification", "Pending Supplier Clarification", "Clarified", "Closed"];
const currencies = ["BND", "USD", "SGD", "MYR", "EUR", "GBP"];
const unquoteReasons = ["No supplier available", "Cannot meet due date", "Specification unclear", "Brand not available", "MOQ too high", "Price not competitive", "Insufficient information", "Outside company scope", "Others"];

function monthName(dateString) {
  if (!dateString) return "No date";
  return new Date(dateString + "T00:00:00").toLocaleString("en-US", { month: "short", year: "numeric" });
}
function pct(value, total) { return total ? `${((value / total) * 100).toFixed(1)}%` : "0.0%"; }
function isPending(outcome) { return outcome === "Pending" || outcome === "Submitted Awaiting Result"; }

function exportCSV(records) {
  const headers = ["RFQ No","Event No","Smart Group","Material Category","Client","Buyer","Buyer Email","Assigned Sales","Received Date","Due Date","Closing Time","Priority","Quoted / Unquoted","Quote Ref No","Supplier","Manufacturer","Brand","Currency","Estimated Value","Delivery Lead Time","Clarification Status","Outcome","PO No","PO Date","RFQ File Link","Quotation File Link","Reason to Unquote","Remarks"];
  const rows = records.map(r => [r.rfqNo,r.eventNo,r.smartGroup,r.materialCategory,r.client,r.buyer,r.buyerEmail,r.assignedSales,r.receivedDate,r.dueDate,r.closingTime,r.priority,r.status,r.quoteRef,r.supplier,r.manufacturer,r.brand,r.currency,r.estimatedValue,r.deliveryLeadTime,r.clarificationStatus,r.outcome,r.poNo,r.poDate,r.rfqFileLink,r.quotationFileLink,r.unquoteReason,r.remarks]);
  const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell || "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = "rfq_database.csv"; link.click();
  URL.revokeObjectURL(url);
}

function App() {
  const [records, setRecords] = useState(initialRFQs);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterOutcome, setFilterOutcome] = useState("All");

  const filteredRecords = useMemo(() => records.filter(r => {
    const text = Object.values(r).join(" ").toLowerCase();
    return text.includes(search.toLowerCase()) && (filterStatus === "All" || r.status === filterStatus) && (filterOutcome === "All" || r.outcome === filterOutcome);
  }), [records, search, filterStatus, filterOutcome]);

  const stats = useMemo(() => ({
    total: records.length,
    quoted: records.filter(r => r.status === "Quoted").length,
    unquoted: records.filter(r => r.status === "Unquoted").length,
    po: records.filter(r => r.outcome === "Received PO").length,
    pending: records.filter(r => isPending(r.outcome)).length,
    urgent: records.filter(r => r.priority === "Urgent" || r.priority === "Critical").length
  }), [records]);

  const dailySummary = useMemo(() => {
    const map = {};
    records.forEach(r => {
      const key = r.receivedDate || "No date";
      if (!map[key]) map[key] = { total: 0, quoted: 0, unquoted: 0, pending: 0 };
      map[key].total++; if (r.status === "Quoted") map[key].quoted++; if (r.status === "Unquoted") map[key].unquoted++; if (isPending(r.outcome)) map[key].pending++;
    });
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
  }, [records]);

  const monthlySummary = useMemo(() => {
    const map = {};
    records.forEach(r => {
      const key = monthName(r.receivedDate);
      if (!map[key]) map[key] = { total: 0, quoted: 0, unquoted: 0, pending: 0 };
      map[key].total++; if (r.status === "Quoted") map[key].quoted++; if (r.status === "Unquoted") map[key].unquoted++; if (isPending(r.outcome)) map[key].pending++;
    });
    return Object.entries(map);
  }, [records]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => {
      const next = { ...prev, [name]: value };
      if (name === "status" && value === "Quoted") next.unquoteReason = "";
      if (name === "status" && value === "Unquoted") {
        next.quoteRef = ""; next.supplier = ""; next.manufacturer = ""; next.brand = ""; next.quotationFileLink = "";
      }
      return next;
    });
  }

  function saveRecord(e) {
    e.preventDefault();
    if (!form.rfqNo || !form.receivedDate) { alert("Please enter RFQ No and Received Date."); return; }
    if (editingId) setRecords(prev => prev.map(r => r.id === editingId ? { ...form, id: editingId } : r));
    else setRecords(prev => [{ ...form, id: Date.now() }, ...prev]);
    setForm(blankForm); setEditingId(null);
  }

  function editRecord(record) { setForm({ ...record }); setEditingId(record.id); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function cancelEdit() { setForm(blankForm); setEditingId(null); }
  function removeRecord(id) { if (confirm("Delete this RFQ record?")) setRecords(prev => prev.filter(r => r.id !== id)); }

  return (
    <div className="page"><div className="container">
      <div className="header"><div><h1>RFQ Management System</h1><p>RFQ, quotation files, supplier, PO and KPI tracking.</p></div><button onClick={() => exportCSV(records)} className="primary"><Download size={16}/> Export CSV</button></div>

      <div className="stats">
        <div className="card"><span>Total RFQ</span><b>{stats.total}</b></div>
        <div className="card"><span>Quoted</span><b>{stats.quoted}</b></div>
        <div className="card"><span>Unquoted</span><b>{stats.unquoted}</b></div>
        <div className="card"><span>Received PO</span><b>{stats.po}</b></div>
        <div className="card"><span>Pending</span><b>{stats.pending}</b></div>
        <div className="card"><span>Urgent/Critical</span><b>{stats.urgent}</b></div>
      </div>

      <section className="panel">
        <div className="formTitle"><h2><Plus size={20}/> {editingId ? "Edit RFQ Record" : "Add New RFQ"}</h2>{editingId && <button type="button" onClick={cancelEdit} className="secondary"><X size={16}/> Cancel Edit</button>}</div>
        <form onSubmit={saveRecord} className="form">
          <input name="rfqNo" value={form.rfqNo} onChange={handleChange} placeholder="RFQ No *" />
          <input name="eventNo" value={form.eventNo} onChange={handleChange} placeholder="RFQ Event No" />
          <input name="smartGroup" value={form.smartGroup} onChange={handleChange} placeholder="Smart Group / Catalog" />
          <select name="materialCategory" value={form.materialCategory} onChange={handleChange}><option value="">Material Category</option>{categories.map(c => <option key={c}>{c}</option>)}</select>
          <input name="client" value={form.client} onChange={handleChange} placeholder="Client" />
          <input name="buyer" value={form.buyer} onChange={handleChange} placeholder="Buyer" />
          <input name="buyerEmail" value={form.buyerEmail} onChange={handleChange} placeholder="Buyer Email" />
          <input name="assignedSales" value={form.assignedSales} onChange={handleChange} placeholder="Assigned Sales / PIC" />
          <label>Received Date *<input type="date" name="receivedDate" value={form.receivedDate} onChange={handleChange}/></label>
          <label>Due Date<input type="date" name="dueDate" value={form.dueDate} onChange={handleChange}/></label>
          <label>Closing Time<input type="time" name="closingTime" value={form.closingTime} onChange={handleChange}/></label>
          <select name="priority" value={form.priority} onChange={handleChange}>{priorities.map(p => <option key={p}>{p}</option>)}</select>
          <select name="status" value={form.status} onChange={handleChange}><option>Quoted</option><option>Unquoted</option></select>
          <input disabled={form.status === "Unquoted"} name="quoteRef" value={form.quoteRef} onChange={handleChange} placeholder="Quote Ref No" />
          <input disabled={form.status === "Unquoted"} name="supplier" value={form.supplier} onChange={handleChange} placeholder="Supplier" />
          <input disabled={form.status === "Unquoted"} name="manufacturer" value={form.manufacturer} onChange={handleChange} placeholder="Manufacturer" />
          <input disabled={form.status === "Unquoted"} name="brand" value={form.brand} onChange={handleChange} placeholder="Brand" />
          <select name="currency" value={form.currency} onChange={handleChange}>{currencies.map(c => <option key={c}>{c}</option>)}</select>
          <input name="estimatedValue" value={form.estimatedValue} onChange={handleChange} placeholder="Estimated Value" />
          <input name="deliveryLeadTime" value={form.deliveryLeadTime} onChange={handleChange} placeholder="Delivery Lead Time" />
          <select name="clarificationStatus" value={form.clarificationStatus} onChange={handleChange}>{clarificationStatuses.map(c => <option key={c}>{c}</option>)}</select>
          <select name="outcome" value={form.outcome} onChange={handleChange}>{outcomes.map(o => <option key={o}>{o}</option>)}</select>
          <input name="poNo" value={form.poNo} onChange={handleChange} placeholder="PO No, if received" />
          <label>PO Date<input type="date" name="poDate" value={form.poDate} onChange={handleChange}/></label>
          <input className="wide" name="rfqFileLink" value={form.rfqFileLink} onChange={handleChange} placeholder="RFQ File Link, e.g. Google Drive / OneDrive PDF URL" />
          <input disabled={form.status === "Unquoted"} className="wide" name="quotationFileLink" value={form.quotationFileLink} onChange={handleChange} placeholder="Quotation File Link, e.g. PDF quotation URL" />
          {form.status === "Unquoted" && <select name="unquoteReason" value={form.unquoteReason} onChange={handleChange}><option value="">Reason to Unquote</option>{unquoteReasons.map(r => <option key={r}>{r}</option>)}</select>}
          <input className="wide" name="remarks" value={form.remarks} onChange={handleChange} placeholder="Remarks" />
          <button className="primary wide" type="submit"><FileText size={16}/> {editingId ? "Update RFQ Record" : "Save RFQ Record"}</button>
        </form>
      </section>

      <section className="panel">
        <div className="recordsHeader"><h2>RFQ Records</h2><div className="filters"><div className="search"><Search size={16}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search records"/></div><select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}><option>All</option><option>Quoted</option><option>Unquoted</option></select><select value={filterOutcome} onChange={e => setFilterOutcome(e.target.value)}><option>All</option>{outcomes.map(o => <option key={o}>{o}</option>)}</select></div></div>
        <div className="tableWrap"><table><thead><tr><th>RFQ</th><th>Client / Buyer</th><th>Dates</th><th>Quote</th><th>Files / Links</th><th>Supplier</th><th>Outcome</th><th>Action</th></tr></thead><tbody>
          {filteredRecords.map(r => <tr key={r.id}>
            <td><b>{r.rfqNo}</b><small>{r.eventNo}<br/>{r.smartGroup}</small></td>
            <td>{r.client}<small>{r.buyer}<br/>{r.buyerEmail}</small></td>
            <td>Received: {r.receivedDate}<small>Due: {r.dueDate} {r.closingTime}<br/>Priority: {r.priority}</small></td>
            <td><span className={r.status === "Quoted" ? "pill green" : "pill amber"}>{r.status}</span><small>{r.quoteRef || r.unquoteReason}</small></td>
            <td><div className="linkList">{r.rfqFileLink ? <a href={r.rfqFileLink} target="_blank" rel="noreferrer"><ExternalLink size={14}/> View RFQ File</a> : <span className="muted">No RFQ file</span>}{r.quotationFileLink ? <a href={r.quotationFileLink} target="_blank" rel="noreferrer"><ExternalLink size={14}/> View Quotation</a> : <span className="muted">No quotation file</span>}</div></td>
            <td>{r.supplier}<small>{r.manufacturer} {r.brand}<br/>{r.currency} {r.estimatedValue}</small></td>
            <td>{r.outcome}<small>{r.poNo ? `PO: ${r.poNo}` : ""}<br/>{r.clarificationStatus}</small></td>
            <td><div className="actions"><button className="icon" onClick={() => editRecord(r)} title="Edit"><Edit size={16}/></button><button className="icon delete" onClick={() => removeRecord(r.id)} title="Delete"><Trash2 size={16}/></button></div></td>
          </tr>)}
        </tbody></table></div>
      </section>

      <div className="summaryGrid">
        <section className="panel"><h2><BarChart3 size={20}/> Daily RFQ Received</h2>{dailySummary.map(([date, s]) => <div className="summary" key={date}><b>{date}</b><span>Total: {s.total} | Quoted: {s.quoted} | Unquoted: {s.unquoted} | Pending: {s.pending}</span></div>)}</section>
        <section className="panel"><h2><BarChart3 size={20}/> Monthly Summary with %</h2>{monthlySummary.map(([month, s]) => <div className="summary" key={month}><b>{month}</b><span>RFQ: {s.total}</span><span>Quoted: {s.quoted} ({pct(s.quoted, s.total)})</span><span>Unquoted: {s.unquoted} ({pct(s.unquoted, s.total)})</span><span>Pending: {s.pending} ({pct(s.pending, s.total)})</span></div>)}</section>
      </div>
    </div></div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
