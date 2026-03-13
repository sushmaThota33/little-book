import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";
import "./index.css";

export default function App() {
  const [writer, setWriter] = useState("Bujji");
  const [text, setText] = useState("");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const today = new Date();
  const todayStr = formatDate(today);
  const currentMonth = formatMonth(today);

  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    const { data, error } = await supabase
      .from("entries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch error:", error);
      setMessage("Could not load entries");
      return;
    }

    setEntries(data || []);
  }

  async function handleSave() {
    if (!text.trim()) {
      setMessage("Please write something first");
      return;
    }

    setLoading(true);
    setMessage("");

    const now = new Date();

    const payload = {
      writer,
      text: text.trim(),
      written_month: formatMonth(now),
      unlock_date: getNextMonthThird(now),
    };

    const { error } = await supabase.from("entries").insert([payload]);

    setLoading(false);

    if (error) {
      console.error("Insert error:", error);
      setMessage("Could not save note");
      return;
    }

    setText("");
    setMessage("Saved 💛");
    fetchEntries();
  }

  const currentMonthEntries = useMemo(() => {
    return entries.filter((item) => item.written_month === currentMonth);
  }, [entries, currentMonth]);

  const bujjiCount = currentMonthEntries.filter(
    (item) => item.writer === "Bujji",
  ).length;

  const kannaCount = currentMonthEntries.filter(
    (item) => item.writer === "Kanna",
  ).length;

  const unlockedEntries = useMemo(() => {
    return entries.filter(
      (item) => item.unlock_date && item.unlock_date <= todayStr,
    );
  }, [entries, todayStr]);

  const lockedEntries = useMemo(() => {
    return entries.filter(
      (item) => item.unlock_date && item.unlock_date > todayStr,
    );
  }, [entries, todayStr]);

  const groupedUnlockedEntries = useMemo(() => {
    return unlockedEntries.reduce((acc, item) => {
      const month = item.written_month || "Unknown Month";
      if (!acc[month]) acc[month] = [];
      acc[month].push(item);
      return acc;
    }, {});
  }, [unlockedEntries]);

  return (
    <div className="app">
      <div className="hearts-bg">
        <span>❤️</span>
        <span>💗</span>
        <span>💕</span>
        <span>💖</span>
        <span>💘</span>
        <span>💞</span>
        <span>❤️</span>
        <span>💗</span>
        <span>💕</span>
        <span>💖</span>
        <span>💘</span>
        <span>💞</span>
        <span>❤️</span>
        <span>💗</span>
        <span>💕</span>
        <span>💖</span>
      </div>
      <div className="book">
        <h1>Little Things We Love ❤️</h1>

        <div className="card">
          <h2>Write a note</h2>

          <button
            className={writer === "Bujji" ? "active" : ""}
            onClick={() => setWriter("Bujji")}
          >
            Bujji
          </button>

          <button
            className={writer === "Kanna" ? "active" : ""}
            onClick={() => setWriter("Kanna")}
          >
            Kanna
          </button>

          <textarea
            placeholder="Write something sweet..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <p className="hint">
            This note will unlock automatically on next month 3rd.
          </p>

          <button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save note"}
          </button>

          {message && <p className="message">{message}</p>}
        </div>

        <div className="card">
          <h2>This Month Count</h2>
          <p>Bujji: {bujjiCount} points</p>
          <p>Kanna: {kannaCount} points</p>
        </div>

        {/* <div className="card">
          <h2>Locked Notes 🔒</h2>
          {lockedEntries.length === 0 ? (
            <p>No locked notes</p>
          ) : (
            lockedEntries.map((item) => (
              <div key={item.id} className="note locked">
                <p><strong>{item.writer}</strong> wrote a note</p>
                <p>Opens on: {item.unlock_date}</p>
              </div>
            ))
          )}
        </div> */}

        <div className="card">
          <h2>Unlocked Notes 📖</h2>
          {Object.keys(groupedUnlockedEntries).length === 0 ? (
            <p>No notes unlocked yet</p>
          ) : (
            Object.entries(groupedUnlockedEntries).map(([month, notes]) => (
              <details key={month} className="month-section">
                <summary>
                  {month} — {notes.length} note{notes.length > 1 ? "s" : ""}
                </summary>

                <div className="month-notes">
                  {notes.map((item) => (
                    <div key={item.id} className="note">
                      <p>
                        <strong>{item.writer}</strong>
                      </p>
                      <p>{item.text}</p>
                    </div>
                  ))}
                </div>
              </details>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function formatMonth(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getNextMonthThird(date) {
  const nextMonthThird = new Date(date.getFullYear(), date.getMonth() + 1, 3);
  return formatDate(nextMonthThird);
}
