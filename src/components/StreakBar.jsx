import { useState, useEffect } from "react";
import { fetchStreak, isLoggedIn } from "../services/userApi";

export default function StreakBar() {
  const [streak, setStreak] = useState(0);
  const [explored, setExplored] = useState(0);

  useEffect(() => {
    if (isLoggedIn()) {
      fetchStreak()
        .then(data => setStreak(data?.streak_count || 0))
        .catch(() => setStreak(0));
    } else {
      const s = parseInt(localStorage.getItem("afaq_streak") || "0");
      setStreak(s);
    }
    const e = parseInt(localStorage.getItem("afaq_explored") || "0");
    setExplored(e);

    // increment local streak daily
    const today = new Date().toDateString();
    const last = localStorage.getItem("afaq_last_visit");
    if (last !== today) {
      localStorage.setItem("afaq_last_visit", today);
      const newStreak = last ? parseInt(localStorage.getItem("afaq_streak") || "0") + 1 : 1;
      localStorage.setItem("afaq_streak", newStreak);
      setStreak(newStreak);
    }
  }, []);

  const dots = Array.from({ length: 7 }, (_, i) => i < Math.min(streak, 7));

  return (
    <div className="streak-bar">
      <div>
        <div className="streak-count">{streak}</div>
        <div className="streak-label">day streak · {explored} horizons explored</div>
      </div>
      <div className="streak-dots">
        {dots.map((active, i) => (
          <div key={i} className={`streak-dot ${active ? "active" : ""}`} />
        ))}
      </div>
    </div>
  );
}
