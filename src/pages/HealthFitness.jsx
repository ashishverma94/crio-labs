import React, { useEffect, useMemo, useState } from "react";
import {
    Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
    Tooltip, XAxis, YAxis
} from "recharts";
import {
    Plus,
    Pencil, Trash2, X, Activity, Flame, CalendarDays, TrendingUp
} from "lucide-react";

import "../css/HealthFitness.css"


const STORAGE_KEY = "healthAndFitness";
const COLORS = ["#a855f7", "#f59e0b"];
const todayISO = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const formatDate = (value) => new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    day: "2-digit", month: "short", year: "numeric"
});
const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function HealthModal({ mode, record, onClose, onSave }) {
    const [form, setForm] = useState({
        date: record?.date || todayISO(),
        intake: record?.intake ?? "",
        burned: record?.burned ?? "",
        description: record?.description || ""
    });
    const [error, setError] = useState("");

    useEffect(() => {
        setForm({
            date: record?.date || todayISO(),
            intake: record?.intake ?? "",
            burned: record?.burned ?? "",
            description: record?.description || ""
        });
        setError("");
    }, [record, mode]);

    const update = (e) => setForm((current) => ({ ...current, [e.target.name]: e.target.value }));

    function submit(e) {
        e.preventDefault();
        if (!form.date || form.intake === "" || form.burned === "" || !form.description.trim()) {
            setError("Please complete all fields before submitting.");
            return;
        }
        if (Number(form.intake) < 0 || Number(form.burned) < 0) {
            setError("Calories cannot be negative.");
            return;
        }
        onSave({
            ...(record || {}),
            id: record?.id || makeId(),
            date: form.date,
            intake: Number(form.intake),
            burned: Number(form.burned),
            description: form.description.trim()
        });
    }

    return (
        <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                <button className="modal-close" onClick={onClose} aria-label="Close dialog"><X size={17} /></button>
                <div className="modal-kicker">{mode === "add" ? "DAILY HEALTH LOG" : "UPDATE YOUR RECORD"}</div>
                <h2 id="modal-title">{mode === "add" ? "How Much Net Calories did you take Today?" : "Let's see what you want to change!"}</h2>
                <p className="modal-subtitle">{mode === "add" ? "A few details help you understand your daily progress." : "Edit the details below and save your changes."}</p>
                <form onSubmit={submit}>
                    <label>Date<input name="date" type="date" value={form.date} onChange={update} required /></label>
                    <div className="form-grid">
                        <label>Calories Intake
                            <input name="intake" type="number" min="0" step="1" placeholder="Enter Today's Calorie Intake" value={form.intake} onChange={update} required />
                        </label>
                        <label>Calories Burned
                            <input name="burned" type="number" min="0" step="1" placeholder="Enter Today's Calorie Burned" value={form.burned} onChange={update} required />
                        </label>
                    </div>
                    <label>Short Description
                        <input name="description" type="text" placeholder="Enter a short description" value={form.description} onChange={update} maxLength="90" required />
                    </label>
                    {error && <p className="form-error" role="alert">{error}</p>}
                    <div className="modal-actions">
                        <button type="submit" className="btn btn-primary">Submit</button>
                        <button type="button" className="btn btn-danger" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </section>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, tone }) {
    return <div className="mini-stat">
        <span className={`stat-icon ${tone}`}><Icon size={16} /></span>
        <span className="stat-copy"><small>{label}</small><strong>{value}</strong></span>
    </div>;
}

