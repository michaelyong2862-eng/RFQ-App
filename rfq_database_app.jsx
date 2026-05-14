import React, { useMemo, useState } from "react";
import { Search, Plus, Download, BarChart3, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const initialRFQs = [
  {
    id: 1,
    rfqNo: "RFQ-2026-001",
    eventNo: "EVT-10045",
    smartGroup: "Pumps / Rotating Equipment",
    materialCategory: "Mechanical",
    client: "Brunei Shell Petroleum",
    buyer: "Ahmad Salleh",
    receivedDate: "2026-05-01",
    dueDate: "2026-05-07",
    status: "Quoted",
    quoteRef: "Q-2026-001",
    supplier: "ABC Industrial Supply",
    manufacturer: "Grundfos",
    brand: "Grundfos",
    buyerEmail: "buyer@example.com",
    assignedSales: "Michael Yong",
    closingTime: "16:00",
    priority: "Urgent",
    currency: "BND",
    estimatedValue: "12500",
    deliveryLeadTime: "6-8 weeks",
    clarificationStatus: "Closed",
    poNo: "",
    poDate: "",
    outcome: "Pending",
    unquoteReason: "",
    remarks: "Waiting client feedback"
  },
  {
    id: 2,
    rfqNo: "RFQ-2026-002",
    eventNo: "EVT-10046",
    smartGroup: "Valves / Fittings",
    materialCategory: "Piping",
    client: "TotalEnergies EP Brunei",
    buyer: "Siti Rahman",
    receivedDate: "2026-05-02",
    dueDate: "2026-05-06",
    status: "Unquoted",
    quoteRef: "",
    supplier: "",
    manufacturer: "",
    brand: "",
    buyerEmail: "siti@example.com",
    assignedSales: "Michael Yong",
    closingTime: "12:00",
    priority: "Normal",
    currency: "BND",
    estimatedValue: "",
    deliveryLeadTime: "",
    clarificationStatus: "Pending Supplier Clarification",
    poNo: "",
    poDate: "",
    outcome: "Rejected",
    unquoteReason: "No suitable supplier / brand not available",
    remarks: "Unable to meet specification"
  }
];

const blankForm = {
  rfqNo: "",
  eventNo: "",
  smartGroup: "",
  materialCategory: "",
  client: "",
  buyer: "",
  buyerEmail: "",
  assignedSales: "",
  receivedDate: "",
  dueDate: "",
  closingTime: "",
  priority: "Normal",
  status: "Quoted",
  quoteRef: "",
  supplier: "",
  manufacturer: "",
  brand: "",
  currency: "BND",
  estimatedValue: "",
  deliveryLeadTime: "",
  clarificationStatus: "Not Required",
  outcome: "Pending",
  poNo: "",
  poDate: "",
  unquoteReason: "",
  remarks: ""
};

const categories = ["Mechanical", "Electrical", "Instrumentation", "Piping", "Safety", "Tools", "Consumables", "Services", "Others"];
const outcomes = ["Pending", "Received PO", "Rejected", "Cancelled", "No Response", "Submitted Awaiting Result"];
const priorities = ["Low", "Normal", "Urgent", "Critical"];
const clarificationStatuses = ["Not Required", "Pending Client Clarification", "Pending Supplier Clarification", "Clarified", "Closed"];
const currencies = ["BND", "USD", "SGD", "MYR", "EUR", "GBP"];
const unquoteReasons = [
  "No supplier available",
  "Cannot meet due date",
  "Specification unclear",
  "Brand not available",
  "MOQ too high",
  "Price not competitive",
  "Insufficient information",
  "Outside company scope",
  "Others"
];

function monthName(dateString) {
  if (!dateString) return "No date";
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleString("en-US", { month: "short", year: "numeric" });
}

function exportCSV(records) {
  const headers = [
    "RFQ No",
    "Event No",
    "Smart Group / Catalog",
    "Material Category",
    "Client",
    "Buyer",
    "Received Date",
    "Due Date",
    "Quoted / Unquoted",
    "Quote Ref No",
    "Supplier",
    "Outcome",
    "Reason to Unquote",
    "Remarks"
  ];

  const rows = records.map((r) => [
    r.rfqNo,
    r.eventNo,
    r.smartGroup,
    r.materialCategory,
    r.client,
    r.buyer,
    r.receivedDate,
    r.dueDate,
    r.status,
    r.quoteRef,
    r.supplier,
    r.outcome,
    r.unquoteReason,
    r.remarks
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell || "").replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "rfq_database.csv";
  link.click();
  URL.revokeObjectURL(url);
}

// SYSTEM DEPLOYMENT OPTIONS
// 1. WEB-BASED SYSTEM
// - Multi-user access
// - Cloud database
// - Access from office/home/mobile browser
// - Admin dashboard
// - Real-time RFQ tracking
//
// 2. DESKTOP SOFTWARE
// - Windows desktop executable
// - Local database or company server
// - Fast internal operation
// - Offline capability
//
// 3. MOBILE APP
// - Android/iPhone support
// - Quick RFQ entry onsite
// - Push notifications for due dates
// - Upload RFQ photos/PDFs
//
// RECOMMENDED TECHNOLOGY STACK
// Frontend: React + Tailwind
// Backend: Node.js + Express
// Database: PostgreSQL or MySQL
// Mobile: React Native
// Desktop: Electron
// Authentication: Firebase/Auth0
// File Storage: AWS S3 or Google Drive
//
// FUTURE MODULES
// - Supplier database
// - PO management
// - Email integration
// - KPI dashboard
// - RFQ aging analysis
// - Auto quotation generation
// - Approval workflow
// - Document uploads
// - Smart Group analytics
// - Quotation comparison sheet
//
// RECOMMENDED PHASES
// Phase 1: RFQ database + dashboard
// Phase 2: Supplier & quotation module
// Phase 3: PO tracking + reporting
// Phase 4: Mobile app + automation
//
export default function RFQDatabaseApp() {
  const [records, setRecords] = useState(initialRFQs);
  const [form, setForm] = useState(blankForm);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterOutcome, setFilterOutcome] = useState("All");

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const text = Object.values(r).join(" ").toLowerCase();
      const matchSearch = text.includes(search.toLowerCase());
      const matchStatus = filterStatus === "All" || r.status === filterStatus;
      const matchOutcome = filterOutcome === "All" || r.outcome === filterOutcome;
      return matchSearch && matchStatus && matchOutcome;
    });
  }, [records, search, filterStatus, filterOutcome]);

  const stats = useMemo(() => {
    const total = records.length;
    const quoted = records.filter((r) => r.status === "Quoted").length;
    const unquoted = records.filter((r) => r.status === "Unquoted").length;
    const po = records.filter((r) => r.outcome === "Received PO").length;
    const pending = records.filter((r) => r.outcome === "Pending" || r.outcome === "Submitted Awaiting Result").length;
    const urgent = records.filter((r) => r.priority === "Urgent" || r.priority === "Critical").length;
    return { total, quoted, unquoted, po, pending, urgent };
  }, [records]);

  const dailySummary = useMemo(() => {
    const map = {};
    records.forEach((r) => {
      const key = r.receivedDate || "No date";
      if (!map[key]) map[key] = { total: 0, quoted: 0, unquoted: 0 };
      map[key].total += 1;
      if (r.status === "Quoted") map[key].quoted += 1;
      if (r.status === "Unquoted") map[key].unquoted += 1;
    });
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
  }, [records]);

  const monthlySummary = useMemo(() => {
    const map = {};
    records.forEach((r) => {
      const key = monthName(r.receivedDate);
      if (!map[key]) map[key] = { total: 0, quoted: 0, unquoted: 0 };
      map[key].total += 1;
      if (r.status === "Quoted") map[key].quoted += 1;
      if (r.status === "Unquoted") map[key].unquoted += 1;
    });
    return Object.entries(map);
  }, [records]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "status" && value === "Quoted") next.unquoteReason = "";
      if (name === "status" && value === "Unquoted") {
        next.quoteRef = "";
        next.supplier = "";
      }
      return next;
    });
  }

  function addRecord(e) {
    e.preventDefault();
    if (!form.rfqNo || !form.receivedDate) return;
    setRecords((prev) => [{ ...form, id: Date.now() }, ...prev]);
    setForm(blankForm);
  }

  function removeRecord(id) {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">RFQ Database</h1>
            <p className="text-slate-600">Record, track, quote, unquote, and summarize all RFQ activity.</p>
          </div>
          <Button onClick={() => exportCSV(records)} className="rounded-2xl">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-6">
          <Card className="rounded-2xl shadow-sm"><CardContent className="p-5"><p className="text-sm text-slate-500">Total RFQ</p><p className="text-3xl font-bold">{stats.total}</p></CardContent></Card>
          <Card className="rounded-2xl shadow-sm"><CardContent className="p-5"><p className="text-sm text-slate-500">Quoted</p><p className="text-3xl font-bold">{stats.quoted}</p></CardContent></Card>
          <Card className="rounded-2xl shadow-sm"><CardContent className="p-5"><p className="text-sm text-slate-500">Unquoted</p><p className="text-3xl font-bold">{stats.unquoted}</p></CardContent></Card>
          <Card className="rounded-2xl shadow-sm"><CardContent className="p-5"><p className="text-sm text-slate-500">Received PO</p><p className="text-3xl font-bold">{stats.po}</p></CardContent></Card>
          <Card className="rounded-2xl shadow-sm"><CardContent className="p-5"><p className="text-sm text-slate-500">Pending Result</p><p className="text-3xl font-bold">{stats.pending}</p></CardContent></Card>
          <Card className="rounded-2xl shadow-sm"><CardContent className="p-5"><p className="text-sm text-slate-500">Urgent / Critical</p><p className="text-3xl font-bold">{stats.urgent}</p></CardContent></Card>
        </div>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Add New RFQ</h2>
            </div>
            <form onSubmit={addRecord} className="grid gap-4 md:grid-cols-4">
              <input className="rounded-xl border p-3" name="rfqNo" value={form.rfqNo} onChange={handleChange} placeholder="RFQ No *" />
              <input className="rounded-xl border p-3" name="eventNo" value={form.eventNo} onChange={handleChange} placeholder="RFQ Event No" />
              <input className="rounded-xl border p-3" name="smartGroup" value={form.smartGroup} onChange={handleChange} placeholder="Smart Group / Catalog" />
              <select className="rounded-xl border p-3" name="materialCategory" value={form.materialCategory} onChange={handleChange}>
                <option value="">Material Category</option>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
              <input className="rounded-xl border p-3" name="client" value={form.client} onChange={handleChange} placeholder="Client" />
              <input className="rounded-xl border p-3" name="buyer" value={form.buyer} onChange={handleChange} placeholder="Buyer" />
              <input className="rounded-xl border p-3" name="buyerEmail" value={form.buyerEmail} onChange={handleChange} placeholder="Buyer Email" />
              <input className="rounded-xl border p-3" name="assignedSales" value={form.assignedSales} onChange={handleChange} placeholder="Assigned Sales / PIC" />
              <div><label className="text-xs text-slate-500">Received Date *</label><input type="date" className="w-full rounded-xl border p-3" name="receivedDate" value={form.receivedDate} onChange={handleChange} /></div>
              <div><label className="text-xs text-slate-500">Due Date</label><input type="date" className="w-full rounded-xl border p-3" name="dueDate" value={form.dueDate} onChange={handleChange} /></div>
              <div><label className="text-xs text-slate-500">Closing Time</label><input type="time" className="w-full rounded-xl border p-3" name="closingTime" value={form.closingTime} onChange={handleChange} /></div>
              <select className="rounded-xl border p-3" name="priority" value={form.priority} onChange={handleChange}>{priorities.map((p) => <option key={p}>{p}</option>)}</select>
              <select className="rounded-xl border p-3" name="status" value={form.status} onChange={handleChange}>
                <option>Quoted</option>
                <option>Unquoted</option>
              </select>
              <input disabled={form.status === "Unquoted"} className="rounded-xl border p-3 disabled:bg-slate-100" name="quoteRef" value={form.quoteRef} onChange={handleChange} placeholder="Quote Ref No" />
              <input disabled={form.status === "Unquoted"} className="rounded-xl border p-3 disabled:bg-slate-100" name="supplier" value={form.supplier} onChange={handleChange} placeholder="Supplier" />
              <input disabled={form.status === "Unquoted"} className="rounded-xl border p-3 disabled:bg-slate-100" name="manufacturer" value={form.manufacturer} onChange={handleChange} placeholder="Manufacturer" />
              <input disabled={form.status === "Unquoted"} className="rounded-xl border p-3 disabled:bg-slate-100" name="brand" value={form.brand} onChange={handleChange} placeholder="Brand" />
              <select className="rounded-xl border p-3" name="currency" value={form.currency} onChange={handleChange}>{currencies.map((c) => <option key={c}>{c}</option>)}</select>
              <input className="rounded-xl border p-3" name="estimatedValue" value={form.estimatedValue} onChange={handleChange} placeholder="Estimated Value" />
              <input className="rounded-xl border p-3" name="deliveryLeadTime" value={form.deliveryLeadTime} onChange={handleChange} placeholder="Delivery Lead Time" />
              <select className="rounded-xl border p-3" name="clarificationStatus" value={form.clarificationStatus} onChange={handleChange}>{clarificationStatuses.map((c) => <option key={c}>{c}</option>)}</select>
              <select className="rounded-xl border p-3" name="outcome" value={form.outcome} onChange={handleChange}>
                {outcomes.map((o) => <option key={o}>{o}</option>)}
              </select>
              <input className="rounded-xl border p-3" name="poNo" value={form.poNo} onChange={handleChange} placeholder="PO No, if received" />
              <div><label className="text-xs text-slate-500">PO Date</label><input type="date" className="w-full rounded-xl border p-3" name="poDate" value={form.poDate} onChange={handleChange} /></div>
              {form.status === "Unquoted" && (
                <select className="rounded-xl border p-3 md:col-span-2" name="unquoteReason" value={form.unquoteReason} onChange={handleChange}>
                  <option value="">Reason to Unquote</option>
                  {unquoteReasons.map((r) => <option key={r}>{r}</option>)}
                </select>
              )}
              <input className="rounded-xl border p-3 md:col-span-2" name="remarks" value={form.remarks} onChange={handleChange} placeholder="Remarks" />
              <Button type="submit" className="rounded-2xl md:col-span-4"><FileText className="mr-2 h-4 w-4" /> Save RFQ Record</Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="rounded-2xl shadow-sm lg:col-span-2">
            <CardContent className="p-6">
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h2 className="text-xl font-semibold">RFQ Records</h2>
                <div className="flex flex-col gap-2 md:flex-row">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input className="rounded-xl border py-2 pl-9 pr-3" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search records" />
                  </div>
                  <select className="rounded-xl border p-2" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option>All</option><option>Quoted</option><option>Unquoted</option>
                  </select>
                  <select className="rounded-xl border p-2" value={filterOutcome} onChange={(e) => setFilterOutcome(e.target.value)}>
                    <option>All</option>{outcomes.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b bg-slate-100 text-left">
                      <th className="p-3">RFQ</th><th className="p-3">Category</th><th className="p-3">Client / Buyer</th><th className="p-3">Dates</th><th className="p-3">Event / Smart Group</th><th className="p-3">Quote</th><th className="p-3">Outcome</th><th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((r) => (
                      <tr key={r.id} className="border-b align-top hover:bg-white">
                        <td className="p-3 font-medium">{r.rfqNo}</td>
                        <td className="p-3">{r.materialCategory}</td>
                        <td className="p-3"><div>{r.client}</div><div className="text-slate-500">{r.buyer}</div></td>
                        <td className="p-3"><div>Received: {r.receivedDate}</div><div className="text-slate-500">Due: {r.dueDate}</div></td>
                        <td className="p-3"><div>{r.eventNo}</div><div className="text-slate-500">{r.smartGroup}</div></td>
                        <td className="p-3"><span className={`rounded-full px-2 py-1 text-xs ${r.status === "Quoted" ? "bg-green-100" : "bg-amber-100"}`}>{r.status}</span><div className="mt-1">{r.quoteRef}</div><div className="text-slate-500">{r.supplier || r.unquoteReason}</div></td>
                        <td className="p-3">{r.outcome}</td>
                        <td className="p-3"><button onClick={() => removeRecord(r.id)} className="rounded-lg p-2 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-2xl shadow-sm">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-2"><BarChart3 className="h-5 w-5" /><h2 className="text-xl font-semibold">Daily RFQ Received</h2></div>
                <div className="space-y-3">
                  {dailySummary.map(([date, s]) => (
                    <div key={date} className="rounded-xl border bg-white p-3">
                      <div className="font-medium">{date}</div>
                      <div className="text-sm text-slate-600">Total: {s.total} | Quoted: {s.quoted} | Unquoted: {s.unquoted}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-2"><BarChart3 className="h-5 w-5" /><h2 className="text-xl font-semibold">Monthly Summary</h2></div>
                <div className="space-y-3">
                  {monthlySummary.map(([month, s]) => (
                    <div key={month} className="rounded-xl border bg-white p-3">
                      <div className="font-medium">{month}</div>
                      <div className="text-sm text-slate-600">RFQ: {s.total} | Quoted: {s.quoted} | Unquoted: {s.unquoted}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
