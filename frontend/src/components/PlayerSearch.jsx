import React, { useEffect, useState } from "react";
import Papa from "papaparse";

const PlayerSearch = () => {
  const [players, setPlayers] = useState([]);      // CSV 전체 데이터
  const [keyword, setKeyword] = useState("");      // 검색어
  const [filtered, setFiltered] = useState([]);    // 검색 결과

  // ✅ 1️⃣ CSV 불러오기 (컴포넌트가 처음 렌더링될 때 한 번 실행)
  useEffect(() => {
    fetch("/data/premier_league_players_ko.csv")
      .then((res) => res.text())
      .then((text) => {
        const result = Papa.parse(text, { header: true });
        setPlayers(result.data);
      });
  }, []);

  // ✅ 2️⃣ 검색 기능 (입력값이 바뀔 때마다 필터링)
  useEffect(() => {
    if (!keyword) {
      setFiltered([]);
      return;
    }

    const result = players.filter(
      (p) =>
        p.player_name_ko?.includes(keyword) ||
        p.player_name?.toLowerCase().includes(keyword.toLowerCase())
    );
    setFiltered(result);
  }, [keyword, players]);

  // ✅ 3️⃣ JSX (UI)
  return (
    <div style={{ padding: "20px", fontFamily: "Pretendard, sans-serif" }}>
      <h2>⚽ 프리미어리그 선수 검색</h2>

      <input
        type="text"
        placeholder="선수 이름(한글 또는 영어)"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        style={{
          width: "300px",
          padding: "8px",
          marginTop: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      />

      <ul style={{ marginTop: "20px" }}>
        {filtered.map((player, idx) => (
          <li key={idx} style={{ marginBottom: "6px" }}>
            {player.player_name_ko || player.player_name} — {player.team}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlayerSearch;