export default function App() {
    const [records, setRecords] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [mode, setMode] = useState("add");
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) setRecords(parsed);
            }
        } catch (error) {
            console.error("Could not load health records:", error);
        } finally {
            setLoaded(true);
        }
    }, []);

    useEffect(() => {
        if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    }, [records, loaded]);

    const sorted = useMemo(() => [...records].sort((a, b) => b.date.localeCompare(a.date)), [records]);
    const recent = sorted.slice(0, 5);
    const totals = useMemo(() => records.reduce((sum, item) => ({
        intake: sum.intake + Number(item.intake || 0),
        burned: sum.burned + Number(item.burned || 0)
    }), { intake: 0, burned: 0 }), [records]);

    const weeklyData = useMemo(() => {
        const days = [];
        const now = new Date();
        for (let offset = 6; offset >= 0; offset--) {
            const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
            const dayRecords = records.filter((r) => r.date === key);
            days.push({
                day: date.toLocaleDateString(undefined, { weekday: "short" }),
                intake: dayRecords.reduce((sum, r) => sum + Number(r.intake || 0), 0),
                burned: dayRecords.reduce((sum, r) => sum + Number(r.burned || 0), 0)
            });
        }
        return days;
    }, [records]);

    const pieData = [
        { name: "Calories Intake", value: totals.intake },
        { name: "Calories Burned", value: totals.burned }
    ];
    const hasChartData = totals.intake + totals.burned > 0;
    const openAdd = () => { setMode("add"); setSelected(null); setModalOpen(true); };
    const openEdit = (record) => { setMode("edit"); setSelected(record); setModalOpen(true); };
    const saveRecord = (record) => {
        setRecords((current) => mode === "edit"
            ? current.map((item) => item.id === record.id ? record : item)
            : [...current, record]);
        setModalOpen(false);
        setSelected(null);
    };
    const deleteRecord = (id) => {
        if (window.confirm("Delete this health record? This action cannot be undone.")) {
            setRecords((current) => current.filter((item) => item.id !== id));
        }
    };

    return (
        <main className="app-shell">
            <header className="topbar">
                <div className="brand">
                    <div className="brand-mark"><Activity size={19} /></div>
                    <div><h1>Health And Fitness Tracker</h1><p>Your daily wellness, in focus.</p></div>
                </div>
                <button className="btn btn-add" onClick={openAdd}><Plus size={17} /> Add data</button>
            </header>

            <section className="summary-grid">
                <div className="summary-card welcome-card">
                    <div className="card-heading"><span className="eyebrow">YOUR OVERVIEW</span><span className="live-dot">● TODAY</span></div>
                    <div className="welcome-content">
                        <div>
                            <h2>Small steps.<br /><em>Stronger habits.</em></h2>
                            <p>Keep track of what you take in and what you burn. Your progress starts with today's entry.</p>
                            <button className="btn btn-soft" onClick={openAdd}><Plus size={15} /> Add today's data</button>
                        </div>
                        <div className="activity-orbit"><div className="orbit-ring"><Activity size={35} /></div><span>STAY ACTIVE</span></div>
                    </div>
                </div>
                <div className="summary-card quick-stats">
                    <div className="card-heading"><span className="eyebrow">ALL-TIME TOTALS</span><TrendingUp size={17} className="muted-icon" /></div>
                    <StatCard icon={Flame} label="Calories intake" value={`${totals.intake.toLocaleString()} kcal`} tone="orange" />
                    <StatCard icon={Activity} label="Calories burned" value={`${totals.burned.toLocaleString()} kcal`} tone="purple" />
                    <StatCard icon={CalendarDays} label="Days tracked" value={`${records.length}`} tone="blue" />
                </div>
            </section>

            <section className="content-grid">
                <div className="panel trends-panel">
                    <div className="section-heading">
                        <div><span className="eyebrow">YOUR ACTIVITY</span><h2>Weekly Health Trends</h2></div>
                        <span className="range-pill">LAST 7 DAYS</span>
                    </div>
                    {records.length > 0 ? (
                        <div className="chart-wrap">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }} barGap={5}>
                                    <CartesianGrid strokeDasharray="3 5" stroke="#343e4d" vertical={false} />
                                    <XAxis dataKey="day" tick={{ fill: "#9ca8b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: "#8290a2", fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ background: "#182231", border: "1px solid #3a4657", borderRadius: 10, color: "#fff" }} />
                                    <Bar dataKey="intake" name="Calories Intake" fill="#9b75e8" radius={[5, 5, 0, 0]} maxBarSize={22} />
                                    <Bar dataKey="burned" name="Calories Burned" fill="#62c49a" radius={[5, 5, 0, 0]} maxBarSize={22} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : <div className="empty-chart"><div className="empty-chart-icon"><Activity size={23} /></div><strong>Your weekly trends will appear here</strong><span>Add your first health record to start tracking.</span><button onClick={openAdd} className="text-button">+ Add your first record</button></div>}
                    <div className="chart-legend"><span><i className="legend-dot intake-dot" />Calories Intake</span><span><i className="legend-dot burned-dot" />Calories Burned</span></div>
                </div>

                <div className="panel overall-panel">
                    <div className="section-heading"><div><span className="eyebrow">YOUR BALANCE</span><h2>Overall Data</h2></div></div>
                    <div className="pie-wrap">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={hasChartData ? pieData : [{ name: "No data yet", value: 1 }]} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={53} outerRadius={78} paddingAngle={hasChartData ? 3 : 0} stroke="none">
                                    {(hasChartData ? pieData : [{ name: "No data yet", value: 1 }]).map((entry, index) =>
                                        <Cell key={entry.name} fill={hasChartData ? COLORS[index] : "#354153"} />
                                    )}
                                </Pie>
                                {hasChartData && <Tooltip contentStyle={{ background: "#182231", border: "1px solid #3a4657", borderRadius: 10, color: "#fff" }} />}
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="pie-center"><strong>{records.length}</strong><span>ENTRIES</span></div>
                    </div>
                    <div className="pie-legend">
                        <div><span><i className="legend-dot intake-dot" />Intake</span><strong>{totals.intake.toLocaleString()}</strong></div>
                        <div><span><i className="legend-dot burned-dot" />Burned</span><strong>{totals.burned.toLocaleString()}</strong></div>
                    </div>
                    {!hasChartData && <p className="pie-hint">Your overall data will build as you log activity.</p>}
                </div>
            </section>

            <section className="panel recent-panel">
                <div className="section-heading recent-heading">
                    <div><span className="eyebrow">YOUR JOURNAL</span><h2>Recent Health Statistics</h2></div>
                    <span className="record-count">{records.length} {records.length === 1 ? "RECORD" : "RECORDS"}</span>
                </div>
                {recent.length ? (
                    <div className="records-list">
                        {recent.map((record) => (
                            <article className="record-row" key={record.id}>
                                <div className="record-date"><span className="date-icon"><CalendarDays size={15} /></span><div><strong>{formatDate(record.date)}</strong><small>{record.description}</small></div></div>
                                <div className="record-metrics"><span className="metric intake-metric"><small>INTAKE</small><strong>{Number(record.intake).toLocaleString()} <i>kcal</i></strong></span><span className="metric burned-metric"><small>BURNED</small><strong>{Number(record.burned).toLocaleString()} <i>kcal</i></strong></span></div>
                                <div className="record-actions">
                                    <button className="icon-button edit-button" onClick={() => openEdit(record)} aria-label={`Edit record for ${formatDate(record.date)}`}><Pencil size={15} /></button>
                                    <button className="icon-button delete-button" onClick={() => deleteRecord(record.id)} aria-label={`Delete record for ${formatDate(record.date)}`}><Trash2 size={15} /></button>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : <div className="empty-records"><div className="empty-record-icon"><CalendarDays size={20} /></div><div><strong>No health statistics yet</strong><p>Your recent entries will show up here once you add your daily data.</p></div><button className="btn btn-outline" onClick={openAdd}>Add first record</button></div>}
                {records.length > 5 && <p className="recent-footnote">Showing the 5 most recent records.</p>}
            </section>
            <footer className="footer"><span>HEALTH AND FITNESS TRACKER</span><span>Built for your everyday progress <b>·</b> Your data stays on this device</span></footer>

            {modalOpen && <HealthModal mode={mode} record={selected} onClose={() => setModalOpen(false)} onSave={saveRecord} />}
        </main>
    );
}