import React, { useEffect, useMemo, useState } from "react";
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
import {
  Activity,
  Flame,
  CalendarDays,
  Plus,
  Pencil,
  Trash2,
  X,
  TrendingUp,
} from "lucide-react";

import "../css/HealthFitness.css";

const STORAGE_KEY = "healthAndFitness";

const today = () => {
  const date = new Date();
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

const formatDate = (date) => {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const COLORS = ["#a78bfa", "#55c99a"];

function HealthFitness() {
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [formData, setFormData] = useState({
    date: today(),
    intake: "",
    burned: "",
    description: "",
  });

  const [error, setError] = useState("");

  // Load records from localStorage
  useEffect(() => {
    try {
      const savedRecords = localStorage.getItem(STORAGE_KEY);

      if (savedRecords) {
        const parsedRecords = JSON.parse(savedRecords);

        if (Array.isArray(parsedRecords)) {
          setRecords(parsedRecords);
        }
      }
    } catch (err) {
      console.error("Error loading health records:", err);
    }
  }, []);

  // Save records to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  // Calculate overall statistics
  const totalIntake = records.reduce(
    (sum, record) => sum + Number(record.intake || 0),
    0
  );

  const totalBurned = records.reduce(
    (sum, record) => sum + Number(record.burned || 0),
    0
  );

  // Recent records
  const recentRecords = useMemo(() => {
    return [...records]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
  }, [records]);

  // Last 7 calendar days, including today
  const weeklyData = useMemo(() => {
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);

      const dateKey = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-");

      const matchingRecords = records.filter(
        (record) => record.date === dateKey
      );

      result.push({
        day: date.toLocaleDateString("en-US", {
          weekday: "short",
        }),
        intake: matchingRecords.reduce(
          (sum, record) => sum + Number(record.intake || 0),
          0
        ),
        burned: matchingRecords.reduce(
          (sum, record) => sum + Number(record.burned || 0),
          0
        ),
      });
    }

    return result;
  }, [records]);

  // Pie chart data
  const pieData = [
    { name: "Calories Intake", value: totalIntake },
    { name: "Calories Burned", value: totalBurned },
  ];

  const hasPieData = totalIntake + totalBurned > 0;

  // Open Add modal
  const handleAdd = () => {
    setIsEditMode(false);
    setSelectedRecord(null);

    setFormData({
      date: today(),
      intake: "",
      burned: "",
      description: "",
    });

    setError("");
    setIsModalOpen(true);
  };

  // Open Edit modal
  const handleEdit = (record) => {
    setIsEditMode(true);
    setSelectedRecord(record);

    setFormData({
      date: record.date,
      intake: record.intake,
      burned: record.burned,
      description: record.description,
    });

    setError("");
    setIsModalOpen(true);
  };

  // Form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add or update record
  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.date ||
      formData.intake === "" ||
      formData.burned === "" ||
      !formData.description.trim()
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (
      Number(formData.intake) < 0 ||
      Number(formData.burned) < 0
    ) {
      setError("Calories cannot be negative.");
      return;
    }

    if (isEditMode && selectedRecord) {
      setRecords((prev) =>
        prev.map((record) =>
          record.id === selectedRecord.id
            ? {
                ...record,
                date: formData.date,
                intake: Number(formData.intake),
                burned: Number(formData.burned),
                description: formData.description.trim(),
              }
            : record
        )
      );
    } else {
      const newRecord = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        date: formData.date,
        intake: Number(formData.intake),
        burned: Number(formData.burned),
        description: formData.description.trim(),
      };

      setRecords((prev) => [...prev, newRecord]);
    }

    setIsModalOpen(false);
    setSelectedRecord(null);
    setError("");
  };

  // Delete record
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      setRecords((prev) => prev.filter((record) => record.id !== id));
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
    setError("");
  };

  return (
    <div className="hf-app">
      {/* Header */}
      <header className="hf-header">
        <div className="hf-brand">
          <div className="hf-brand-icon">
            <Activity size={21} />
          </div>

          <div>
            <h1>Health And Fitness Tracker</h1>
            <p>Your daily wellness, in focus.</p>
          </div>
        </div>

        <button className="hf-add-btn" onClick={handleAdd}>
          <Plus size={17} />
          + Add data
        </button>
      </header>

      {/* Welcome Section */}
      <section className="hf-hero">
        <div className="hf-hero-content">
          <span className="hf-eyebrow">YOUR HEALTH JOURNEY</span>

          <h2>
            Small steps.
            <br />
            <span>Stronger habits.</span>
          </h2>

          <p>
            Track your daily calorie intake and burned calories.
            Keep your health journey organized and monitor your progress.
          </p>

          <button className="hf-secondary-btn" onClick={handleAdd}>
            <Plus size={16} />
            Update Today's Data
          </button>
        </div>

        <div className="hf-hero-graphic">
          <div className="hf-hero-circle">
            <Activity size={42} />
          </div>
          <span>STAY ACTIVE</span>
        </div>
      </section>

      {/* Statistics */}
      <section className="hf-stats">
        <div className="hf-stat-card">
          <div className="hf-stat-icon orange">
            <Flame size={20} />
          </div>

          <div>
            <span>Total Calories Intake</span>
            <strong>{totalIntake.toLocaleString()} kcal</strong>
          </div>
        </div>

        <div className="hf-stat-card">
          <div className="hf-stat-icon purple">
            <Activity size={20} />
          </div>

          <div>
            <span>Total Calories Burned</span>
            <strong>{totalBurned.toLocaleString()} kcal</strong>
          </div>
        </div>

        <div className="hf-stat-card">
          <div className="hf-stat-icon blue">
            <CalendarDays size={20} />
          </div>

          <div>
            <span>Total Days Tracked</span>
            <strong>{records.length}</strong>
          </div>
        </div>
      </section>

      {/* Charts */}
      <section className="hf-chart-grid">
        {/* Weekly Chart */}
        {records.length > 0 && (
          <div className="hf-panel hf-weekly-panel">
            <div className="hf-section-heading">
              <div>
                <span className="hf-eyebrow">YOUR ACTIVITY</span>
                <h2>Weekly Health Trends</h2>
              </div>

              <span className="hf-pill">LAST 7 DAYS</span>
            </div>

            <div className="hf-bar-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -15,
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
                  />

                  <YAxis
                    stroke="#94a3b8"
                    tickLine={false}
                    axisLine={false}
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
                  />

                  <Bar
                    dataKey="burned"
                    name="Calories Burned"
                    fill="#55c99a"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="hf-legend">
              <span><i className="intake-dot" /> Calories Intake</span>
              <span><i className="burned-dot" /> Calories Burned</span>
            </div>
          </div>
        )}

        {/* Overall Pie Chart */}
        <div className="hf-panel hf-overall-panel">
          <div className="hf-section-heading">
            <div>
              <span className="hf-eyebrow">YOUR BALANCE</span>
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
                      fill={hasPieData ? COLORS[index] : "#394659"}
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
              <span><i className="intake-dot" /> Calories Intake</span>
              <strong>{totalIntake.toLocaleString()}</strong>
            </div>

            <div>
              <span><i className="burned-dot" /> Calories Burned</span>
              <strong>{totalBurned.toLocaleString()}</strong>
            </div>
          </div>

          {!hasPieData && (
            <p className="hf-empty-hint">
              Your overall data will appear here after adding records.
            </p>
          )}
        </div>
      </section>

      {/* Recent Health Statistics */}
      <section className="hf-panel hf-recent-panel">
        <div className="hf-section-heading">
          <div>
            <span className="hf-eyebrow">YOUR JOURNAL</span>
            <h2>Recent Health Statistics</h2>
          </div>

          <span className="hf-pill">
            {records.length} RECORDS
          </span>
        </div>

        {recentRecords.length > 0 ? (
          <div className="hf-record-list">
            {recentRecords.map((record) => (
              <div className="hf-record-row" key={record.id}>
                <div className="hf-record-info">
                  <div className="hf-record-date-icon">
                    <CalendarDays size={17} />
                  </div>

                  <div>
                    <strong>{formatDate(record.date)}</strong>
                    <p>{record.description}</p>
                  </div>
                </div>

                <div className="hf-record-metrics">
                  <div>
                    <span>INTAKE</span>
                    <strong className="intake-text">
                      {Number(record.intake).toLocaleString()} kcal
                    </strong>
                  </div>

                  <div>
                    <span>BURNED</span>
                    <strong className="burned-text">
                      {Number(record.burned).toLocaleString()} kcal
                    </strong>
                  </div>
                </div>

                <div className="hf-record-actions">
                  <button
                    className="hf-edit-btn"
                    onClick={() => handleEdit(record)}
                    aria-label="Edit record"
                  >
                    <Pencil size={15} />
                  </button>

                  <button
                    className="hf-delete-btn"
                    onClick={() => handleDelete(record.id)}
                    aria-label="Delete record"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="hf-empty-records">
            <div className="hf-empty-icon">
              <CalendarDays size={23} />
            </div>

            <h3>No health statistics yet</h3>

            <p>
              Start tracking your daily calories by adding your first record.
            </p>

            <button className="hf-secondary-btn" onClick={handleAdd}>
              <Plus size={15} />
              Update Today's Data
            </button>
          </div>
        )}
      </section>

      <footer className="hf-footer">
        <span>HEALTH AND FITNESS TRACKER</span>
        <span>Your data stays on this device.</span>
      </footer>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div
          className="hf-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="hf-modal">
            <button
              className="hf-modal-close"
              onClick={closeModal}
              aria-label="Close modal"
            >
              <X size={19} />
            </button>

            <span className="hf-eyebrow">
              {isEditMode ? "UPDATE YOUR RECORD" : "DAILY HEALTH LOG"}
            </span>

            <h2>
              {isEditMode
                ? "Let's see what you want to change!"
                : "Update Today's Data"}
            </h2>

            <p className="hf-modal-subtitle">
              {isEditMode
                ? "Change your existing health record."
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
                  <label htmlFor="intake">Calories Intake</label>

                  <input
                    id="intake"
                    name="intake"
                    type="number"
                    min="0"
                    placeholder="Enter Today's Calorie Intake"
                    value={formData.intake}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="hf-form-group">
                  <label htmlFor="burned">Calories Burned</label>

                  <input
                    id="burned"
                    name="burned"
                    type="number"
                    min="0"
                    placeholder="Enter Today's Calorie Burned"
                    value={formData.burned}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="hf-form-group">
                <label htmlFor="description">Short Description</label>

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

              {error && (
                <p className="hf-form-error">{error}</p>
              )}

              <div className="hf-modal-actions">
                <button type="submit" className="hf-submit-btn">
                  Submit
                </button>

                <button
                  type="button"
                  className="hf-cancel-btn"
                  onClick={closeModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default HealthFitness;