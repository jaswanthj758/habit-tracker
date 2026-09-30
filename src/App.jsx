import { useState, useEffect } from "react";

const COLORS = [
  "#6366f1", // Indigo
  "#ec4899", // Pink
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#ef4444", // Red
  "#8b5cf6", // Purple
];

const today = () => new Date().toISOString().slice(0, 10);

const getLast7 = () =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    return d.toISOString().slice(0, 10);
  });

const getLast30 = () =>
  Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 29 + i);
    return d.toISOString().slice(0, 10);
  });

const dayLabel = (d) =>
  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
    new Date(d + "T12:00:00").getDay()
  ];

const fmt = (d) => {
  const [, m, day] = d.split("-");
  return `${m}/${day}`;
};

const defaultHabits = [
  { id: 1, name: "Morning Exercise", color: COLORS[0], completions: {} },
  { id: 2, name: "Read 20 mins", color: COLORS[1], completions: {} },
  { id: 3, name: "Drink 8 glasses of water", color: COLORS[2], completions: {} },
];

export default function App() {
  const [habits, setHabits] = useState(() => {
    try {
      const s = localStorage.getItem("habits_v2");
      return s ? JSON.parse(s) : defaultHabits;
    } catch {
      return defaultHabits;
    }
  });

  const [newName, setNewName] = useState("");
  const [colorIdx, setColorIdx] = useState(0);
  const [view, setView] = useState("today"); // today | progress
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("habits_v2", JSON.stringify(habits));
    } catch {}
  }, [habits]);

  const toggle = (id, date = today()) => {
    setHabits((h) =>
      h.map((item) =>
        item.id === id
          ? {
              ...item,
              completions: {
                ...item.completions,
                [date]: !item.completions[date],
              },
            }
          : item
      )
    );
  };

  const addHabit = () => {
    if (!newName.trim()) return;
    setHabits((h) => [
      ...h,
      {
        id: Date.now(),
        name: newName.trim(),
        color: COLORS[colorIdx],
        completions: {},
      },
    ]);
    setNewName("");
    setAdding(false);
    setColorIdx((c) => (c + 1) % COLORS.length);
  };

  const removeHabit = (id) => {
    setHabits((h) => h.filter((x) => x.id !== id));
  };

  const streak = (h) => {
    let s = 0;
    const d = new Date();
    while (true) {
      const k = d.toISOString().slice(0, 10);
      if (h.completions[k]) {
        s++;
        d.setDate(d.getDate() - 1);
      } else break;
    }
    return s;
  };

  const longestStreak = (h) => {
    const dates = Object.keys(h.completions)
      .filter((k) => h.completions[k])
      .sort();
    if (!dates.length) return 0;
    let max = 1,
      cur = 1;
    for (let i = 1; i < dates.length; i++) {
      const diff =
        (new Date(dates[i]) - new Date(dates[i - 1])) / 86400000;
      cur = diff === 1 ? cur + 1 : 1;
      if (cur > max) max = cur;
    }
    return max;
  };

  const pct30 = (h) => {
    const days = getLast30();
    const done = days.filter((d) => h.completions[d]).length;
    return Math.round((done / 30) * 100);
  };

  const last7 = getLast7();
  const t = today();
  const completedTodayCount = habits.filter((h) => h.completions[t]).length;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header
        style={{
          background: "linear-gradient(180deg, rgba(30, 27, 75, 0.8) 0%, rgba(15, 23, 42, 0.6) 100%)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "24px 16px 20px",
          textAlign: "center",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ maxWidth: 768, margin: "0 auto" }}>
          <div
            style={{
              fontSize: "clamp(22px, 5vw, 28px)",
              fontWeight: 800,
              letterSpacing: "-0.5px",
              background: "linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>🌿</span> Habit Tracker
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#94a3b8",
              marginTop: 4,
              fontWeight: 500,
            }}
          >
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </div>

          {/* View Switcher Pills */}
          <div
            style={{
              display: "inline-flex",
              background: "rgba(0, 0, 0, 0.3)",
              padding: 4,
              borderRadius: 30,
              gap: 4,
              marginTop: 18,
              border: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            {["today", "progress"].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: "8px 22px",
                  borderRadius: 24,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 13,
                  background:
                    view === v
                      ? "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
                      : "transparent",
                  color: view === v ? "#ffffff" : "#94a3b8",
                  boxShadow:
                    view === v
                      ? "0 4px 12px rgba(99, 102, 241, 0.35)"
                      : "none",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {v === "today" ? "Today" : "Progress"}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="app-container" style={{ flex: 1, paddingTop: 20 }}>
        {view === "today" && (
          <div className="animate-fade-in">
            {/* Today Header & Counter */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 8,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: "#94a3b8",
                  fontWeight: 700,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                Today's Habits
              </div>
              {habits.length > 0 && (
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: 12,
                    background: "rgba(99, 102, 241, 0.15)",
                    color: "#a5b4fc",
                    border: "1px solid rgba(99, 102, 241, 0.3)",
                  }}
                >
                  {completedTodayCount} / {habits.length} Done
                </div>
              )}
            </div>

            {/* Empty State */}
            {habits.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  color: "#64748b",
                  padding: "48px 20px",
                  background: "rgba(255, 255, 255, 0.02)",
                  borderRadius: 16,
                  border: "1px dashed rgba(255, 255, 255, 0.08)",
                  marginBottom: 16,
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>🌱</div>
                <div style={{ fontWeight: 600, color: "#94a3b8" }}>
                  No habits tracked yet
                </div>
                <div style={{ fontSize: 13, marginTop: 4 }}>
                  Add your first habit below to build your streak!
                </div>
              </div>
            )}

            {/* Habit List */}
            {habits.map((h) => {
              const done = !!h.completions[t];
              const s = streak(h);
              return (
                <div
                  key={h.id}
                  className="habit-card"
                  onClick={() => toggle(h.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    background: done
                      ? `linear-gradient(135deg, ${h.color}15 0%, rgba(23, 31, 48, 0.7) 100%)`
                      : "var(--bg-card)",
                    borderRadius: "var(--radius-md)",
                    padding: "16px 18px",
                    marginBottom: 12,
                    cursor: "pointer",
                    border: `1.5px solid ${
                      done ? h.color + "66" : "rgba(255, 255, 255, 0.07)"
                    }`,
                    boxShadow: done
                      ? `0 4px 16px -4px ${h.color}25`
                      : "none",
                  }}
                >
                  {/* Checkbox circle */}
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: done ? h.color : "transparent",
                      border: `2.5px solid ${h.color}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: done ? `0 0 10px ${h.color}66` : "none",
                    }}
                  >
                    {done && (
                      <span
                        style={{
                          fontSize: 14,
                          color: "#ffffff",
                          fontWeight: "bold",
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </div>

                  {/* Habit Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "clamp(15px, 4vw, 16px)",
                        color: done ? "#cbd5e1" : "#f1f5f9",
                        textDecoration: done ? "line-through" : "none",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {h.name}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: s > 0 ? h.color : "#64748b",
                        marginTop: 2,
                        fontWeight: s > 0 ? 600 : 400,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      {s > 0 ? (
                        <>🔥 {s} day streak</>
                      ) : (
                        "Tap to mark complete"
                      )}
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeHabit(h.id);
                    }}
                    title="Remove Habit"
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "none",
                      color: "#64748b",
                      cursor: "pointer",
                      fontSize: 14,
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#ef4444";
                      e.currentTarget.style.background =
                        "rgba(239, 68, 68, 0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#64748b";
                      e.currentTarget.style.background =
                        "rgba(255, 255, 255, 0.05)";
                    }}
                  >
                    ✕
                  </button>
                </div>
              );
            })}

            {/* Add Habit Button / Form */}
            {!adding ? (
              <button
                onClick={() => setAdding(true)}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "var(--radius-md)",
                  border: "1.5px dashed rgba(99, 102, 241, 0.4)",
                  background: "rgba(99, 102, 241, 0.05)",
                  color: "#818cf8",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                  marginTop: 6,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "rgba(99, 102, 241, 0.12)";
                  e.currentTarget.style.borderColor = "#6366f1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "rgba(99, 102, 241, 0.05)";
                  e.currentTarget.style.borderColor =
                    "rgba(99, 102, 241, 0.4)";
                }}
              >
                + Add New Habit
              </button>
            ) : (
              <div
                style={{
                  background: "var(--bg-card)",
                  borderRadius: "var(--radius-md)",
                  padding: 18,
                  marginTop: 6,
                  border: "1.5px solid rgba(99, 102, 241, 0.4)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                }}
              >
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addHabit();
                    if (e.key === "Escape") setAdding(false);
                  }}
                  placeholder="Habit name (e.g., Read 10 pages)…"
                  style={{
                    width: "100%",
                    background: "rgba(0, 0, 0, 0.3)",
                    border: "1.5px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "var(--radius-sm)",
                    padding: "12px 14px",
                    color: "#f1f5f9",
                    fontSize: 15,
                    outline: "none",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 14,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>
                    Color:
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    {COLORS.map((c, i) => (
                      <div
                        key={c}
                        onClick={() => setColorIdx(i)}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: c,
                          cursor: "pointer",
                          border:
                            colorIdx === i
                              ? "2.5px solid #ffffff"
                              : "2px solid transparent",
                          transform:
                            colorIdx === i ? "scale(1.15)" : "scale(1)",
                          boxShadow:
                            colorIdx === i ? `0 0 10px ${c}` : "none",
                          transition: "all 0.15s",
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ flex: 1, minWidth: 10 }} />
                  <button
                    onClick={() => setAdding(false)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#94a3b8",
                      cursor: "pointer",
                      fontSize: 13,
                      padding: "6px 12px",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addHabit}
                    style={{
                      background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                      border: "none",
                      borderRadius: "var(--radius-sm)",
                      color: "#ffffff",
                      padding: "8px 18px",
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
                    }}
                  >
                    Add Habit
                  </button>
                </div>
              </div>
            )}

            {/* Responsive Weekly Grid */}
            {habits.length > 0 && (
              <div style={{ marginTop: 32 }}>
                <div
                  style={{
                    fontSize: 13,
                    color: "#94a3b8",
                    fontWeight: 700,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    marginBottom: 10,
                  }}
                >
                  This Week
                </div>
                <div className="weekly-grid-container">
                  <div className="weekly-grid">
                    <div />
                    {last7.map((d) => (
                      <div
                        key={d}
                        style={{
                          textAlign: "center",
                          fontSize: 11,
                          color: d === t ? "#818cf8" : "#64748b",
                          fontWeight: d === t ? 700 : 500,
                        }}
                      >
                        {dayLabel(d)}
                        <br />
                        <span style={{ fontSize: 10, opacity: 0.8 }}>
                          {fmt(d)}
                        </span>
                      </div>
                    ))}
                    {habits.map((h) => (
                      <div
                        key={h.id}
                        style={{ display: "contents" }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            color: "#cbd5e1",
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            paddingRight: 8,
                          }}
                          title={h.name}
                        >
                          {h.name}
                        </div>
                        {last7.map((d) => (
                          <div
                            key={d}
                            onClick={() => toggle(h.id, d)}
                            title={`${h.name} - ${d}`}
                            style={{
                              width: "100%",
                              aspectRatio: "1",
                              maxHeight: 32,
                              maxWidth: 32,
                              margin: "0 auto",
                              borderRadius: 6,
                              background: h.completions[d]
                                ? h.color
                                : "rgba(255, 255, 255, 0.05)",
                              cursor: "pointer",
                              border:
                                d === t
                                  ? "1.5px solid rgba(255, 255, 255, 0.25)"
                                  : "1px solid transparent",
                              boxShadow: h.completions[d]
                                ? `0 2px 8px ${h.color}55`
                                : "none",
                              transition: "all 0.15s",
                            }}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {view === "progress" && (
          <div className="animate-fade-in">
            <div
              style={{
                fontSize: 13,
                color: "#94a3b8",
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
                marginTop: 8,
                marginBottom: 14,
              }}
            >
              30-Day Analytics & Heatmap
            </div>

            {habits.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  color: "#64748b",
                  padding: "48px 20px",
                  background: "rgba(255, 255, 255, 0.02)",
                  borderRadius: 16,
                  border: "1px dashed rgba(255, 255, 255, 0.08)",
                }}
              >
                No habits to report. Switch to Today tab to create one!
              </div>
            )}

            {habits.map((h) => {
              const p = pct30(h);
              const s = streak(h);
              const ls = longestStreak(h);
              const days30 = getLast30();
              const completed30Count = days30.filter(
                (d) => h.completions[d]
              ).length;

              return (
                <div
                  key={h.id}
                  style={{
                    background: "var(--bg-card)",
                    borderRadius: "var(--radius-lg)",
                    padding: "20px",
                    marginBottom: 16,
                    border: "1px solid var(--border-color)",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  {/* Header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: h.color,
                        flexShrink: 0,
                        boxShadow: `0 0 8px ${h.color}`,
                      }}
                    />
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "clamp(16px, 4vw, 18px)",
                        color: "#f1f5f9",
                        flex: 1,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {h.name}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: h.color,
                        fontWeight: 800,
                      }}
                    >
                      {p}%
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div
                    style={{
                      height: 8,
                      borderRadius: 4,
                      background: "rgba(255, 255, 255, 0.08)",
                      overflow: "hidden",
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${p}%`,
                        background: `linear-gradient(90deg, ${h.color}aa, ${h.color})`,
                        borderRadius: 4,
                        transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    />
                  </div>

                  {/* Stats Grid */}
                  <div className="progress-stats-grid">
                    {[
                      ["🔥", "Current", `${s}d`],
                      ["🏆", "Best", `${ls}d`],
                      ["✅", "30 Days", `${completed30Count}/30`],
                    ].map(([icon, label, val]) => (
                      <div
                        key={label}
                        style={{
                          background: "rgba(0, 0, 0, 0.25)",
                          padding: "10px 8px",
                          borderRadius: "var(--radius-sm)",
                          textAlign: "center",
                          border: "1px solid rgba(255, 255, 255, 0.04)",
                        }}
                      >
                        <div style={{ fontSize: 16, marginBottom: 2 }}>
                          {icon}
                        </div>
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: "#f1f5f9",
                          }}
                        >
                          {val}
                        </div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 30-Day Heatmap */}
                  <div style={{ marginTop: 16 }}>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#64748b",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        marginBottom: 8,
                      }}
                    >
                      30-Day Heatmap (Tap tile to toggle)
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(20px, 1fr))",
                        gap: 5,
                      }}
                    >
                      {days30.map((d) => (
                        <div
                          key={d}
                          title={`${d}: ${h.completions[d] ? "Completed" : "Not completed"}`}
                          onClick={() => toggle(h.id, d)}
                          style={{
                            aspectRatio: "1",
                            borderRadius: 4,
                            background: h.completions[d]
                              ? h.color
                              : "rgba(255, 255, 255, 0.06)",
                            cursor: "pointer",
                            boxShadow: h.completions[d]
                              ? `0 0 6px ${h.color}44`
                              : "none",
                            transition: "all 0.15s",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}