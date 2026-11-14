
import React, { useEffect, useMemo, useState } from "react";
import {
    Activity,
    Flame,
    CalendarDays,
    Plus,
    Pencil,
    Trash2,
    X,
    TrendingUp,
    HeartPulse,
    Target,
} from "lucide-react";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

import "../css/HealthFitness.css";

const STORAGE_KEY = "healthAndFitness";

const COLORS = ["#a78bfa", "#55c99a"];

const getToday = () => {
    const date = new Date();

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
    ].join("-");
};

const generateId = () =>
    `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const formatNumber = (number) =>
    Number(number || 0).toLocaleString("en-IN");

function HealthFitness() {
    const [records, setRecords] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [formError, setFormError] = useState("");
    const [isLoaded, setIsLoaded] = useState(false);

    const [formData, setFormData] = useState({
        date: getToday(),
        intake: "",
        burned: "",
        description: "",
    });

    // Load records from localStorage
    useEffect(() => {
        try {
            const savedRecords = localStorage.getItem("healthAndFitness");

            if (savedRecords) {
                const parsedRecords = JSON.parse(savedRecords);

                if (Array.isArray(parsedRecords)) {
                    setRecords(parsedRecords);
                }
            }
        } catch (error) {
            console.error("Error loading health data:", error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    // Save records to localStorage
    useEffect(() => {
        if (!isLoaded) return;

        try {
            localStorage.setItem(
                "healthAndFitness",
                JSON.stringify(records)
            );
        } catch (error) {
            console.error("Error saving health data:", error);
        }
    }, [records, isLoaded]);

    // Overall totals
    const totalIntake = useMemo(
        () =>
            records.reduce(
                (total, record) => total + Number(record.intake || 0),
                0
            ),
        [records]
    );

    const totalBurned = useMemo(
        () =>
            records.reduce(
                (total, record) => total + Number(record.burned || 0),
                0
            ),
        [records]
    );

    // Recent records
    const recentRecords = useMemo(
        () =>
            [...records]
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 5),
        [records]
    );

    // Calculate the last 7 calendar days
    const weeklyData = useMemo(() => {
        const result = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();

            date.setHours(0, 0, 0, 0);
            date.setDate(date.getDate() - i);

            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");

            const dateKey = `${year}-${month}-${day}`;

            const matchingRecords = records.filter(
                (record) => record.date === dateKey
            );

            result.push({
                date: dateKey,
                day: date.toLocaleDateString("en-US", {
                    weekday: "short",
                }),
                intake: matchingRecords.reduce(
                    (total, record) => total + Number(record.intake || 0),
                    0
                ),
                burned: matchingRecords.reduce(
                    (total, record) => total + Number(record.burned || 0),
                    0
                ),
            });
        }

        return result;
    }, [records]);

    // Show weekly chart only if a record exists in the last 7 days
    const hasWeeklyRecords = useMemo(
        () =>
            weeklyData.some(
                (day) =>
                    records.some((record) => record.date === day.date)
            ),
        [weeklyData, records]
    );

    // Pie chart
    const hasPieData = totalIntake + totalBurned > 0;

    const pieData = [
        {
            name: "Calories Intake",
            value: totalIntake,
        },
        {
            name: "Calories Burned",
            value: totalBurned,
        },
    ];

    // Reset form
    const resetForm = () => {
        setFormData({
            date: getToday(),
            intake: "",
            burned: "",
            description: "",
        });

        setSelectedRecord(null);
        setFormError("");
    };

    // Open Add modal
    const handleAdd = () => {
        setIsEditMode(false);
        resetForm();
        setIsModalOpen(true);
    };

    // Open Edit modal
    const handleEdit = (record) => {
        setIsEditMode(true);
        setSelectedRecord(record);

        setFormData({
            date: record.date,
            intake: String(record.intake),
            burned: String(record.burned),
            description: record.description,
        });

        setFormError("");
        setIsModalOpen(true);
    };

    // Close modal
    const handleClose = () => {
        setIsModalOpen(false);
        resetForm();
    };

    // Form changes
    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setFormError("");
    };

    // Submit Add/Edit
    const handleSubmit = (event) => {
        event.preventDefault();

        if (
            !formData.date ||
            formData.intake === "" ||
            formData.burned === "" ||
            !formData.description.trim()
        ) {
            setFormError("Please fill in all fields.");
            return;
        }

        if (
            !Number.isFinite(Number(formData.intake)) ||
            !Number.isFinite(Number(formData.burned)) ||
            Number(formData.intake) < 0 ||
            Number(formData.burned) < 0
        ) {
            setFormError("Please enter valid calorie values.");
            return;
        }

        const updatedRecord = {
            id: isEditMode ? selectedRecord.id : generateId(),
            date: formData.date,
            intake: Number(formData.intake),
            burned: Number(formData.burned),
            description: formData.description.trim(),
        };

        if (isEditMode) {
            setRecords((previous) =>
                previous.map((record) =>
                    record.id === selectedRecord.id
                        ? updatedRecord
                        : record
                )
            );
        } else {
            setRecords((previous) => [
                ...previous,
                updatedRecord,
            ]);
        }

        setIsModalOpen(false);
        resetForm();
    };

    // Delete record
    const handleDelete = (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this health record?"
        );

        if (!confirmed) return;

        setRecords((previous) =>
            previous.filter((record) => record.id !== id)
        );
    };

    return (
        <main className="hf-app">

            {/* HEADER */}
            <header className="hf-header">
                <div className="hf-brand">
                    <div className="hf-brand-icon">
                        <HeartPulse size={22} />
                    </div>

                    <div>
                        <h1>Health And Fitness Tracker</h1>
                        <p>Your daily wellness, in focus.</p>
                    </div>
                </div>


                <button
                    type="button"
                    className="hf-add-btn"
                    onClick={handleAdd}
                >
                    + Add data
                </button>

            </header>

            {/* HERO */}
            <section className="hf-hero">
                <div className="hf-hero-content">
                    <span className="hf-eyebrow">
                        YOUR HEALTH JOURNEY
                    </span>

                    <h2>
                        Small steps.
                        <br />
                        <span>Stronger habits.</span>
                    </h2>

                    <p>
                        Take control of your health journey. Record your
                        daily calories, track your activity and build
                        healthier habits every day.
                    </p>

                    <button
                        type="button"
                        className="hf-secondary-btn"
                        onClick={handleAdd}
                    >
                        <Plus size={16} />
                        Update Today's Data
                    </button>
                </div>

                <div className="hf-hero-art">
                    <div className="hf-hero-ring">
                        <div className="hf-hero-inner">
                            <Activity size={38} />
                        </div>
                    </div>

                    <span>STAY ACTIVE</span>

                    <div className="hf-floating-icon hf-float-one">
                        <Flame size={19} />
                    </div>

                    <div className="hf-floating-icon hf-float-two">
                        <TrendingUp size={19} />
                    </div>
                </div>
            </section>

            {/* STATISTICS */}
            <section className="hf-stats">
                <div className="hf-stat-card">
                    <div className="hf-stat-icon orange">
                        <Flame size={21} />
                    </div>

                    <div>
                        <span>Total Calories Intake</span>
                        <strong>{formatNumber(totalIntake)} kcal</strong>
                    </div>
                </div>

                <div className="hf-stat-card">
                    <div className="hf-stat-icon purple">
                        <Activity size={21} />
                    </div>

                    <div>
                        <span>Total Calories Burned</span>
                        <strong>{formatNumber(totalBurned)} kcal</strong>
                    </div>
                </div>

                <div className="hf-stat-card">
                    <div className="hf-stat-icon blue">
                        <CalendarDays size={21} />
                    </div>

                    <div>
                        <span>Total Days Tracked</span>
                        <strong>{records.length}</strong>
                    </div>
                </div>
            </section>

            {/* CHARTS */}
            <section className="hf-chart-grid">

                {/* WEEKLY HEALTH TRENDS */}
                {hasWeeklyRecords && (
                    <div className="hf-panel hf-weekly-panel">
                        <div className="hf-section-heading">
                            <div>
                                <span className="hf-eyebrow">
                                    YOUR ACTIVITY
                                </span>

                                <h2>Weekly Health Trends</h2>
                            </div>

                            <span className="hf-pill">
                                LAST 7 DAYS
                            </span>
                        </div>

                        <div className="hf-bar-chart">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={weeklyData}
                                    margin={{
                                        top: 10,
                                        right: 10,
                                        left: -18,
                                        bottom: 0,
                                    }}
                                    barGap={5}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 5"
                                        stroke="#3a4656"
                                        vertical={false}
                                    />

                                    <XAxis
                                        dataKey="day"
                                        stroke="#94a3b8"
                                        tickLine={false}
                                        axisLine={false}
                                        fontSize={11}
                                    />

                                    <YAxis
                                        stroke="#94a3b8"
                                        tickLine={false}
                                        axisLine={false}
                                        fontSize={10}
                                    />

                                    <Tooltip
                                        contentStyle={{
                                            background: "#182231",
                                            border: "1px solid #3a4657",
                                            borderRadius: "10px",
                                            color: "#fff",
                                        }}
                                    />

                                    <Bar
                                        dataKey="intake"
                                        name="Calories Intake"
                                        fill="#a78bfa"
                                        radius={[5, 5, 0, 0]}
                                        maxBarSize={25}
                                    />

                                    <Bar
                                        dataKey="burned"
                                        name="Calories Burned"
                                        fill="#55c99a"
                                        radius={[5, 5, 0, 0]}
                                        maxBarSize={25}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="hf-legend">
                            <span>
                                <i className="intake-dot" />
                                Calories Intake
                            </span>

                            <span>
                                <i className="burned-dot" />
                                Calories Burned
                            </span>
                        </div>
                    </div>
                )}

                {/* OVERALL DATA */}
                <div className="hf-panel hf-overall-panel">
                    <div className="hf-section-heading">
                        <div>
                            <span className="hf-eyebrow">
                                YOUR BALANCE
                            </span>

                            <h2>Overall Data</h2>
                        </div>
                    </div>

                    <div className="hf-pie-chart">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={
                                        hasPieData
                                            ? pieData
                                            : [{ name: "No data yet", value: 1 }]
                                    }
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={80}
                                    paddingAngle={hasPieData ? 3 : 0}
                                    stroke="none"
                                >
                                    {(hasPieData
                                        ? pieData
                                        : [{ name: "No data yet", value: 1 }]
                                    ).map((entry, index) => (
                                        <Cell
                                            key={entry.name}
                                            fill={
                                                hasPieData
                                                    ? COLORS[index]
                                                    : "#394659"
                                            }
                                        />
                                    ))}
                                </Pie>

                                {hasPieData && (
                                    <Tooltip
                                        contentStyle={{
                                            background: "#182231",
                                            border: "1px solid #3a4657",
                                            borderRadius: "10px",
                                            color: "#fff",
                                        }}
                                    />
                                )}
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="hf-pie-center">
                            <strong>{records.length}</strong>
                            <span>ENTRIES</span>
                        </div>
                    </div>

                    <div className="hf-pie-legend">
                        <div>
                            <span>
                                <i className="intake-dot" />
                                Calories Intake
                            </span>

                            <strong>{formatNumber(totalIntake)}</strong>
                        </div>

                        <div>
                            <span>
                                <i className="burned-dot" />
                                Calories Burned
                            </span>

                            <strong>{formatNumber(totalBurned)}</strong>
                        </div>
                    </div>

                    {!hasPieData && (
                        <p className="hf-empty-hint">
                            Your overall data will appear here after
                            adding your first record.
                        </p>
                    )}
                </div>
            </section>

            {/* RECENT HEALTH STATISTICS */}
            <section className="hf-panel hf-recent-panel">
                <div className="hf-section-heading">
                    <div>
                        <span className="hf-eyebrow">
                            YOUR JOURNAL
                        </span>

                        <h2>Recent Health Statistics</h2>
                    </div>

                    <span className="hf-pill">
                        {records.length} RECORDS
                    </span>
                </div>

                {recentRecords.length > 0 ? (
                    <div className="hf-record-list">
                        {recentRecords.map((record) => (
                            <article
                                className="hf-record-row"
                                key={record.id}
                            >
                                <div className="hf-record-info">
                                    <div className="hf-record-date-icon">
                                        <CalendarDays size={17} />
                                    </div>

                                    <div className="hf-record-description">
                                        <strong>{record.date}</strong>
                                        <p>{record.description}</p>
                                    </div>
                                </div>

                                <div className="hf-record-metrics">
                                    <div>
                                        <span>INTAKE</span>

                                        <strong className="intake-text">
                                            Calories Intake = {record.intake}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>BURNED</span>

                                        <strong className="burned-text">
                                            Calories Burned = {record.burned}
                                        </strong>
                                    </div>
                                </div>

                                <div className="hf-record-actions">
                                    <button
                                        type="button"
                                        className="hf-edit-btn"
                                        onClick={() => handleEdit(record)}
                                        aria-label="Edit record"
                                        title="Edit"
                                    >
                                        <Pencil size={15} />
                                    </button>

                                    <button
                                        type="button"
                                        className="hf-delete-btn"
                                        onClick={() => handleDelete(record.id)}
                                        aria-label="Delete record"
                                        title="Delete"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="hf-empty-records">
                        <div className="hf-empty-icon">
                            <Target size={23} />
                        </div>

                        <h3>No health statistics yet</h3>

                        <p>
                            Your daily health records will appear here.
                            Start tracking your progress today.
                        </p>

                        <button
                            type="button"
                            className="hf-secondary-btn"
                            onClick={handleAdd}
                        >
                            <Plus size={15} />
                            Update Today's Data
                        </button>
                    </div>
                )}
            </section>

            {/* FOOTER */}
            <footer className="hf-footer">
                <span>HEALTH AND FITNESS TRACKER</span>
                <span>Small progress is still progress.</span>
            </footer>

            {/* ADD / EDIT MODAL */}
            {isModalOpen && (
                <div
                    className="hf-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            handleClose();
                        }
                    }}
                >
                    <section
                        className="hf-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="hf-modal-title"
                    >
                        <button
                            type="button"
                            className="hf-modal-close"
                            onClick={handleClose}
                            aria-label="Close modal"
                        >
                            <X size={19} />
                        </button>

                        <span className="hf-eyebrow">
                            {isEditMode
                                ? "UPDATE YOUR RECORD"
                                : "DAILY HEALTH LOG"}
                        </span>

                        <h2 id="hf-modal-title">
                            {isEditMode
                                ? "Let's see what you want to change!"
                                : "Update Today's Data"}
                        </h2>

                        <p className="hf-modal-subtitle">
                            {isEditMode
                                ? "Edit your existing health information."
                                : "Enter your daily health information below."}
                        </p>

                        <form onSubmit={handleSubmit}>
                            <div className="hf-form-group">
                                <label htmlFor="date">Date</label>

                                <input
                                    id="date"
                                    name="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="hf-form-grid">
                                <div className="hf-form-group">
                                    <label htmlFor="intake">
                                        Calories Intake
                                    </label>

                                    <input
                                        id="intake"
                                        name="intake"
                                        type="number"
                                        min="0"
                                        step="1"
                                        placeholder="Enter Today's Calorie Intake"
                                        value={formData.intake}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="hf-form-group">
                                    <label htmlFor="burned">
                                        Calories Burned
                                    </label>

                                    <input
                                        id="burned"
                                        name="burned"
                                        type="number"
                                        min="0"
                                        step="1"
                                        placeholder="Enter Today's Calorie Burned"
                                        value={formData.burned}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="hf-form-group">
                                <label htmlFor="description">
                                    Short Description
                                </label>

                                <input
                                    id="description"
                                    name="description"
                                    type="text"
                                    placeholder="Enter a short description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {formError && (
                                <p className="hf-form-error" role="alert">
                                    {formError}
                                </p>
                            )}

                            <div className="hf-modal-actions">
                                <button
                                    type="submit"
                                    className="hf-submit-btn"
                                >
                                    Submit
                                </button>

                                <button
                                    type="button"
                                    className="hf-cancel-btn"
                                    onClick={handleClose}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </main>
    );
}

export default HealthFitness;
